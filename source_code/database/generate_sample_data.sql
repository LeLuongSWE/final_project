-- ============================================
-- SCRIPT: Generate Analytics Sample Data
-- Purpose: Create realistic data for 30-day period
-- Strategy: Follow proper workflow (users -> shifts -> orders -> items)
-- ============================================

-- Step 1: Generate Customer Users (for ONLINE orders)
INSERT INTO users (username, password, full_name, role_id, phone, created_at) VALUES
-- Active customers (registered in Dec 2025)
('customer01', '$2a$10$8ZqX3Z0q3Z0q3Z0q3Z0q3u', 'Nguyễn Văn A', 4, '0901234567', '2025-12-01 10:30:00'),
('customer02', '$2a$10$8ZqX3Z0q3Z0q3Z0q3Z0q3u', 'Trần Thị B', 4, '0901234568', '2025-12-03 14:20:00'),
('customer03', '$2a$10$8ZqX3Z0q3Z0q3Z0q3Z0q3u', 'Lê Văn C', 4, '0901234569', '2025-12-05 09:15:00'),
('customer04', '$2a$10$8ZqX3Z0q3Z0q3Z0q3Z0q3u', 'Phạm Thị D', 4, '0901234570', '2025-12-07 16:45:00'),
('customer05', '$2a$10$8ZqX3Z0q3Z0q3Z0q3Z0q3u', 'Hoàng Văn E', 4, '0901234571', '2025-12-10 11:00:00'),
('customer06', '$2a$10$8ZqX3Z0q3Z0q3Z0q3Z0q3u', 'Vũ Thị F', 4, '0901234572', '2025-12-12 13:30:00'),
('customer07', '$2a$10$8ZqX3Z0q3Z0q3Z0q3Z0q3u', 'Đặng Văn G', 4, '0901234573', '2025-12-15 10:00:00'),
('customer08', '$2a$10$8ZqX3Z0q3Z0q3Z0q3Z0q3u', 'Bùi Thị H', 4, '0901234574', '2025-12-18 15:20:00'),
('customer09', '$2a$10$8ZqX3Z0q3Z0q3Z0q3Z0q3u', 'Đinh Văn I', 4, '0901234575', '2025-12-20 09:45:00'),
('customer10', '$2a$10$8ZqX3Z0q3Z0q3Z0q3Z0q3u', 'Võ Thị K', 4, '0901234576', '2025-12-22 12:15:00'),
-- Recent customers (registered in Jan 2026)
('customer11', '$2a$10$8ZqX3Z0q3Z0q3Z0q3Z0q3u', 'Dương Văn L', 4, '0901234577', '2026-01-02 10:30:00'),
('customer12', '$2a$10$8ZqX3Z0q3Z0q3Z0q3Z0q3u', 'Lý Thị M', 4, '0901234578', '2026-01-04 14:00:00'),
('customer13', '$2a$10$8ZqX3Z0q3Z0q3Z0q3Z0q3u', 'Tô Văn N', 4, '0901234579', '2026-01-06 11:20:00'),
('customer14', '$2a$10$8ZqX3Z0q3Z0q3Z0q3Z0q3u', 'Hồ Thị O', 4, '0901234580', '2026-01-08 09:00:00'),
('customer15', '$2a$10$8ZqX3Z0q3Z0q3Z0q3Z0q3u', 'Mai Văn P', 4, '0901234581', '2026-01-10 13:45:00');

-- Step 2: Create additional cashiers for shifts
INSERT INTO users (username, password, full_name, role_id) VALUES
('cashier2', '$2a$10$abcdefghijklmnopqrstuu', 'Nguyễn Thu Hà', 2),
('cashier3', '$2a$10$abcdefghijklmnopqrstuu', 'Trần Minh Tuấn', 2);

-- Step 3: Generate 60 Shifts (2 shifts/day for 30 days)
-- Shift pattern: Morning (8am-2pm) and Evening (5pm-11pm)
DO $$
DECLARE
    shift_date DATE;
    morning_start TIMESTAMP;
    morning_end TIMESTAMP;
    evening_start TIMESTAMP;
    evening_end TIMESTAMP;
    morning_revenue DECIMAL;
    evening_revenue DECIMAL;
    morning_orders INT;
    evening_orders INT;
    cashier_morning BIGINT;
    cashier_evening BIGINT;
