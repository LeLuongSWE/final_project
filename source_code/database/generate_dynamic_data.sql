-- ==========================================
-- DYNAMIC SAMPLE DATA GENERATION
-- Sử dụng CURRENT_DATE để gen dữ liệu đến ngày hôm nay
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
-- 1. THÊM MÓN ĂN
-- ==========================================
INSERT INTO products (name, price, image_url, category, is_active) VALUES 
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
    ('Rau muống xào tỏi', 6000, '/images/rau-muong.jpg', 'RAU/CANH', true),
    ('Rau cải luộc', 5000, '/images/rau-cai.jpg', 'RAU/CANH', true),
    ('Canh chua', 8000, '/images/canh-chua.jpg', 'RAU/CANH', true),
    ('Canh rau ngót', 6000, '/images/canh-rau-ngot.jpg', 'RAU/CANH', true),
    ('Canh bí đỏ', 5000, '/images/canh-bi.jpg', 'RAU/CANH', true),
    ('Đậu sốt cà', 6000, '/images/dau-sot.jpg', 'RAU/CANH', true),
    ('Canh (miễn phí)', 0, '/images/canh-free.jpg', 'RAU/CANH', true),
    ('Cơm trắng', 5000, '/images/com-trang.jpg', 'CƠM THÊM', true),
    ('Cơm suất thường', 30000, '/images/com-suat.jpg', 'CƠM THÊM', true),
    ('Cơm suất đặc biệt', 40000, '/images/com-suat-db.jpg', 'CƠM THÊM', true),
    ('Nước lọc', 3000, '/images/nuoc-loc.jpg', 'NƯỚC', true),
    ('Trà đá', 2000, '/images/tra-da.jpg', 'NƯỚC', true);

-- ==========================================
-- 2. NGUYÊN VẬT LIỆU
-- ==========================================
INSERT INTO materials (name, unit, unit_price, quantity_in_stock, min_stock_level) VALUES
    ('Gạo tẻ', 'kg', 20000, 200, 30),
    ('Thịt lợn ba chỉ', 'kg', 130000, 50, 10),
    ('Thịt lợn nạc', 'kg', 140000, 40, 8),
    ('Thịt gà', 'kg', 90000, 35, 8),
    ('Cá rô phi', 'kg', 60000, 25, 5),
    ('Cá basa', 'kg', 55000, 20, 5),
    ('Trứng gà', 'quả', 4000, 300, 50),
    ('Đậu phụ', 'bìa', 6000, 50, 10),
    ('Rau muống', 'bó', 8000, 40, 10),
    ('Rau cải ngọt', 'bó', 10000, 35, 8),
    ('Rau ngót', 'bó', 12000, 30, 6),
    ('Bí xanh', 'kg', 15000, 15, 3),
    ('Bí đỏ', 'kg', 18000, 12, 3),
    ('Cà chua', 'kg', 25000, 20, 5),
    ('Hành lá', 'bó', 5000, 30, 8),
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
INSERT INTO users (username, password, full_name, role_id) VALUES 
    ('nv_huong', '$2a$10$ZzznGLbzRYsL2V6iTYheOuyaVDRBsqUHdt8q5ZSWpQCAQiOxOIWgS', 'Nguyễn Thu Hương', 2),
    ('nv_minh', '$2a$10$ZzznGLbzRYsL2V6iTYheOuyaVDRBsqUHdt8q5ZSWpQCAQiOxOIWgS', 'Trần Văn Minh', 2),
    ('nv_linh', '$2a$10$ZzznGLbzRYsL2V6iTYheOuyaVDRBsqUHdt8q5ZSWpQCAQiOxOIWgS', 'Phạm Thị Linh', 2),
    ('nv_tuan', '$2a$10$ZzznGLbzRYsL2V6iTYheOuyaVDRBsqUHdt8q5ZSWpQCAQiOxOIWgS', 'Lê Anh Tuấn', 2),
    ('nv_mai', '$2a$10$ZzznGLbzRYsL2V6iTYheOuyaVDRBsqUHdt8q5ZSWpQCAQiOxOIWgS', 'Hoàng Thị Mai', 2),
    ('bep_hung', '$2a$10$ZzznGLbzRYsL2V6iTYheOuyaVDRBsqUHdt8q5ZSWpQCAQiOxOIWgS', 'Bùi Văn Hùng', 3),
    ('bep_lan', '$2a$10$ZzznGLbzRYsL2V6iTYheOuyaVDRBsqUHdt8q5ZSWpQCAQiOxOIWgS', 'Đỗ Thị Lan', 3);

