-- ==========================================
-- COMPREHENSIVE SAMPLE DATA FOR 2025
-- ==========================================
-- Xóa dữ liệu cũ (giữ lại admin và cấu trúc)
TRUNCATE TABLE order_status_history CASCADE;
TRUNCATE TABLE order_items CASCADE;
TRUNCATE TABLE orders CASCADE;
TRUNCATE TABLE shifts CASCADE;
TRUNCATE TABLE stock_transactions CASCADE;
DELETE FROM users WHERE role_id != 1; -- Giữ lại admin
DELETE FROM products WHERE product_id > 0;
DELETE FROM materials WHERE material_id > 0;

-- ==========================================
-- 1. THÊM MÓN ĂN MỚI (Expanded Menu)
-- ==========================================
INSERT INTO products (name, price, image_url, category, is_active) VALUES 
    -- MÓN MẶN (Giá 10k-25k)
    ('Sườn xào chua ngọt', 15000, '/images/suon-xao.jpg', 'MÓN MẶN', true),
    ('Thịt kho tàu', 12000, '/images/thit-kho.jpg', 'MÓN MẶN', true),
    ('Cá kho tộ', 20000, '/images/ca-kho-to.jpg', 'MÓN MẶN', true),
    ('Gà rang muối', 18000, '/images/ga-rang.jpg', 'MÓN MẶN', true),
    ('Trứng chiên', 5000, '/images/trung-chien.jpg', 'MÓN MẶN', true),
    ('Trứng đúc thịt', 8000, '/images/trung-duc-thit.jpg', 'MÓN MẶN', true),
    ('Thịt luộc', 12000, '/images/thit-luoc.jpg', 'MÓN MẶN', true),
    ('Cá rán', 15000, '/images/ca-ran.jpg', 'MÓN MẶN', true),
    ('Đậu phụ rán', 6000, '/images/dau-phu-ran.jpg', 'MÓN MẶN', true),
    ('Nem rán', 10000, '/images/nem-ran.jpg', 'MÓN MẶN', true),
    -- RAU/CANH (Giá 0-10k)
    ('Rau muống xào tỏi', 6000, '/images/rau-muong.jpg', 'RAU/CANH', true),
    ('Rau cải luộc', 5000, '/images/rau-cai.jpg', 'RAU/CANH', true),
    ('Canh chua', 8000, '/images/canh-chua.jpg', 'RAU/CANH', true),
    ('Canh rau ngót', 6000, '/images/canh-rau-ngot.jpg', 'RAU/CANH', true),
    ('Canh bí đỏ', 5000, '/images/canh-bi.jpg', 'RAU/CANH', true),
    ('Đậu sốt cà', 6000, '/images/dau-sot.jpg', 'RAU/CANH', true),
    ('Canh (miễn phí)', 0, '/images/canh-free.jpg', 'RAU/CANH', true),
    -- CƠM/NƯỚC
    ('Cơm trắng', 5000, '/images/com-trang.jpg', 'CƠM THÊM', true),
    ('Cơm suất thường', 30000, '/images/com-suat.jpg', 'CƠM THÊM', true),
    ('Cơm suất đặc biệt', 40000, '/images/com-suat-db.jpg', 'CƠM THÊM', true),
    ('Nước lọc', 3000, '/images/nuoc-loc.jpg', 'NƯỚC', true),
    ('Trà đá', 2000, '/images/tra-da.jpg', 'NƯỚC', true);

