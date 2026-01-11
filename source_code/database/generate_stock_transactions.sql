-- ============================================
-- SCRIPT: Generate Stock Transactions Sample Data
-- Purpose: Create realistic IN/OUT transactions for analytics
-- ============================================

-- Step 1: Generate IN transactions (purchases) for past 60 days
-- Multiple purchases with varying prices to show price variance
DO $$
DECLARE
    mat RECORD;
    purchase_date TIMESTAMP;
    base_price DECIMAL(10,2);
    price_variation DECIMAL(10,2);
    purchase_qty DECIMAL(10,2);
BEGIN
    FOR mat IN SELECT material_id, name, unit, unit_price FROM materials LOOP
        base_price := mat.unit_price;
        
        -- Generate 8-12 purchase transactions over 60 days
        FOR i IN 1..(8 + floor(random() * 5)::INT) LOOP
            -- Random date in past 60 days
            purchase_date := CURRENT_DATE - (random() * 60 || ' days')::INTERVAL;
            
            -- Price varies ±15% from base
            price_variation := base_price * (0.85 + random() * 0.3);
            
            -- Purchase quantity varies by material type
            CASE 
                WHEN mat.name LIKE '%Gạo%' OR mat.name LIKE '%Thịt%' THEN
                    purchase_qty := 20 + random() * 30; -- 20-50kg
                WHEN mat.name LIKE '%Rau%' OR mat.name LIKE '%Hành%' THEN
                    purchase_qty := 5 + random() * 10; -- 5-15kg  
                ELSE
                    purchase_qty := 10 + random() * 20; -- 10-30
            END CASE;
            
            INSERT INTO stock_transactions (material_id, type, quantity, unit_price, note, created_at)
            VALUES (
                mat.material_id,
                'IN',
                purchase_qty,
                price_variation,
                'Nhập hàng định kỳ',
                purchase_date
            );
        END LOOP;
    END LOOP;
END $$;

-- Step 2: Generate OUT transactions (usage) based on restaurant activity
-- More transactions = busier restaurant
DO $$
DECLARE
    mat RECORD;
    usage_date TIMESTAMP;
    usage_qty DECIMAL(10,2);
    daily_usage_factor DECIMAL;
BEGIN
    FOR mat IN SELECT material_id, name, unit, unit_price FROM materials LOOP
        
        -- Generate daily usage for past 45 days
        FOR day_offset IN 0..44 LOOP
            usage_date := (CURRENT_DATE - day_offset) + (INTERVAL '10 hours' * random());
            
            -- Usage varies by material and day of week
            -- Weekends have 1.5x usage
            daily_usage_factor := CASE 
                WHEN EXTRACT(DOW FROM usage_date) IN (0, 6) THEN 1.5
                ELSE 1.0
            END;
            
            -- Different materials have different consumption patterns
            CASE 
                WHEN mat.name LIKE '%Gạo%' THEN
                    usage_qty := (8 + random() * 7) * daily_usage_factor; -- 8-15kg/day
                WHEN mat.name LIKE '%Thịt%' OR mat.name LIKE '%Cá%' THEN
                    usage_qty := (3 + random() * 4) * daily_usage_factor; -- 3-7kg/day
                WHEN mat.name LIKE '%Rau%' THEN
                    usage_qty := (2 + random() * 3) * daily_usage_factor; -- 2-5kg/day
                WHEN mat.name LIKE '%Dầu%' OR mat.name LIKE '%Nước mắm%' THEN
                    usage_qty := (0.5 + random() * 1) * daily_usage_factor; -- 0.5-1.5L/day
                ELSE
                    usage_qty := (1 + random() * 3) * daily_usage_factor; -- 1-4 units/day
            END CASE;
            
            INSERT INTO stock_transactions (material_id, type, quantity, unit_price, note, created_at)
            VALUES (
                mat.material_id,
                'OUT',
                usage_qty,
                mat.unit_price,
                'Xuất dùng cho chế biến',
                usage_date
            );
        END LOOP;
    END LOOP;
END $$;

-- Step 3: Add some manual adjustments (inventory count corrections)
INSERT INTO stock_transactions (material_id, type, quantity, unit_price, notes, created_at)
SELECT 
    material_id,
    CASE WHEN random() < 0.5 THEN 'IN' ELSE 'OUT' END,
    random() * 5,
    unit_price,
    'Điều chỉnh kiểm kê',
    CURRENT_DATE - (random() * 30 || ' days')::INTERVAL
FROM materials
WHERE random() < 0.3; -- 30% of materials get adjustments

-- Verification
SELECT 
    'Total Transactions' as metric,
    COUNT(*) as value
FROM stock_transactions
UNION ALL
SELECT 
    'IN Transactions',
    COUNT(*)
FROM stock_transactions WHERE type = 'IN'
UNION ALL
SELECT 
    'OUT Transactions',
    COUNT(*)
FROM stock_transactions WHERE type = 'OUT'
UNION ALL
SELECT 
    'Date Range',
    EXTRACT(DAY FROM MAX(created_at) - MIN(created_at))::INT
FROM stock_transactions;