-- ==========================================
-- 4. KHÁCH HÀNG (500 customers)
-- ==========================================
DO $$
DECLARE
    i INTEGER;
    reg_date TIMESTAMP;
    start_date DATE := CURRENT_DATE - interval '1 year'; -- 1 năm trước
    name_prefix TEXT[] := ARRAY['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Vũ', 'Đặng', 'Bùi', 'Đỗ', 'Hồ'];
    name_middle TEXT[] := ARRAY['Văn', 'Thị', 'Đức', 'Minh', 'Anh', 'Thanh', 'Quốc', 'Hữu', 'Thành', 'Ngọc'];
    name_last TEXT[] := ARRAY['An', 'Bình', 'Cường', 'Dũng', 'Hà', 'Hải', 'Hương', 'Lan', 'Long', 'Mai', 'Nam', 'Phong', 'Quang', 'Tâm', 'Thảo', 'Trang', 'Tuấn', 'Vy', 'Yến', 'Huy'];
    full_name_gen TEXT;
    phone_gen TEXT;
    days_range INTEGER;
BEGIN
    days_range := CURRENT_DATE - start_date;
    
    FOR i IN 1..500 LOOP
        reg_date := start_date + (random() * days_range * interval '1 day');
        
        full_name_gen := name_prefix[1 + floor(random() * 10)::int] || ' ' ||
                         name_middle[1 + floor(random() * 10)::int] || ' ' ||
                         name_last[1 + floor(random() * 20)::int];
        
        phone_gen := '09' || lpad((floor(random() * 100000000))::text, 8, '0');
        
        INSERT INTO users (username, password, full_name, phone, role_id, created_at)
        VALUES (
            'kh_' || lpad(i::text, 4, '0'),
            '$2a$10$ZzznGLbzRYsL2V6iTYheOuyaVDRBsqUHdt8q5ZSWpQCAQiOxOIWgS',
            full_name_gen,
            phone_gen,
            4,
            reg_date
        );
    END LOOP;
END $$;

-- ==========================================
-- 5. CA LÀM VIỆC & ĐƠN HÀNG (Từ 1 năm trước đến hôm nay)
-- ==========================================
DO $$
DECLARE
    day_date DATE;
    start_date DATE := CURRENT_DATE - interval '1 year';
    shift_id_gen BIGINT;
    cashier_id_gen BIGINT;
    cashier_ids BIGINT[];
    order_id_gen BIGINT;
    order_count INTEGER;
    order_i INTEGER;
    product_ids INTEGER[];
    product_prices INTEGER[];
    order_total DECIMAL := 0;
    order_time TIMESTAMP;
    order_code_gen TEXT;
    payment_method_gen TEXT;
    cash_total DECIMAL;
    transfer_total DECIMAL;
    day_of_week INTEGER;
    is_weekend BOOLEAN;
    base_orders INTEGER;
    order_hour INTEGER;
BEGIN
    SELECT ARRAY_AGG(user_id) INTO cashier_ids FROM users WHERE role_id = 2;
    
    SELECT ARRAY_AGG(product_id), ARRAY_AGG(price) 
    INTO product_ids, product_prices 
    FROM products WHERE is_active = true AND price > 0;
    
    FOR day_date IN SELECT generate_series(start_date, CURRENT_DATE, '1 day')::date LOOP
        day_of_week := EXTRACT(DOW FROM day_date);
        is_weekend := day_of_week IN (0, 6);
        
        base_orders := 25 + floor(random() * 20);
        IF is_weekend THEN
            base_orders := base_orders + 10;
        END IF;
        
        IF EXTRACT(MONTH FROM day_date) BETWEEN 6 AND 8 THEN
            base_orders := base_orders + 5;
        END IF;
        
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
        
        FOR order_i IN 1..order_count LOOP
            IF random() < 0.4 THEN
                order_hour := 11 + floor(random() * 2)::int;
            ELSIF random() < 0.7 THEN
                order_hour := 17 + floor(random() * 2)::int;
            ELSE
                order_hour := 10 + floor(random() * 11)::int;
            END IF;
            
            order_time := day_date + (order_hour || ' hours')::interval + 
                          (floor(random() * 60) || ' minutes')::interval;
            
            order_code_gen := 'DH' || to_char(day_date, 'YYMMDD') || lpad(order_i::text, 3, '0');
            
            payment_method_gen := CASE WHEN random() < 0.7 THEN 'CASH' ELSE 'VIETQR' END;
            
            order_total := 0;
            
            INSERT INTO orders (user_id, order_code, order_date, total_amount, status, payment_method, order_type, shift_id, cashier_id)
            VALUES (
                NULL,
                order_code_gen,
                order_time,
                0, -- Will update after calculating items
                'COMPLETED',
                payment_method_gen,
                'INSTORE',
                shift_id_gen,
                cashier_id_gen
            )
            RETURNING order_id INTO order_id_gen;
            
            -- Insert multiple order items (2-5 items per order)
            DECLARE
                num_items INTEGER := 2 + floor(random() * 4)::int; -- 2-5 items
                item_i INTEGER;
                rand_idx INTEGER;
                item_price DECIMAL;
                used_products INTEGER[] := ARRAY[]::INTEGER[];
            BEGIN
                FOR item_i IN 1..num_items LOOP
                    -- Pick a random product (avoid duplicates in same order)
                    LOOP
                        rand_idx := 1 + floor(random() * array_length(product_ids, 1))::int;
                        EXIT WHEN NOT (product_ids[rand_idx] = ANY(used_products)) OR array_length(used_products, 1) >= array_length(product_ids, 1) - 1;
                    END LOOP;
                    
                    used_products := used_products || product_ids[rand_idx];
                    item_price := product_prices[rand_idx];
                    order_total := order_total + item_price;
                    
                    INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase)
                    VALUES (order_id_gen, product_ids[rand_idx], 1, item_price);
                END LOOP;
                
                -- Update order total
                UPDATE orders SET total_amount = order_total WHERE order_id = order_id_gen;
            END;
            
            INSERT INTO order_status_history (order_id, status, changed_at) VALUES
                (order_id_gen, 'PENDING', order_time),
                (order_id_gen, 'PREPARING', order_time + interval '2 minutes'),
                (order_id_gen, 'READY', order_time + interval '8 minutes'),
                (order_id_gen, 'COMPLETED', order_time + interval '12 minutes');
            
            IF payment_method_gen = 'CASH' THEN
                cash_total := cash_total + order_total;
            ELSE
                transfer_total := transfer_total + order_total;
            END IF;
        END LOOP;
        
        UPDATE shifts SET 
            total_orders = order_count,
            total_revenue = cash_total + transfer_total,
            cash_revenue = cash_total + (random() * 10000 - 5000)::int,
            transfer_revenue = transfer_total
        WHERE shift_id = shift_id_gen;
        
    END LOOP;