-- ==========================================
-- 2. NGUYÊN VẬT LIỆU (Materials)
-- ==========================================
INSERT INTO materials (name, unit, unit_price, quantity_in_stock, min_stock_level) VALUES
    -- Thịt (giá cao, quan trọng)
    ('Gạo tẻ', 'kg', 20000, 200, 30),
    ('Thịt lợn ba chỉ', 'kg', 130000, 50, 10),
    ('Thịt lợn nạc', 'kg', 140000, 40, 8),
    ('Thịt gà', 'kg', 90000, 35, 8),
    ('Cá rô phi', 'kg', 60000, 25, 5),
    ('Cá basa', 'kg', 55000, 20, 5),
    -- Trứng và đậu
    ('Trứng gà', 'quả', 4000, 300, 50),
    ('Đậu phụ', 'bìa', 6000, 50, 10),
    -- Rau củ
    ('Rau muống', 'bó', 8000, 40, 10),
    ('Rau cải ngọt', 'bó', 10000, 35, 8),
    ('Rau ngót', 'bó', 12000, 30, 6),
    ('Bí xanh', 'kg', 15000, 15, 3),
    ('Bí đỏ', 'kg', 18000, 12, 3),
    ('Cà chua', 'kg', 25000, 20, 5),
    ('Hành lá', 'bó', 5000, 30, 8),
    -- Gia vị
    ('Dầu ăn', 'lít', 50000, 25, 5),
    ('Nước mắm', 'lít', 40000, 15, 3),
    ('Muối', 'kg', 10000, 8, 2),
    ('Đường', 'kg', 25000, 8, 2),
    ('Hành khô', 'kg', 45000, 5, 1),
    ('Tỏi', 'kg', 90000, 4, 1),
    ('Ớt', 'kg', 30000, 3, 0.5),
    ('Tiêu', 'kg', 200000, 2, 0.3),
    ('Bột ngọt', 'kg', 60000, 3, 0.5);

-- ==========================================
-- 3. NHÂN VIÊN (5 Cashiers)
-- ==========================================
-- Password: staff123 (bcrypt hash)
INSERT INTO users (username, password, full_name, role_id) VALUES 
    ('nv_huong', '$2a$10$ZzznGLbzRYsL2V6iTYheOuyaVDRBsqUHdt8q5ZSWpQCAQiOxOIWgS', 'Nguyễn Thu Hương', 2),
    ('nv_minh', '$2a$10$ZzznGLbzRYsL2V6iTYheOuyaVDRBsqUHdt8q5ZSWpQCAQiOxOIWgS', 'Trần Văn Minh', 2),
    ('nv_linh', '$2a$10$ZzznGLbzRYsL2V6iTYheOuyaVDRBsqUHdt8q5ZSWpQCAQiOxOIWgS', 'Phạm Thị Linh', 2),
    ('nv_tuan', '$2a$10$ZzznGLbzRYsL2V6iTYheOuyaVDRBsqUHdt8q5ZSWpQCAQiOxOIWgS', 'Lê Anh Tuấn', 2),
    ('nv_mai', '$2a$10$ZzznGLbzRYsL2V6iTYheOuyaVDRBsqUHdt8q5ZSWpQCAQiOxOIWgS', 'Hoàng Thị Mai', 2),
    -- Kitchen staff
    ('bep_hung', '$2a$10$ZzznGLbzRYsL2V6iTYheOuyaVDRBsqUHdt8q5ZSWpQCAQiOxOIWgS', 'Bùi Văn Hùng', 3),
    ('bep_lan', '$2a$10$ZzznGLbzRYsL2V6iTYheOuyaVDRBsqUHdt8q5ZSWpQCAQiOxOIWgS', 'Đỗ Thị Lan', 3);

-- ==========================================
-- 4. KHÁCH HÀNG (1000 customers throughout 2025)
-- ==========================================
DO $$
DECLARE
    i INTEGER;
    reg_date TIMESTAMP;
    name_prefix TEXT[] := ARRAY['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Vũ', 'Đặng', 'Bùi', 'Đỗ', 'Hồ'];
    name_middle TEXT[] := ARRAY['Văn', 'Thị', 'Đức', 'Minh', 'Anh', 'Thanh', 'Quốc', 'Hữu', 'Thành', 'Ngọc'];
    name_last TEXT[] := ARRAY['An', 'Bình', 'Cường', 'Dũng', 'Hà', 'Hải', 'Hương', 'Lan', 'Long', 'Mai', 'Nam', 'Phong', 'Quang', 'Tâm', 'Thảo', 'Trang', 'Tuấn', 'Vy', 'Yến', 'Huy'];
    full_name_gen TEXT;
    phone_gen TEXT;
