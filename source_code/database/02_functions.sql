-- ==========================================
-- ANALYTICS FUNCTIONS FOR RICE SHOP SYSTEM
-- ==========================================
-- This file contains all PostgreSQL functions for analytics queries
-- These functions replace raw SQL in Java controllers
-- ==========================================

-- ==========================================
-- SALES ANALYTICS FUNCTIONS
-- ==========================================

-- 1. Time Series Revenue Analysis
CREATE OR REPLACE FUNCTION fn_sales_time_series(
    p_start_date TIMESTAMP,
    p_end_date TIMESTAMP,
    p_granularity TEXT DEFAULT 'day'
) RETURNS TABLE(
    time_bucket TIMESTAMP,
    total_orders BIGINT,
    total_revenue NUMERIC,
    avg_order_value NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        DATE_TRUNC(p_granularity, order_date) AS time_bucket,
        COUNT(order_id) AS total_orders,
        SUM(total_amount) AS total_revenue,
        AVG(total_amount) AS avg_order_value
    FROM orders
    WHERE status = 'COMPLETED'
      AND order_date >= p_start_date
      AND order_date < p_end_date
    GROUP BY 1
    ORDER BY 1;
END;
$$ LANGUAGE plpgsql;

-- 2. Channel Mix Analysis
CREATE OR REPLACE FUNCTION fn_sales_channel_mix(
    p_start_date TIMESTAMP,
    p_end_date TIMESTAMP
) RETURNS TABLE(
    order_type TEXT,
    transaction_count BIGINT,
    revenue_volume NUMERIC,
    percentage NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        o.order_type::TEXT,
        COUNT(order_id) AS transaction_count,
        SUM(total_amount) AS revenue_volume,
        ROUND((SUM(total_amount) * 100.0 / SUM(SUM(total_amount)) OVER ()), 2) AS percentage
    FROM orders o
    WHERE status = 'COMPLETED'
      AND order_date >= p_start_date
      AND order_date < p_end_date
    GROUP BY o.order_type;
END;
$$ LANGUAGE plpgsql;

-- 3. Payment Mix Analysis
CREATE OR REPLACE FUNCTION fn_sales_payment_mix(
    p_start_date TIMESTAMP,
    p_end_date TIMESTAMP
) RETURNS TABLE(
    payment_method TEXT,
    transaction_count BIGINT,
    revenue_volume NUMERIC,
    percentage NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        o.payment_method::TEXT,
        COUNT(order_id) AS transaction_count,
        SUM(total_amount) AS revenue_volume,
        ROUND((SUM(total_amount) * 100.0 / SUM(SUM(total_amount)) OVER ()), 2) AS percentage
    FROM orders o
    WHERE status = 'COMPLETED'
      AND order_date >= p_start_date
      AND order_date < p_end_date
    GROUP BY o.payment_method;
END;
$$ LANGUAGE plpgsql;

-- 4. Sales KPI Summary
CREATE OR REPLACE FUNCTION fn_sales_kpi(
    p_start_date TIMESTAMP,
    p_end_date TIMESTAMP
) RETURNS TABLE(
    completed_orders BIGINT,
    total_orders BIGINT,
    completion_rate NUMERIC,
    total_revenue NUMERIC,
    avg_order_value NUMERIC,
    unique_customers BIGINT,
    growth_rate NUMERIC,
    previous_revenue NUMERIC,
    cogs NUMERIC,
    gross_profit NUMERIC,
    gross_margin_pct NUMERIC
) AS $$
DECLARE
    v_days_diff INTEGER;
    v_prev_start TIMESTAMP;
    v_prev_end TIMESTAMP;
    v_current_revenue NUMERIC;
    v_prev_revenue NUMERIC;
    v_cogs NUMERIC;
BEGIN
    -- Calculate previous period
    v_days_diff := EXTRACT(EPOCH FROM (p_end_date - p_start_date)) / 86400;
    v_prev_end := p_start_date;
    v_prev_start := p_start_date - (v_days_diff || ' days')::INTERVAL;

    -- Get current period stats
    SELECT 
        COUNT(CASE WHEN status = 'COMPLETED' THEN 1 END),
        COUNT(*),
        ROUND(COUNT(CASE WHEN status = 'COMPLETED' THEN 1 END) * 100.0 / NULLIF(COUNT(*), 0), 2),
        COALESCE(SUM(CASE WHEN status = 'COMPLETED' THEN total_amount ELSE 0 END), 0),
        COALESCE(AVG(CASE WHEN status = 'COMPLETED' THEN total_amount END), 0),
        COUNT(DISTINCT user_id)
    INTO completed_orders, total_orders, completion_rate, total_revenue, avg_order_value, unique_customers
    FROM orders
    WHERE order_date >= p_start_date AND order_date < p_end_date;

    v_current_revenue := total_revenue;

    -- Get previous period revenue
    SELECT COALESCE(SUM(total_amount), 0)
    INTO v_prev_revenue
    FROM orders
    WHERE status = 'COMPLETED'
      AND order_date >= v_prev_start AND order_date < v_prev_end;

    previous_revenue := v_prev_revenue;

    -- Calculate growth rate
    IF v_prev_revenue > 0 THEN
        growth_rate := ROUND(((v_current_revenue - v_prev_revenue) / v_prev_revenue) * 100, 2);
    ELSE
        growth_rate := 0;
    END IF;

    -- Calculate COGS
    SELECT COALESCE(SUM(quantity * unit_price), 0)
    INTO v_cogs
    FROM stock_transactions
    WHERE type = 'OUT'
      AND created_at >= p_start_date AND created_at < p_end_date;

    cogs := v_cogs;
    gross_profit := v_current_revenue - v_cogs;
    
    IF v_current_revenue > 0 THEN
        gross_margin_pct := ROUND((gross_profit / v_current_revenue) * 100, 2);
    ELSE
        gross_margin_pct := 0;
    END IF;

    RETURN NEXT;
END;
$$ LANGUAGE plpgsql;

-- 5. Top Products Analysis
CREATE OR REPLACE FUNCTION fn_sales_top_products(
    p_start_date TIMESTAMP,
    p_end_date TIMESTAMP,
    p_limit INTEGER DEFAULT 10
) RETURNS TABLE(
    product_id BIGINT,
    product_name TEXT,
    category TEXT,
    total_quantity BIGINT,
    total_revenue NUMERIC,
    order_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.product_id,
        p.name::TEXT AS product_name,
        p.category::TEXT,
        SUM(oi.quantity) AS total_quantity,
        SUM(oi.quantity * oi.price_at_purchase) AS total_revenue,
        COUNT(DISTINCT oi.order_id) AS order_count
    FROM order_items oi
    JOIN products p ON oi.product_id = p.product_id
    JOIN orders o ON oi.order_id = o.order_id
    WHERE o.status = 'COMPLETED'
      AND o.order_date >= p_start_date
      AND o.order_date < p_end_date
    GROUP BY p.product_id, p.name, p.category
    ORDER BY total_revenue DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- 6. Hourly Distribution
CREATE OR REPLACE FUNCTION fn_sales_hourly_distribution(
    p_start_date TIMESTAMP,
    p_end_date TIMESTAMP
) RETURNS TABLE(
    hour_of_day INTEGER,
    order_count BIGINT,
    revenue NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        EXTRACT(HOUR FROM order_date)::INTEGER AS hour_of_day,
        COUNT(order_id) AS order_count,
        SUM(total_amount) AS revenue
    FROM orders
    WHERE status = 'COMPLETED'
      AND order_date >= p_start_date
      AND order_date < p_end_date
    GROUP BY EXTRACT(HOUR FROM order_date)
    ORDER BY hour_of_day;
END;
$$ LANGUAGE plpgsql;

-- ==========================================
-- SUPPLY CHAIN ANALYTICS FUNCTIONS
-- ==========================================

-- Helper: Get inventory value at a specific date
CREATE OR REPLACE FUNCTION fn_supply_inventory_value_at_date(
    p_date TIMESTAMP
) RETURNS NUMERIC AS $$
DECLARE
    v_value NUMERIC;
BEGIN
    SELECT COALESCE(SUM(
        COALESCE((
            SELECT SUM(CASE WHEN st.type = 'IN' THEN st.quantity ELSE -st.quantity END)
            FROM stock_transactions st
            WHERE st.material_id = m.material_id AND st.created_at < p_date
        ), 0) * m.unit_price
    ), 0)
    INTO v_value
    FROM materials m;
    
    RETURN v_value;
END;
$$ LANGUAGE plpgsql;

-- 1. Inventory Turnover Analysis
CREATE OR REPLACE FUNCTION fn_supply_turnover(
    p_start_date TIMESTAMP,
    p_end_date TIMESTAMP
) RETURNS TABLE(
    material_id BIGINT,
    name TEXT,
    unit TEXT,
    unit_price NUMERIC,
    start_qty NUMERIC,
    end_qty NUMERIC,
    consumed_qty NUMERIC,
    cogs NUMERIC,
    avg_inventory_qty NUMERIC,
    avg_inventory_value NUMERIC,
    turnover_ratio NUMERIC,
    days_on_hand NUMERIC
) AS $$
DECLARE
    v_days_between INTEGER;
BEGIN
    v_days_between := EXTRACT(EPOCH FROM (p_end_date - p_start_date)) / 86400 + 1;
    
    RETURN QUERY
    WITH start_inventory AS (
        SELECT 
            m.material_id,
            COALESCE(SUM(CASE WHEN st.type = 'IN' THEN st.quantity ELSE -st.quantity END), 0) as start_qty
        FROM materials m
        LEFT JOIN stock_transactions st ON m.material_id = st.material_id
            AND st.created_at < p_start_date
        GROUP BY m.material_id
    ),
    end_inventory AS (
        SELECT 
            m.material_id,
            COALESCE(SUM(CASE WHEN st.type = 'IN' THEN st.quantity ELSE -st.quantity END), 0) as end_qty
        FROM materials m
        LEFT JOIN stock_transactions st ON m.material_id = st.material_id
            AND st.created_at < p_end_date
        GROUP BY m.material_id
    ),
    cogs_data AS (
        SELECT 
            st.material_id,
            SUM(st.quantity * st.unit_price) as cogs,
            SUM(st.quantity) as out_qty
        FROM stock_transactions st
        WHERE st.type = 'OUT'
            AND st.created_at >= p_start_date AND st.created_at < p_end_date
        GROUP BY st.material_id
    )
    SELECT 
        m.material_id,
        m.name::TEXT,
        m.unit::TEXT,
        m.unit_price,
        COALESCE(si.start_qty, 0) as start_qty,
        COALESCE(ei.end_qty, 0) as end_qty,
        COALESCE(c.out_qty, 0) as consumed_qty,
        COALESCE(c.cogs, 0) as cogs,
        ROUND((COALESCE(si.start_qty, 0) + COALESCE(ei.end_qty, 0)) / 2.0, 2) as avg_inventory_qty,
        ROUND(((COALESCE(si.start_qty, 0) + COALESCE(ei.end_qty, 0)) / 2.0) * m.unit_price, 0) as avg_inventory_value,
        ROUND(
            COALESCE(c.cogs, 0) /
            NULLIF(((COALESCE(si.start_qty, 0) + COALESCE(ei.end_qty, 0)) / 2.0) * m.unit_price, 0),
        2) as turnover_ratio,
        CASE WHEN COALESCE(c.cogs, 0) > 0 THEN
            ROUND(
                (((COALESCE(si.start_qty, 0) + COALESCE(ei.end_qty, 0)) / 2.0) * m.unit_price) /
                (COALESCE(c.cogs, 0) / v_days_between) * v_days_between,
            0)
        ELSE NULL END as days_on_hand
    FROM materials m
    LEFT JOIN start_inventory si ON m.material_id = si.material_id
    LEFT JOIN end_inventory ei ON m.material_id = ei.material_id
    LEFT JOIN cogs_data c ON m.material_id = c.material_id
    ORDER BY turnover_ratio DESC NULLS LAST;
END;
$$ LANGUAGE plpgsql;

-- 2. ABC Analysis
CREATE OR REPLACE FUNCTION fn_supply_abc_analysis(
    p_start_date TIMESTAMP,
    p_end_date TIMESTAMP
) RETURNS TABLE(
    material_id BIGINT,
    name TEXT,
    unit TEXT,
    rank BIGINT,
    total_value NUMERIC,
    total_quantity NUMERIC,
    transaction_count BIGINT,
    value_pct NUMERIC,
    cumulative_pct NUMERIC,
    abc_class TEXT
) AS $$
BEGIN
    RETURN QUERY
    WITH material_usage AS (
        SELECT 
            m.material_id,
            m.name,
            m.unit,
            SUM(st.quantity * st.unit_price) as total_value,
            SUM(st.quantity) as total_quantity,
            COUNT(*) as transaction_count
        FROM materials m
        JOIN stock_transactions st ON m.material_id = st.material_id
        WHERE st.type = 'OUT' 
          AND st.created_at >= p_start_date 
          AND st.created_at < p_end_date
        GROUP BY m.material_id, m.name, m.unit
    ),
    ranked AS (
        SELECT mu.*,
            SUM(mu.total_value) OVER (ORDER BY mu.total_value DESC) as running_total,
            SUM(mu.total_value) OVER () as grand_total,
            ROW_NUMBER() OVER (ORDER BY mu.total_value DESC) as rank
        FROM material_usage mu
    )
    SELECT 
        r.material_id,
        r.name::TEXT,
        r.unit::TEXT,
        r.rank,
        r.total_value,
        r.total_quantity,
        r.transaction_count,
        ROUND(r.total_value / NULLIF(r.grand_total, 0) * 100, 2) as value_pct,
        ROUND((r.running_total / NULLIF(r.grand_total, 0)) * 100, 2) as cumulative_pct,
        CASE 
            WHEN (r.running_total / NULLIF(r.grand_total, 0)) * 100 <= 80 THEN 'A'
            WHEN (r.running_total / NULLIF(r.grand_total, 0)) * 100 <= 95 THEN 'B'
            ELSE 'C'
        END as abc_class
    FROM ranked r
    ORDER BY r.total_value DESC;
END;
$$ LANGUAGE plpgsql;

-- 3. Reorder Alerts
CREATE OR REPLACE FUNCTION fn_supply_reorder_alerts()
RETURNS TABLE(
    material_id BIGINT,
    name TEXT,
    unit TEXT,
    quantity_in_stock NUMERIC,
    current_min NUMERIC,
    avg_daily_usage NUMERIC,
    usage_std_dev NUMERIC,
    reorder_point NUMERIC,
    days_until_stockout NUMERIC,
    suggested_order_qty NUMERIC,
    alert_status TEXT
) AS $$
BEGIN
    RETURN QUERY
    WITH daily_usage AS (
        SELECT 
            st.material_id,
            DATE(st.created_at) as usage_date,
            SUM(st.quantity) as daily_out
        FROM stock_transactions st
        WHERE st.type = 'OUT'
          AND st.created_at >= CURRENT_DATE - INTERVAL '30 days'
        GROUP BY st.material_id, DATE(st.created_at)
    ),
    avg_usage AS (
        SELECT 
            du.material_id,
            ROUND(AVG(du.daily_out), 2) as adu,
            ROUND(STDDEV(du.daily_out), 2) as std_dev,
            COUNT(*) as days_with_usage
        FROM daily_usage du
        GROUP BY du.material_id
    )
    SELECT 
        m.material_id,
        m.name::TEXT,
        m.unit::TEXT,
        ROUND(m.quantity_in_stock, 2) as quantity_in_stock,
        m.min_stock_level as current_min,
        COALESCE(au.adu, 0) as avg_daily_usage,
        COALESCE(au.std_dev, 0) as usage_std_dev,
        ROUND(COALESCE(au.adu, 0) * 3 + COALESCE(au.adu, 0) * 1.5, 2) as reorder_point,
        CASE WHEN au.adu > 0 THEN ROUND(m.quantity_in_stock / au.adu, 1)
             ELSE NULL END as days_until_stockout,
        CASE WHEN au.adu > 0 THEN ROUND(GREATEST(au.adu * 14 - m.quantity_in_stock, 0), 0)
             ELSE 0 END as suggested_order_qty,
        CASE 
            WHEN m.quantity_in_stock <= 0 THEN 'OUT_OF_STOCK'
            WHEN m.quantity_in_stock <= COALESCE(au.adu, 0) * 3 THEN 'CRITICAL'
            WHEN m.quantity_in_stock <= COALESCE(au.adu, 0) * 3 + COALESCE(au.adu, 0) * 1.5 THEN 'URGENT'
            WHEN m.quantity_in_stock <= COALESCE(au.adu, 0) * 7 THEN 'WARNING'
            ELSE 'OK'
        END as alert_status
    FROM materials m
    LEFT JOIN avg_usage au ON m.material_id = au.material_id
    ORDER BY 
        CASE 
            WHEN m.quantity_in_stock <= 0 THEN 0
            WHEN m.quantity_in_stock <= COALESCE(au.adu, 0) * 3 THEN 1
            WHEN m.quantity_in_stock <= COALESCE(au.adu, 0) * 3 + COALESCE(au.adu, 0) * 1.5 THEN 2
            WHEN m.quantity_in_stock <= COALESCE(au.adu, 0) * 7 THEN 3
            ELSE 4
        END,
        CASE WHEN au.adu > 0 THEN m.quantity_in_stock / au.adu ELSE 9999 END;
END;
$$ LANGUAGE plpgsql;

-- 4. Stock Movement Timeline
CREATE OR REPLACE FUNCTION fn_supply_stock_movement(
    p_start_date TIMESTAMP,
    p_end_date TIMESTAMP
) RETURNS TABLE(
    movement_date DATE,
    total_in_value NUMERIC,
    total_out_value NUMERIC,
    net_change NUMERIC,
    total_in_quantity NUMERIC,
    total_out_quantity NUMERIC,
    in_transactions BIGINT,
    out_transactions BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        DATE(created_at) as movement_date,
        SUM(CASE WHEN type = 'IN' THEN quantity * st.unit_price ELSE 0 END) as total_in_value,
        SUM(CASE WHEN type = 'OUT' THEN quantity * st.unit_price ELSE 0 END) as total_out_value,
        SUM(CASE WHEN type = 'IN' THEN quantity ELSE -quantity END * st.unit_price) as net_change,
        SUM(CASE WHEN type = 'IN' THEN quantity ELSE 0 END) as total_in_quantity,
        SUM(CASE WHEN type = 'OUT' THEN quantity ELSE 0 END) as total_out_quantity,
        COUNT(CASE WHEN type = 'IN' THEN 1 END) as in_transactions,
        COUNT(CASE WHEN type = 'OUT' THEN 1 END) as out_transactions
    FROM stock_transactions st
    WHERE created_at >= p_start_date AND created_at < p_end_date
    GROUP BY DATE(created_at)
    ORDER BY movement_date;
END;
$$ LANGUAGE plpgsql;

-- ==========================================
-- PRODUCT ANALYTICS FUNCTIONS
-- ==========================================

-- 1. BCG Matrix Analysis
CREATE OR REPLACE FUNCTION fn_product_bcg_matrix(
    p_start_date TIMESTAMP,
    p_end_date TIMESTAMP
) RETURNS TABLE(
    product_id BIGINT,
    name TEXT,
    category TEXT,
    total_quantity BIGINT,
    total_revenue NUMERIC,
    avg_quantity NUMERIC,
    avg_revenue NUMERIC,
    bcg_category TEXT
) AS $$
BEGIN
    RETURN QUERY
    WITH product_metrics AS (
        SELECT 
            p.product_id,
            p.name,
            p.category,
            SUM(oi.quantity) as total_quantity,
            SUM(oi.quantity * oi.price_at_purchase) as total_revenue
        FROM order_items oi
        JOIN orders o ON oi.order_id = o.order_id
        JOIN products p ON oi.product_id = p.product_id
        WHERE o.status = 'COMPLETED' 
          AND o.order_date >= p_start_date AND o.order_date < p_end_date
        GROUP BY p.product_id, p.name, p.category
    ),
    averages AS (
        SELECT AVG(pm.total_quantity) as avg_qty, AVG(pm.total_revenue) as avg_rev
        FROM product_metrics pm
    )
    SELECT 
        pm.product_id,
        pm.name::TEXT,
        pm.category::TEXT,
        pm.total_quantity,
        pm.total_revenue,
        ROUND(a.avg_qty, 2) as avg_quantity,
        ROUND(a.avg_rev, 2) as avg_revenue,
        CASE 
            WHEN pm.total_quantity >= a.avg_qty AND pm.total_revenue >= a.avg_rev THEN 'STAR'
            WHEN pm.total_quantity < a.avg_qty AND pm.total_revenue >= a.avg_rev THEN 'CASH_COW'
            WHEN pm.total_quantity >= a.avg_qty AND pm.total_revenue < a.avg_rev THEN 'QUESTION'
            ELSE 'DOG'
        END as bcg_category
    FROM product_metrics pm, averages a
    ORDER BY pm.total_revenue DESC;
END;
$$ LANGUAGE plpgsql;

-- 2. Combo Suggestions
CREATE OR REPLACE FUNCTION fn_product_combo_suggestions(
    p_limit INTEGER DEFAULT 10
) RETURNS TABLE(
    product_a TEXT,
    product_b TEXT,
    pair_count BIGINT,
    support_pct NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p1.name::TEXT as product_a,
        p2.name::TEXT as product_b,
        COUNT(*) as pair_count,
        ROUND(COUNT(*) * 100.0 / NULLIF((SELECT COUNT(*) FROM orders WHERE status='COMPLETED'), 0), 2) as support_pct
    FROM order_items oi1
    JOIN order_items oi2 ON oi1.order_id = oi2.order_id
    JOIN products p1 ON oi1.product_id = p1.product_id
    JOIN products p2 ON oi2.product_id = p2.product_id
    WHERE oi1.product_id < oi2.product_id
    GROUP BY p1.name, p2.name
    ORDER BY pair_count DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- 3. Period Trend (Weekly Trend)
CREATE OR REPLACE FUNCTION fn_product_weekly_trend(
    p_start_date TIMESTAMP,
    p_end_date TIMESTAMP
) RETURNS TABLE(
    product_id BIGINT,
    name TEXT,
    this_period BIGINT,
    last_period BIGINT,
    growth_pct NUMERIC,
    trend TEXT
) AS $$
DECLARE
    v_days_diff INTEGER;
    v_prev_start TIMESTAMP;
    v_prev_end TIMESTAMP;
BEGIN
    v_days_diff := EXTRACT(EPOCH FROM (p_end_date - p_start_date)) / 86400 + 1;
    v_prev_end := p_start_date - INTERVAL '1 day';
    v_prev_start := v_prev_end - (v_days_diff || ' days')::INTERVAL + INTERVAL '1 day';

    RETURN QUERY
    SELECT 
        p.product_id,
        p.name::TEXT,
        COALESCE(curr.qty, 0) as this_period,
        COALESCE(prev.qty, 0) as last_period,
        CASE 
            WHEN COALESCE(prev.qty, 0) = 0 AND COALESCE(curr.qty, 0) > 0 THEN 100.0
            WHEN COALESCE(prev.qty, 0) = 0 THEN 0.0
            ELSE ROUND((COALESCE(curr.qty, 0) - prev.qty) * 100.0 / prev.qty, 1)
        END as growth_pct,
        CASE 
            WHEN COALESCE(curr.qty, 0) > COALESCE(prev.qty, 0) THEN 'UP'
            WHEN COALESCE(curr.qty, 0) < COALESCE(prev.qty, 0) THEN 'DOWN'
            ELSE 'STABLE'
        END as trend
    FROM products p
    LEFT JOIN (
        SELECT oi.product_id, SUM(oi.quantity) as qty
        FROM order_items oi
        JOIN orders o ON oi.order_id = o.order_id
        WHERE o.status = 'COMPLETED'
          AND o.order_date >= p_start_date AND o.order_date < p_end_date
        GROUP BY oi.product_id
    ) curr ON p.product_id = curr.product_id
    LEFT JOIN (
        SELECT oi.product_id, SUM(oi.quantity) as qty
        FROM order_items oi
        JOIN orders o ON oi.order_id = o.order_id
        WHERE o.status = 'COMPLETED'
          AND o.order_date >= v_prev_start AND o.order_date < v_prev_end + INTERVAL '1 day'
        GROUP BY oi.product_id
    ) prev ON p.product_id = prev.product_id
    WHERE COALESCE(curr.qty, 0) > 0 OR COALESCE(prev.qty, 0) > 0
    ORDER BY growth_pct DESC;
END;
$$ LANGUAGE plpgsql;

-- ==========================================
-- WORKFORCE ANALYTICS FUNCTIONS
-- ==========================================

-- 1. Process Time Analysis
CREATE OR REPLACE FUNCTION fn_workforce_process_time(
    p_start_date TIMESTAMP,
    p_end_date TIMESTAMP
) RETURNS TABLE(
    avg_confirm_min NUMERIC,
    avg_cooking_min NUMERIC,
    avg_pickup_min NUMERIC,
    avg_total_min NUMERIC,
    total_orders BIGINT
) AS $$
BEGIN
    RETURN QUERY
    WITH status_timestamps AS (
        SELECT 
            osh.order_id,
            MAX(CASE WHEN osh.status = 'PENDING' THEN osh.changed_at END) as t_pending,
            MAX(CASE WHEN osh.status = 'PREPARING' THEN osh.changed_at END) as t_preparing,
            MAX(CASE WHEN osh.status = 'READY' THEN osh.changed_at END) as t_ready,
            MAX(CASE WHEN osh.status = 'COMPLETED' THEN osh.changed_at END) as t_completed
        FROM order_status_history osh
        JOIN orders o ON osh.order_id = o.order_id
        WHERE o.order_date >= p_start_date AND o.order_date < p_end_date
        GROUP BY osh.order_id
    )
    SELECT 
        ROUND(AVG(EXTRACT(EPOCH FROM (t_preparing - t_pending))/60)::numeric, 2) as avg_confirm_min,
        ROUND(AVG(EXTRACT(EPOCH FROM (t_ready - t_preparing))/60)::numeric, 2) as avg_cooking_min,
        ROUND(AVG(EXTRACT(EPOCH FROM (t_completed - t_ready))/60)::numeric, 2) as avg_pickup_min,
        ROUND(AVG(EXTRACT(EPOCH FROM (t_completed - t_pending))/60)::numeric, 2) as avg_total_min,
        COUNT(*) as total_orders
    FROM status_timestamps
    WHERE t_pending IS NOT NULL AND t_completed IS NOT NULL;
END;
$$ LANGUAGE plpgsql;

-- 2. Staff Ranking
CREATE OR REPLACE FUNCTION fn_workforce_staff_ranking(
    p_start_date TIMESTAMP,
    p_end_date TIMESTAMP
) RETURNS TABLE(
    user_id BIGINT,
    full_name TEXT,
    total_shifts BIGINT,
    total_orders BIGINT,
    total_revenue NUMERIC,
    total_hours NUMERIC,
    revenue_per_hour NUMERIC,
    rank BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.user_id,
        u.full_name::TEXT,
        COUNT(s.shift_id) as total_shifts,
        COALESCE(SUM(s.total_orders), 0) as total_orders,
        COALESCE(SUM(s.total_revenue), 0) as total_revenue,
        ROUND(COALESCE(SUM(EXTRACT(EPOCH FROM (s.end_time - s.start_time))/3600), 0)::numeric, 1) as total_hours,
        CASE
            WHEN SUM(EXTRACT(EPOCH FROM (s.end_time - s.start_time))/3600) > 0
            THEN ROUND((SUM(s.total_revenue) / SUM(EXTRACT(EPOCH FROM (s.end_time - s.start_time))/3600))::numeric, 0)
            ELSE 0
        END as revenue_per_hour,
        DENSE_RANK() OVER (
            ORDER BY CASE
                WHEN SUM(EXTRACT(EPOCH FROM (s.end_time - s.start_time))/3600) > 0
                THEN SUM(s.total_revenue) / SUM(EXTRACT(EPOCH FROM (s.end_time - s.start_time))/3600)
                ELSE 0
            END DESC
        ) as rank
    FROM shifts s
    JOIN users u ON s.cashier_id = u.user_id
    WHERE s.status = 'CLOSED' AND s.end_time IS NOT NULL
      AND s.start_time >= p_start_date AND s.start_time < p_end_date
    GROUP BY u.user_id, u.full_name
    ORDER BY rank;
END;
$$ LANGUAGE plpgsql;

-- 3. Shift Reconciliation
CREATE OR REPLACE FUNCTION fn_workforce_reconciliation(
    p_start_date TIMESTAMP,
    p_end_date TIMESTAMP
) RETURNS TABLE(
    shift_id BIGINT,
    full_name TEXT,
    start_time TIMESTAMP,
    end_time TIMESTAMP,
    total_orders INTEGER,
    total_revenue NUMERIC,
    system_cash NUMERIC,
    declared_cash NUMERIC,
    variance NUMERIC,
    status TEXT
) AS $$
BEGIN
    RETURN QUERY
    WITH system_cash AS (
        SELECT o.shift_id, COALESCE(SUM(o.total_amount), 0) as calc_cash
        FROM orders o
        WHERE o.payment_method = 'CASH' AND o.status = 'COMPLETED'
        GROUP BY o.shift_id
    )
    SELECT 
        s.shift_id,
        u.full_name::TEXT,
        s.start_time,
        s.end_time,
        s.total_orders,
        s.total_revenue,
        COALESCE(sc.calc_cash, 0) as system_cash,
        s.cash_revenue as declared_cash,
        (s.cash_revenue - COALESCE(sc.calc_cash, 0)) as variance,
        CASE 
            WHEN ABS(s.cash_revenue - COALESCE(sc.calc_cash, 0)) > 50000 THEN 'CRITICAL'
            WHEN ABS(s.cash_revenue - COALESCE(sc.calc_cash, 0)) > 10000 THEN 'WARNING'
            ELSE 'OK'
        END as status
    FROM shifts s
    JOIN users u ON s.cashier_id = u.user_id
    LEFT JOIN system_cash sc ON s.shift_id = sc.shift_id
    WHERE s.status = 'CLOSED'
      AND s.start_time >= p_start_date AND s.start_time < p_end_date
    ORDER BY s.start_time DESC;
END;
$$ LANGUAGE plpgsql;

-- 4. Hourly Heatmap
CREATE OR REPLACE FUNCTION fn_workforce_hourly_heatmap(
    p_start_date TIMESTAMP,
    p_end_date TIMESTAMP
) RETURNS TABLE(
    day_of_week INTEGER,
    hour INTEGER,
    order_count BIGINT,
    revenue NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        EXTRACT(DOW FROM order_date)::INTEGER as day_of_week,
        EXTRACT(HOUR FROM order_date)::INTEGER as hour,
        COUNT(*) as order_count,
        COALESCE(SUM(total_amount), 0) as revenue
    FROM orders
    WHERE status = 'COMPLETED'
      AND order_date >= p_start_date AND order_date < p_end_date
    GROUP BY day_of_week, hour
    ORDER BY day_of_week, hour;
END;
$$ LANGUAGE plpgsql;

-- ==========================================
-- END OF ANALYTICS FUNCTIONS
-- ==========================================