END $$;

-- ==========================================
-- 6. ĐƠN HÀNG ONLINE
-- ==========================================
DO $$
DECLARE
    customer_rec RECORD;
    order_count INTEGER;
    order_i INTEGER;
    order_date_gen TIMESTAMP;
    order_id_gen BIGINT;
    order_code_gen TEXT;
    order_total DECIMAL;
    product_ids INTEGER[];
    product_prices INTEGER[];
    reg_date DATE;
    global_order_num INTEGER := 0;
BEGIN
    SELECT ARRAY_AGG(product_id), ARRAY_AGG(price::INTEGER)
    INTO product_ids, product_prices 
    FROM products WHERE is_active = true AND price > 0;
    
    FOR customer_rec IN 
        SELECT user_id, created_at FROM users WHERE role_id = 4 ORDER BY random() LIMIT 200
    LOOP
        reg_date := customer_rec.created_at::date;
        
        IF random() < 0.1 THEN
            order_count := 5 + floor(random() * 10)::int;
        ELSIF random() < 0.3 THEN
            order_count := 2 + floor(random() * 4)::int;
        ELSE
            order_count := 1 + floor(random() * 2)::int;
        END IF;
        
        FOR order_i IN 1..order_count LOOP
            global_order_num := global_order_num + 1;
            
            order_date_gen := reg_date + (random() * (CURRENT_DATE - reg_date))::int * interval '1 day';
            order_date_gen := order_date_gen + (10 + floor(random() * 10))::int * interval '1 hour';
            
            IF order_date_gen < customer_rec.created_at THEN
                order_date_gen := customer_rec.created_at + interval '1 day';
            END IF;
            
            order_code_gen := 'ON' || to_char(order_date_gen, 'YYMMDD') || lpad(global_order_num::text, 4, '0');
            
            order_total := 0;
            
            INSERT INTO orders (user_id, order_code, order_date, estimated_pickup_time, total_amount, status, payment_method, order_type)
            VALUES (
                customer_rec.user_id,
                order_code_gen,
                order_date_gen,
                order_date_gen + interval '30 minutes',
                0,
                CASE WHEN random() < 0.95 THEN 'COMPLETED' ELSE 'CANCELLED' END,
                CASE WHEN random() < 0.8 THEN 'VIETQR' ELSE 'CASH' END,
                'ONLINE'
            )
            RETURNING order_id INTO order_id_gen;
            
            -- Insert multiple order items (2-4 items per online order)
            DECLARE
                num_items INTEGER := 2 + floor(random() * 3)::int;
                item_i INTEGER;
                rand_idx INTEGER;
                item_price DECIMAL;
                used_products INTEGER[] := ARRAY[]::INTEGER[];
            BEGIN
                FOR item_i IN 1..num_items LOOP
                    LOOP
                        rand_idx := 1 + floor(random() * array_length(product_ids, 1))::int;
                        EXIT WHEN NOT (product_ids[rand_idx] = ANY(used_products)) OR array_length(used_products, 1) >= array_length(product_ids, 1) - 1;
                    END LOOP;
                    
                    used_products := used_products || product_ids[rand_idx];
                    item_price := product_prices[rand_idx];
                    order_total := order_total + item_price;
                    
                    INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase)
                    VALUES (order_id_gen, product_ids[rand_idx], 1, item_price);
                END LOOP;
                
                UPDATE orders SET total_amount = order_total WHERE order_id = order_id_gen;
            END;
            
            INSERT INTO order_status_history (order_id, status, changed_at) VALUES
                (order_id_gen, 'PENDING', order_date_gen),
                (order_id_gen, 'PREPARING', order_date_gen + (2 + random() * 5)::int * interval '1 minute'),
                (order_id_gen, 'READY', order_date_gen + (10 + random() * 10)::int * interval '1 minute'),
                (order_id_gen, 'COMPLETED', order_date_gen + (25 + random() * 15)::int * interval '1 minute');
        END LOOP;
    END LOOP;