BEGIN
    FOR i IN 1..1000 LOOP
        -- Random registration date throughout 2025 (more in early months, increasing towards end)
        reg_date := '2025-01-01'::timestamp + (random() * 364 * interval '1 day');
        
        -- Generate name
        full_name_gen := name_prefix[1 + floor(random() * 10)::int] || ' ' ||
                         name_middle[1 + floor(random() * 10)::int] || ' ' ||
                         name_last[1 + floor(random() * 20)::int];
        
        -- Generate phone
        phone_gen := '09' || lpad((floor(random() * 100000000))::text, 8, '0');
        
        INSERT INTO users (username, password, full_name, phone, role_id, created_at)
        VALUES (
            'kh_' || lpad(i::text, 4, '0'),
            '$2a$10$ZzznGLbzRYsL2V6iTYheOuyaVDRBsqUHdt8q5ZSWpQCAQiOxOIWgS',
            full_name_gen,
            phone_gen,
            4, -- CUSTOMER role
            reg_date
        );
    END LOOP;
END $$;

-- ==========================================
-- 5. CA LÀM VIỆC & ĐƠN HÀNG INSTORE (365 days)
-- ==========================================
DO $$
DECLARE
    day_date DATE;
    shift_id_gen BIGINT;
    cashier_id_gen BIGINT;
    cashier_ids BIGINT[];
    order_id_gen BIGINT;
    order_count INTEGER;
    order_i INTEGER;
    product_ids INTEGER[];
    product_prices INTEGER[];
    selected_products INTEGER[];
    product_qty INTEGER;
    total_amount DECIMAL := 0;
    order_time TIMESTAMP;
    order_code_gen TEXT;
    payment_method_gen TEXT;
    cash_total DECIMAL;
    transfer_total DECIMAL;
    day_of_week INTEGER;
    is_weekend BOOLEAN;
    base_orders INTEGER;
    peak_hour INTEGER;
    order_hour INTEGER;
BEGIN
    -- Get cashier IDs (role_id = 2)
    SELECT ARRAY_AGG(user_id) INTO cashier_ids FROM users WHERE role_id = 2;
    
    -- Get product data
    SELECT ARRAY_AGG(product_id), ARRAY_AGG(price) 
    INTO product_ids, product_prices 
    FROM products WHERE is_active = true AND price > 0;
    
    -- Loop through each day of 2025
    FOR day_date IN SELECT generate_series('2025-01-01'::date, '2025-12-31'::date, '1 day')::date LOOP
        day_of_week := EXTRACT(DOW FROM day_date);
        is_weekend := day_of_week IN (0, 6);
        
        -- Base orders per day: 25-45 (higher on weekends)
        base_orders := 25 + floor(random() * 20);
        IF is_weekend THEN
            base_orders := base_orders + 10;
        END IF;
        
        -- Seasonal adjustment (summer = more customers)
        IF EXTRACT(MONTH FROM day_date) BETWEEN 6 AND 8 THEN
            base_orders := base_orders + 5;
        END IF;
        
        -- Create shift for this day
        cashier_id_gen := cashier_ids[1 + floor(random() * array_length(cashier_ids, 1))::int];
        
        INSERT INTO shifts (cashier_id, start_time, end_time, status, total_orders, total_revenue, cash_revenue, transfer_revenue)
        VALUES (
            cashier_id_gen,
            day_date + interval '10 hours',
            day_date + interval '21 hours',
            'CLOSED',
            0, 0, 0, 0
        )
        RETURNING shift_id INTO shift_id_gen;
        
        cash_total := 0;
        transfer_total := 0;
        order_count := base_orders;
        
        -- Create orders for this day
        FOR order_i IN 1..order_count LOOP
            -- Random order time (peak: 11-13h lunch, 17-19h dinner)
            IF random() < 0.4 THEN
                order_hour := 11 + floor(random() * 2)::int; -- Lunch
            ELSIF random() < 0.7 THEN
                order_hour := 17 + floor(random() * 2)::int; -- Dinner
            ELSE
                order_hour := 10 + floor(random() * 11)::int; -- Other times
            END IF;
            
            order_time := day_date + (order_hour || ' hours')::interval + 
                          (floor(random() * 60) || ' minutes')::interval;
            
            -- Generate order code
            order_code_gen := 'DH' || to_char(day_date, 'YYMMDD') || lpad(order_i::text, 3, '0');
            
            -- Payment method (70% cash, 30% VietQR)
            payment_method_gen := CASE WHEN random() < 0.7 THEN 'CASH' ELSE 'VIETQR' END;
            
            -- Select 2-4 random products
            total_amount := 0;
            
            -- Always add rice
            total_amount := total_amount + 5000; -- Cơm trắng
            
            -- Add 1-3 dishes
            FOR product_qty IN 1..(1 + floor(random() * 3)::int) LOOP
                -- Random product (weighted towards cheaper items)
                DECLARE
                    rand_idx INTEGER := 1 + floor(random() * array_length(product_ids, 1))::int;
                BEGIN
                    IF rand_idx <= array_length(product_prices, 1) THEN
                        total_amount := total_amount + product_prices[rand_idx];
                    END IF;
                END;
            END LOOP;
            
            -- Maybe add drink (30% chance)
            IF random() < 0.3 THEN
                total_amount := total_amount + 2000; -- Trà đá
            END IF;
            
            -- Insert order
            INSERT INTO orders (user_id, order_code, order_date, total_amount, status, payment_method, order_type, shift_id, cashier_id)
            VALUES (
                NULL, -- Khách vãng lai
                order_code_gen,
                order_time,
                total_amount,
                'COMPLETED',
                payment_method_gen,
                'INSTORE',
                shift_id_gen,
                cashier_id_gen
            )
            RETURNING order_id INTO order_id_gen;
            
            -- Insert order items (simplified: just main combo)
            INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase)
            VALUES (order_id_gen, 18, 1, total_amount); -- Fake as combo
            
            -- Insert order status history
            INSERT INTO order_status_history (order_id, status, changed_at) VALUES
                (order_id_gen, 'PENDING', order_time),
                (order_id_gen, 'PREPARING', order_time + interval '2 minutes'),
                (order_id_gen, 'READY', order_time + interval '8 minutes'),
                (order_id_gen, 'COMPLETED', order_time + interval '12 minutes');
            
            -- Track revenue by payment method
            IF payment_method_gen = 'CASH' THEN
                cash_total := cash_total + total_amount;
            ELSE
                transfer_total := transfer_total + total_amount;
            END IF;
        END LOOP;
        
        -- Update shift totals (with small random variance for reconciliation testing)
        UPDATE shifts SET 
            total_orders = order_count,
            total_revenue = cash_total + transfer_total,
            cash_revenue = cash_total + (random() * 10000 - 5000)::int, -- ±5k variance
            transfer_revenue = transfer_total
        WHERE shift_id = shift_id_gen;
        
    END LOOP;