BEGIN
    FOR i IN 0..29 LOOP
        shift_date := '2026-01-01'::DATE + i;
        
        -- Morning shift (8am-2pm)
        morning_start := shift_date + INTERVAL '8 hours';
        morning_end := shift_date + INTERVAL '14 hours';
        morning_orders := 15 + floor(random() * 10)::INT; -- 15-25 orders
        morning_revenue := (morning_orders * (35000 + random() * 15000))::DECIMAL(15,2);
        cashier_morning := (SELECT user_id FROM users WHERE username IN ('testuser', 'cashier2') ORDER BY random() LIMIT 1);
        
        INSERT INTO shifts (cashier_id, start_time, end_time, status, total_orders, total_revenue, cash_revenue, transfer_revenue)
        VALUES (
            cashier_morning,
            morning_start,
            morning_end,
            'CLOSED',
            morning_orders,
            morning_revenue,
            (morning_revenue * 0.3)::DECIMAL(15,2), -- 30% cash
            (morning_revenue * 0.7)::DECIMAL(15,2)  -- 70% transfer
        );
        
        -- Evening shift (5pm-11pm)
        evening_start := shift_date + INTERVAL '17 hours';
        evening_end := shift_date + INTERVAL '23 hours';
        evening_orders := 20 + floor(random() * 15)::INT; -- 20-35 orders
        evening_revenue := (evening_orders * (40000 + random() * 20000))::DECIMAL(15,2);
        cashier_evening := (SELECT user_id FROM users WHERE username IN ('testuser', 'cashier2', 'cashier3') ORDER BY random() LIMIT 1);
        
        INSERT INTO shifts (cashier_id, start_time, end_time, status, total_orders, total_revenue, cash_revenue, transfer_revenue)
        VALUES (
            cashier_evening,
            evening_start,
            evening_end,
            'CLOSED',
            evening_orders,
            evening_revenue,
            (evening_revenue * 0.25)::DECIMAL(15,2), -- 25% cash
            (evening_revenue * 0.75)::DECIMAL(15,2)  -- 75% transfer
        );
    END LOOP;
END $$;

-- Step 4: Generate Orders (400 orders over 30 days)
-- Distribution: 60% ONLINE (with user_id), 40% INSTORE (with table_number)
DO $$
DECLARE
    order_date TIMESTAMP;
    order_type_val VARCHAR(20);
    payment_val VARCHAR(20);
    user_val BIGINT;
    table_val VARCHAR(10);
    shift_val BIGINT;
    cashier_val BIGINT;
    total_amt DECIMAL(15,2);
    order_code_val VARCHAR(20);
    order_id_val BIGINT;
    num_items INT;
    product_list BIGINT[];