END $$;

-- ==========================================
-- 7. STOCK TRANSACTIONS (Daily transactions for COGS)
-- ==========================================
DO $$
DECLARE
    day_date DATE;
    start_date DATE := CURRENT_DATE - interval '1 year';
    mat_rec RECORD;
    in_qty DECIMAL;
    out_qty DECIMAL;
    day_of_month INTEGER;
BEGIN
    -- Loop through each day
    FOR day_date IN SELECT generate_series(start_date, CURRENT_DATE, '1 day')::date LOOP
        day_of_month := EXTRACT(DAY FROM day_date);
        
        FOR mat_rec IN SELECT material_id, name, unit_price FROM materials LOOP
            -- Monthly stock IN (on the 1st of each month)
            IF day_of_month = 1 THEN
                in_qty := 50 + random() * 100;
                INSERT INTO stock_transactions (material_id, type, quantity, unit_price, note, created_at)
                VALUES (mat_rec.material_id, 'IN', in_qty, mat_rec.unit_price, 
                        'Nhập kho tháng ' || EXTRACT(MONTH FROM day_date), 
                        day_date + interval '8 hours');
            END IF;
            
            -- Daily OUT transactions (usage based on material type)
            -- Main ingredients (Gạo, Thịt, Cá) - used more
            IF mat_rec.material_id IN (1, 2, 3, 4, 5, 6) THEN
                out_qty := 0.5 + random() * 2;
            -- Secondary ingredients (Trứng, Rau)
            ELSIF mat_rec.material_id IN (7, 8, 9, 10, 11, 12, 13, 14, 15) THEN
                out_qty := 0.3 + random() * 1.5;
            -- Seasonings (Gia vị) - used less
            ELSE
                out_qty := 0.1 + random() * 0.5;
            END IF;
            
            INSERT INTO stock_transactions (material_id, type, quantity, unit_price, note, created_at)
            VALUES (mat_rec.material_id, 'OUT', out_qty, mat_rec.unit_price, 
                    'Sử dụng ngày ' || to_char(day_date, 'DD/MM'), 
                    day_date + interval '12 hours');
        END LOOP;
    END LOOP;
END $$;

-- ==========================================
-- 8. UPDATE MATERIAL STOCK
-- ==========================================
UPDATE materials m SET 
    quantity_in_stock = (
        SELECT COALESCE(SUM(CASE WHEN type = 'IN' THEN quantity ELSE -quantity END), 0)
        FROM stock_transactions st 
        WHERE st.material_id = m.material_id
    );

-- Add image_data column if not exists
ALTER TABLE products ADD COLUMN IF NOT EXISTS image_data TEXT;

-- ==========================================
-- SUMMARY
-- ==========================================
DO $$
BEGIN
    RAISE NOTICE '=== DYNAMIC DATA GENERATION COMPLETE ===';
    RAISE NOTICE 'Data range: % to %', CURRENT_DATE - interval '1 year', CURRENT_DATE;
    RAISE NOTICE 'Products: %', (SELECT COUNT(*) FROM products);
    RAISE NOTICE 'Materials: %', (SELECT COUNT(*) FROM materials);
    RAISE NOTICE 'Staff (Cashier): %', (SELECT COUNT(*) FROM users WHERE role_id = 2);
    RAISE NOTICE 'Customers: %', (SELECT COUNT(*) FROM users WHERE role_id = 4);
    RAISE NOTICE 'Shifts: %', (SELECT COUNT(*) FROM shifts);
    RAISE NOTICE 'Orders: %', (SELECT COUNT(*) FROM orders);
END $$;