END $$;

-- ==========================================
-- 6. ĐƠN HÀNG ONLINE (From registered customers)
-- ==========================================
DO $$
DECLARE
    customer_rec RECORD;
    order_count INTEGER;
    order_i INTEGER;
    order_date_gen TIMESTAMP;
    order_id_gen BIGINT;
    order_code_gen TEXT;
    total_amount DECIMAL;
    product_ids INTEGER[];
    product_prices INTEGER[];
    reg_date DATE;
    global_order_num INTEGER := 0;
BEGIN
    -- Get product data
    SELECT ARRAY_AGG(product_id), ARRAY_AGG(price) 
    INTO product_ids, product_prices 
    FROM products WHERE is_active = true AND price > 0;
    
    -- Loop through each customer
    FOR customer_rec IN 
        SELECT user_id, created_at FROM users WHERE role_id = 4 ORDER BY random()
    LOOP
        reg_date := customer_rec.created_at::date;
        
        -- Random order count: some customers order a lot (loyal), some order once
        IF random() < 0.1 THEN
            order_count := 10 + floor(random() * 20)::int; -- Loyal customer (10-30 orders)
        ELSIF random() < 0.3 THEN
            order_count := 3 + floor(random() * 7)::int; -- Regular (3-10 orders)
        ELSE
            order_count := 1 + floor(random() * 2)::int; -- Occasional (1-3 orders)
        END IF;
        
        FOR order_i IN 1..order_count LOOP
            global_order_num := global_order_num + 1;
            
            -- Order date: after registration, spread throughout remaining year
            order_date_gen := reg_date + (random() * ('2025-12-31'::date - reg_date))::int * interval '1 day';
            order_date_gen := order_date_gen + (10 + floor(random() * 10))::int * interval '1 hour';
            
            -- Avoid dates before registration
            IF order_date_gen < customer_rec.created_at THEN
                order_date_gen := customer_rec.created_at + interval '1 day';
            END IF;
            
            -- Generate order code (Online format)
            order_code_gen := 'ON' || to_char(order_date_gen, 'YYMMDD') || lpad(global_order_num::text, 4, '0');
            
            -- Calculate total: 30k-80k for online orders
            total_amount := 30000 + floor(random() * 50000);
            
            -- Insert order
            INSERT INTO orders (user_id, order_code, order_date, estimated_pickup_time, total_amount, status, payment_method, order_type)
            VALUES (
                customer_rec.user_id,
                order_code_gen,
                order_date_gen,
                order_date_gen + interval '30 minutes',
                total_amount,
                CASE WHEN random() < 0.95 THEN 'COMPLETED' ELSE 'CANCELLED' END,
                CASE WHEN random() < 0.8 THEN 'VIETQR' ELSE 'CASH' END,
                'ONLINE'
            )
            RETURNING order_id INTO order_id_gen;
            
            -- Insert order items
            INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase)
            VALUES (order_id_gen, 19, 1, total_amount); -- Cơm suất thường
            
            -- Insert order status history (only for completed)
            INSERT INTO order_status_history (order_id, status, changed_at) VALUES
                (order_id_gen, 'PENDING', order_date_gen),
                (order_id_gen, 'PREPARING', order_date_gen + (2 + random() * 5)::int * interval '1 minute'),
                (order_id_gen, 'READY', order_date_gen + (10 + random() * 10)::int * interval '1 minute'),
                (order_id_gen, 'COMPLETED', order_date_gen + (25 + random() * 15)::int * interval '1 minute');
        END LOOP;
    END LOOP;