BEGIN
    FOR i IN 1..400 LOOP
        -- Random date in Jan 2026
        order_date := '2026-01-01'::TIMESTAMP + (random() * 29 || ' days')::INTERVAL;
        
        -- Add random hour (8am-10pm with peak at lunch/dinner)
        IF random() < 0.35 THEN
            order_date := order_date + INTERVAL '11 hours' + (random() * 2 || ' hours')::INTERVAL; -- Lunch peak
        ELSIF random() < 0.65 THEN
            order_date := order_date + INTERVAL '18 hours' + (random() * 2 || ' hours')::INTERVAL; -- Dinner peak
        ELSE
            order_date := order_date + INTERVAL '8 hours' + (random() * 14 || ' hours')::INTERVAL; -- Other times
        END IF;
        
        -- Find appropriate shift
        shift_val := (SELECT shift_id FROM shifts 
                     WHERE start_time <= order_date AND end_time >= order_date 
                     LIMIT 1);
        
        IF shift_val IS NULL THEN
            CONTINUE; -- Skip if no shift found
        END IF;
        
        cashier_val := (SELECT cashier_id FROM shifts WHERE shift_id = shift_val);
        
        -- 60% ONLINE, 40% INSTORE
        IF random() < 0.6 THEN
            order_type_val := 'ONLINE';
            user_val := (SELECT user_id FROM users WHERE role_id = 4 ORDER BY random() LIMIT 1);
            table_val := NULL;
        ELSE
            order_type_val := 'INSTORE';
            user_val := NULL;
            table_val := 'Bàn ' || (1 + floor(random() * 20)::INT)::TEXT;
        END IF;
        
        -- 70% VIETQR, 30% CASH
        IF random() < 0.7 THEN
            payment_val := 'VIETQR';
        ELSE
            payment_val := 'CASH';
        END IF;
        
        -- Generate order code
        order_code_val := '#DH' || TO_CHAR(order_date, 'YYMMDD') || LPAD(i::TEXT, 3, '0');
        
        -- Insert order (90% COMPLETED, 5% CANCELLED, 5% PENDING)
        INSERT INTO orders (
            user_id, order_code, order_date, total_amount, status, 
            payment_method, table_number, order_type, shift_id, cashier_id
        ) VALUES (
            user_val,
            order_code_val,
            order_date,
            0, -- Will update after items
            CASE 
                WHEN random() < 0.90 THEN 'COMPLETED'
                WHEN random() < 0.95 THEN 'CANCELLED'
                ELSE 'PENDING'
            END,
            payment_val,
            table_val,
            order_type_val,
            shift_val,
            cashier_val
        ) RETURNING order_id INTO order_id_val;
        
        -- Add order items (1-4 items per order)
        num_items := 1 + floor(random() * 3)::INT;
        total_amt := 0;
        
        FOR j IN 1..num_items LOOP
            DECLARE
                prod_id BIGINT;
                prod_price DECIMAL(10,2);
                item_qty INT;
            BEGIN
                -- Select random product (popular items have higher chance)
                prod_id := (
                    SELECT product_id FROM products 
                    WHERE is_active = TRUE
                    ORDER BY 
                        CASE 
                            WHEN name LIKE '%Cơm%' THEN random() * 2 -- 2x weight for rice dishes
                            ELSE random()
                        END DESC
                    LIMIT 1
                );
                
                prod_price := (SELECT price FROM products WHERE product_id = prod_id);
                item_qty := 1 + floor(random() * 2)::INT; -- 1-2 quantity
                
                INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase)
                VALUES (order_id_val, prod_id, item_qty, prod_price);
                
                total_amt := total_amt + (prod_price * item_qty);
            END;
        END LOOP;
        
        -- Update order total
        UPDATE orders SET total_amount = total_amt WHERE order_id = order_id_val;
        
        -- Add order status history
        IF (SELECT status FROM orders WHERE order_id = order_id_val) = 'COMPLETED' THEN
            INSERT INTO order_status_history (order_id, status, changed_at) VALUES
            (order_id_val, 'PENDING', order_date),
            (order_id_val, 'PREPARING', order_date + INTERVAL '2 minutes'),
            (order_id_val, 'READY', order_date + INTERVAL '15 minutes'),
            (order_id_val, 'COMPLETED', order_date + INTERVAL '20 minutes');
        END IF;
    END LOOP;
END $$;

-- Verification queries
SELECT 
    'Total Orders' as metric,
    COUNT(*) as value
FROM orders
UNION ALL
SELECT 
    'ONLINE Orders',
    COUNT(*) 
FROM orders WHERE order_type = 'ONLINE'
UNION ALL
SELECT 
    'INSTORE Orders',
    COUNT(*) 
FROM orders WHERE order_type = 'INSTORE'
UNION ALL
SELECT 
    'VIETQR Payments',
    COUNT(*) 
FROM orders WHERE payment_method = 'VIETQR'
UNION ALL
SELECT 
    'CASH Payments',
    COUNT(*) 
FROM orders WHERE payment_method = 'CASH'
UNION ALL
SELECT 
    'COMPLETED Orders',
    COUNT(*) 
FROM orders WHERE status = 'COMPLETED';