END $$;

-- ==========================================
-- 7. STOCK TRANSACTIONS (Nhập xuất kho logic)
-- ==========================================
DO $$
DECLARE
    month_date DATE;
    mat_rec RECORD;
    in_qty DECIMAL;
    out_qty DECIMAL;
BEGIN
    -- Loop through each month of 2025
    FOR month_date IN SELECT generate_series('2025-01-01'::date, '2025-12-01'::date, '1 month')::date LOOP
        -- For each material
        FOR mat_rec IN SELECT material_id, name, unit_price FROM materials LOOP
            -- Monthly stock IN (replenishment)
            in_qty := 20 + random() * 30;
            INSERT INTO stock_transactions (material_id, type, quantity, unit_price, note, created_at)
            VALUES (mat_rec.material_id, 'IN', in_qty, mat_rec.unit_price, 'Nhập kho tháng ' || EXTRACT(MONTH FROM month_date), month_date + interval '1 day');
            
            -- Weekly OUT transactions (usage)
            FOR i IN 1..4 LOOP
                out_qty := 3 + random() * 8;
                INSERT INTO stock_transactions (material_id, type, quantity, unit_price, note, created_at)
                VALUES (mat_rec.material_id, 'OUT', out_qty, mat_rec.unit_price, 'Sử dụng tuần ' || i, month_date + (i * 7) * interval '1 day');
            END LOOP;
        END LOOP;
    END LOOP;
END $$;

-- ==========================================
-- 8. UPDATE MATERIAL STOCK (Based on transactions)
-- ==========================================
UPDATE materials m SET 
    quantity_in_stock = (
        SELECT COALESCE(SUM(CASE WHEN type = 'IN' THEN quantity ELSE -quantity END), 0)
        FROM stock_transactions st 
        WHERE st.material_id = m.material_id
    );

-- ==========================================
-- SUMMARY
-- ==========================================
DO $$
BEGIN
    RAISE NOTICE '=== DATA GENERATION COMPLETE ===';
    RAISE NOTICE 'Products: %', (SELECT COUNT(*) FROM products);
    RAISE NOTICE 'Materials: %', (SELECT COUNT(*) FROM materials);
    RAISE NOTICE 'Staff (Cashier): %', (SELECT COUNT(*) FROM users WHERE role_id = 2);
    RAISE NOTICE 'Customers: %', (SELECT COUNT(*) FROM users WHERE role_id = 4);
    RAISE NOTICE 'Shifts: %', (SELECT COUNT(*) FROM shifts);
    RAISE NOTICE 'Orders: %', (SELECT COUNT(*) FROM orders);
    RAISE NOTICE 'Order Status History: %', (SELECT COUNT(*) FROM order_status_history);
    RAISE NOTICE 'Stock Transactions: %', (SELECT COUNT(*) FROM stock_transactions);
END $$;
