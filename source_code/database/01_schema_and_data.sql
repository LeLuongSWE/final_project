-- ==========================================
-- RICE SHOP DATABASE - SCHEMA AND DATA
-- Consolidated from init.sql + generate_dynamic_data.sql
-- PostgreSQL 15+
-- ==========================================

-- Create extensions if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- TABLE: roles
-- ==========================================
CREATE TABLE roles (
    role_id BIGSERIAL PRIMARY KEY,
    role_name VARCHAR(20) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- TABLE: users
-- ==========================================
CREATE TABLE users (
    user_id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    role_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user_role FOREIGN KEY (role_id) REFERENCES roles(role_id) ON DELETE RESTRICT
);

CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_role_id ON users(role_id);

-- ==========================================
-- TABLE: products (removed image_url, using image_data only)
-- ==========================================
CREATE TABLE products (
    product_id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
    image_data TEXT,  -- Base64 encoded image (replaces image_url)
    category VARCHAR(50) DEFAULT 'MÓN MẶN',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_products_is_active ON products(is_active);

-- ==========================================
-- TABLE: orders
-- ==========================================
CREATE TABLE orders (
    order_id BIGSERIAL PRIMARY KEY,
    user_id BIGINT,
    order_code VARCHAR(20) NOT NULL UNIQUE,
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    estimated_pickup_time TIMESTAMP,
    total_amount DECIMAL(15, 2) NOT NULL CHECK (total_amount >= 0),
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    payment_method VARCHAR(20) NOT NULL,
    table_number VARCHAR(10),
    order_type VARCHAR(20) NOT NULL DEFAULT 'ONLINE',
    shift_id BIGINT,
    cashier_id BIGINT,
    CONSTRAINT fk_order_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL
);

CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_order_date ON orders(order_date);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_order_code ON orders(order_code);

-- ==========================================
-- TABLE: order_items
-- ==========================================
CREATE TABLE order_items (
    item_id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    price_at_purchase DECIMAL(10, 2) NOT NULL CHECK (price_at_purchase >= 0),
    CONSTRAINT fk_order_item_order FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
    CONSTRAINT fk_order_item_product FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE RESTRICT
);

CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);

-- ==========================================
-- TABLE: order_status_history
-- ==========================================
CREATE TABLE order_status_history (
    history_id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL,
    status VARCHAR(30) NOT NULL,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_status_order FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE
);

CREATE INDEX idx_order_status_history_order_id ON order_status_history(order_id);

-- ==========================================
-- TABLE: shifts
-- ==========================================
CREATE TABLE shifts (
    shift_id BIGSERIAL PRIMARY KEY,
    cashier_id BIGINT NOT NULL,
    start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    end_time TIMESTAMP,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    total_orders INTEGER DEFAULT 0,
    total_revenue DECIMAL(15, 2) DEFAULT 0,
    cash_revenue DECIMAL(15, 2) DEFAULT 0,
    transfer_revenue DECIMAL(15, 2) DEFAULT 0,
    CONSTRAINT fk_shift_cashier FOREIGN KEY (cashier_id) REFERENCES users(user_id) ON DELETE RESTRICT
);

CREATE INDEX idx_shifts_cashier_id ON shifts(cashier_id);
CREATE INDEX idx_shifts_status ON shifts(status);

-- ==========================================
-- TABLE: materials
-- ==========================================
CREATE TABLE materials (
    material_id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    unit_price DECIMAL(10, 2) DEFAULT 0,
    quantity_in_stock DECIMAL(10, 2) DEFAULT 0,
    min_stock_level DECIMAL(10, 2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_materials_name ON materials(name);

-- ==========================================
-- TABLE: stock_transactions
-- ==========================================
CREATE TABLE stock_transactions (
    transaction_id BIGSERIAL PRIMARY KEY,
    material_id BIGINT NOT NULL,
    type VARCHAR(10) NOT NULL CHECK (type IN ('IN', 'OUT')),
    quantity DECIMAL(10, 2) NOT NULL,
    unit_price DECIMAL(10, 2) DEFAULT 0,
    note TEXT,
    created_by BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_stock_material FOREIGN KEY (material_id) REFERENCES materials(material_id) ON DELETE CASCADE
);

CREATE INDEX idx_stock_transactions_material ON stock_transactions(material_id);
CREATE INDEX idx_stock_transactions_type ON stock_transactions(type);
CREATE INDEX idx_stock_transactions_created_at ON stock_transactions(created_at);

-- ==========================================
-- VIEWS
-- ==========================================
CREATE OR REPLACE VIEW daily_revenue AS
SELECT 
    DATE(order_date) as date,
    COUNT(*) as order_count,
    SUM(total_amount) as total_revenue
FROM orders
WHERE status = 'COMPLETED'
GROUP BY DATE(order_date)
ORDER BY date DESC;

CREATE OR REPLACE VIEW top_selling_products AS
SELECT 
    p.product_id,
    p.name,
    SUM(oi.quantity) as total_quantity_sold,
    SUM(oi.quantity * oi.price_at_purchase) as total_revenue
FROM order_items oi
JOIN products p ON oi.product_id = p.product_id
GROUP BY p.product_id, p.name
ORDER BY total_quantity_sold DESC;

-- ==========================================
-- TRIGGERS
-- ==========================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_products_updated_at 
BEFORE UPDATE ON products
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_materials_updated_at 
BEFORE UPDATE ON materials
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- INITIAL DATA: Roles
-- ==========================================
INSERT INTO roles (role_name) VALUES 
    ('ADMIN'),
    ('CASHIER'),
    ('KITCHEN'),
    ('CUSTOMER');

-- ==========================================
-- INITIAL DATA: Admin user (password: admin123)
-- ==========================================
INSERT INTO users (username, password, full_name, role_id) VALUES 
    ('admin', '$2a$10$ZzznGLbzRYsL2V6iTYheOuyaVDRBsqUHdt8q5ZSWpQCAQiOxOIWgS', 'Administrator', 1);

-- ==========================================
-- DYNAMIC DATA GENERATION
-- Uses CURRENT_DATE to generate data up to today
-- ==========================================

-- 1. PRODUCTS (no image_url, image_data will be set via admin UI)
INSERT INTO products (name, price, category, is_active) VALUES 
    ('Sườn xào chua ngọt', 15000, 'MÓN MẶN', true),
    ('Thịt kho tàu', 12000, 'MÓN MẶN', true),
    ('Cá kho tộ', 20000, 'MÓN MẶN', true),
    ('Gà rang muối', 18000, 'MÓN MẶN', true),
    ('Trứng chiên', 5000, 'MÓN MẶN', true),
    ('Trứng đúc thịt', 8000, 'MÓN MẶN', true),
    ('Thịt luộc', 12000, 'MÓN MẶN', true),
    ('Cá rán', 15000, 'MÓN MẶN', true),
    ('Đậu phụ rán', 6000, 'MÓN MẶN', true),
    ('Nem rán', 10000, 'MÓN MẶN', true),
    ('Rau muống xào tỏi', 6000, 'RAU/CANH', true),
    ('Rau cải luộc', 5000, 'RAU/CANH', true),
    ('Canh chua', 8000, 'RAU/CANH', true),
    ('Canh rau ngót', 6000, 'RAU/CANH', true),
    ('Canh bí đỏ', 5000, 'RAU/CANH', true),
    ('Đậu sốt cà', 6000, 'RAU/CANH', true),
    ('Canh (miễn phí)', 0, 'RAU/CANH', true),
    ('Cơm trắng', 5000, 'CƠM THÊM', true),
    ('Cơm suất thường', 30000, 'CƠM THÊM', true),
    ('Cơm suất đặc biệt', 40000, 'CƠM THÊM', true),
    ('Nước lọc', 3000, 'NƯỚC', true),
    ('Trà đá', 2000, 'NƯỚC', true);

-- 2. MATERIALS (Prices reduced to achieve ~70% profit margin)
INSERT INTO materials (name, unit, unit_price, quantity_in_stock, min_stock_level) VALUES
    ('Gạo tẻ', 'kg', 6000, 200, 30),
    ('Thịt lợn ba chỉ', 'kg', 35000, 50, 10),
    ('Thịt lợn nạc', 'kg', 40000, 40, 8),
    ('Thịt gà', 'kg', 25000, 35, 8),
    ('Cá rô phi', 'kg', 18000, 25, 5),
    ('Cá basa', 'kg', 15000, 20, 5),
    ('Trứng gà', 'quả', 1200, 300, 50),
    ('Đậu phụ', 'bìa', 1800, 50, 10),
    ('Rau muống', 'bó', 2500, 40, 10),
    ('Rau cải ngọt', 'bó', 3000, 35, 8),
    ('Rau ngót', 'bó', 3500, 30, 6),
    ('Bí xanh', 'kg', 4500, 15, 3),
    ('Bí đỏ', 'kg', 5000, 12, 3),
    ('Cà chua', 'kg', 7000, 20, 5),
    ('Hành lá', 'bó', 1500, 30, 8),
    ('Dầu ăn', 'lít', 15000, 25, 5),
    ('Nước mắm', 'lít', 12000, 15, 3),
    ('Muối', 'kg', 3000, 8, 2),
    ('Đường', 'kg', 7000, 8, 2),
    ('Hành khô', 'kg', 12000, 5, 1),
    ('Tỏi', 'kg', 25000, 4, 1),
    ('Ớt', 'kg', 10000, 3, 0.5),
    ('Tiêu', 'kg', 60000, 2, 0.3),
    ('Bột ngọt', 'kg', 18000, 3, 0.5);

-- 3. STAFF (Cashiers + Kitchen)
INSERT INTO users (username, password, full_name, role_id) VALUES 
    ('nv_huong', '$2a$10$ZzznGLbzRYsL2V6iTYheOuyaVDRBsqUHdt8q5ZSWpQCAQiOxOIWgS', 'Nguyễn Thu Hương', 2),
    ('nv_minh', '$2a$10$ZzznGLbzRYsL2V6iTYheOuyaVDRBsqUHdt8q5ZSWpQCAQiOxOIWgS', 'Trần Văn Minh', 2),
    ('nv_linh', '$2a$10$ZzznGLbzRYsL2V6iTYheOuyaVDRBsqUHdt8q5ZSWpQCAQiOxOIWgS', 'Phạm Thị Linh', 2),
    ('nv_tuan', '$2a$10$ZzznGLbzRYsL2V6iTYheOuyaVDRBsqUHdt8q5ZSWpQCAQiOxOIWgS', 'Lê Anh Tuấn', 2),
    ('nv_mai', '$2a$10$ZzznGLbzRYsL2V6iTYheOuyaVDRBsqUHdt8q5ZSWpQCAQiOxOIWgS', 'Hoàng Thị Mai', 2),
    ('bep_hung', '$2a$10$ZzznGLbzRYsL2V6iTYheOuyaVDRBsqUHdt8q5ZSWpQCAQiOxOIWgS', 'Bùi Văn Hùng', 3),
    ('bep_lan', '$2a$10$ZzznGLbzRYsL2V6iTYheOuyaVDRBsqUHdt8q5ZSWpQCAQiOxOIWgS', 'Đỗ Thị Lan', 3);

-- 4. CUSTOMERS (500)
DO $$
DECLARE
    i INTEGER;
    reg_date TIMESTAMP;
    start_date DATE := CURRENT_DATE - interval '1 year';
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

-- 5. SHIFTS & INSTORE ORDERS (1 year of data)
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
        IF is_weekend THEN base_orders := base_orders + 10; END IF;
        IF EXTRACT(MONTH FROM day_date) BETWEEN 6 AND 8 THEN base_orders := base_orders + 5; END IF;
        
        cashier_id_gen := cashier_ids[1 + floor(random() * array_length(cashier_ids, 1))::int];
        
        INSERT INTO shifts (cashier_id, start_time, end_time, status, total_orders, total_revenue, cash_revenue, transfer_revenue)
        VALUES (cashier_id_gen, day_date + interval '10 hours', day_date + interval '21 hours', 'CLOSED', 0, 0, 0, 0)
        RETURNING shift_id INTO shift_id_gen;
        
        cash_total := 0;
        transfer_total := 0;
        order_count := base_orders;
        
        FOR order_i IN 1..order_count LOOP
            IF random() < 0.4 THEN order_hour := 11 + floor(random() * 2)::int;
            ELSIF random() < 0.7 THEN order_hour := 17 + floor(random() * 2)::int;
            ELSE order_hour := 10 + floor(random() * 11)::int;
            END IF;
            
            order_time := day_date + (order_hour || ' hours')::interval + (floor(random() * 60) || ' minutes')::interval;
            order_code_gen := 'DH' || to_char(day_date, 'YYMMDD') || lpad(order_i::text, 3, '0');
            payment_method_gen := CASE WHEN random() < 0.7 THEN 'CASH' ELSE 'VIETQR' END;
            order_total := 0;
            
            INSERT INTO orders (user_id, order_code, order_date, total_amount, status, payment_method, order_type, shift_id, cashier_id)
            VALUES (NULL, order_code_gen, order_time, 0, 'COMPLETED', payment_method_gen, 'INSTORE', shift_id_gen, cashier_id_gen)
            RETURNING order_id INTO order_id_gen;
            
            -- Insert 2-5 items per order
            DECLARE
                num_items INTEGER := 2 + floor(random() * 4)::int;
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
                (order_id_gen, 'PENDING', order_time),
                (order_id_gen, 'PREPARING', order_time + interval '2 minutes'),
                (order_id_gen, 'READY', order_time + interval '8 minutes'),
                (order_id_gen, 'COMPLETED', order_time + interval '12 minutes');
            
            IF payment_method_gen = 'CASH' THEN cash_total := cash_total + order_total;
            ELSE transfer_total := transfer_total + order_total;
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

-- 6. ONLINE ORDERS
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
    
    FOR customer_rec IN SELECT user_id, created_at FROM users WHERE role_id = 4 ORDER BY random() LIMIT 200 LOOP
        reg_date := customer_rec.created_at::date;
        
        IF random() < 0.1 THEN order_count := 5 + floor(random() * 10)::int;
        ELSIF random() < 0.3 THEN order_count := 2 + floor(random() * 4)::int;
        ELSE order_count := 1 + floor(random() * 2)::int;
        END IF;
        
        FOR order_i IN 1..order_count LOOP
            global_order_num := global_order_num + 1;
            
            order_date_gen := reg_date + (random() * (CURRENT_DATE - reg_date))::int * interval '1 day';
            order_date_gen := order_date_gen + (10 + floor(random() * 10))::int * interval '1 hour';
            IF order_date_gen < customer_rec.created_at THEN order_date_gen := customer_rec.created_at + interval '1 day'; END IF;
            
            order_code_gen := 'ON' || to_char(order_date_gen, 'YYMMDD') || lpad(global_order_num::text, 4, '0');
            order_total := 0;
            
            INSERT INTO orders (user_id, order_code, order_date, estimated_pickup_time, total_amount, status, payment_method, order_type)
            VALUES (customer_rec.user_id, order_code_gen, order_date_gen, order_date_gen + interval '30 minutes', 0,
                CASE WHEN random() < 0.95 THEN 'COMPLETED' ELSE 'CANCELLED' END,
                CASE WHEN random() < 0.8 THEN 'VIETQR' ELSE 'CASH' END, 'ONLINE')
            RETURNING order_id INTO order_id_gen;
            
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

-- 7. STOCK TRANSACTIONS
DO $$
DECLARE
    day_date DATE;
    start_date DATE := CURRENT_DATE - interval '1 year';
    mat_rec RECORD;
    out_qty DECIMAL;
    reorder_point DECIMAL;
    restock_qty DECIMAL;
    current_stock DECIMAL;
    avg_daily_usage DECIMAL;
BEGIN
    FOR day_date IN SELECT generate_series(start_date, CURRENT_DATE, '1 day')::date LOOP
        FOR mat_rec IN SELECT material_id, name, unit_price FROM materials LOOP
            
            -- Usage rates calibrated for ~70% profit margin (COGS = 30% of revenue)
            IF mat_rec.material_id = 1 THEN avg_daily_usage := 2 + random() * 1;  -- Gạo: 2-3kg/ngày
            ELSIF mat_rec.material_id IN (2, 3, 4, 5, 6) THEN avg_daily_usage := 0.8 + random() * 0.7;  -- Thịt/Cá: 0.8-1.5kg/ngày
            ELSIF mat_rec.material_id = 7 THEN avg_daily_usage := 10 + random() * 5;  -- Trứng: 10-15 quả/ngày
            ELSIF mat_rec.material_id = 8 THEN avg_daily_usage := 1.5 + random() * 1;  -- Đậu phụ: 1.5-2.5 bìa/ngày
            ELSIF mat_rec.material_id IN (9, 10, 11, 12, 13, 14, 15) THEN avg_daily_usage := 1.2 + random() * 0.8;  -- Rau: 1.2-2/ngày
            ELSIF mat_rec.material_id IN (16, 17) THEN avg_daily_usage := 0.15 + random() * 0.1;  -- Dầu/Nước mắm
            ELSIF mat_rec.material_id IN (18, 19) THEN avg_daily_usage := 0.05 + random() * 0.05;  -- Muối/Đường
            ELSE avg_daily_usage := 0.03 + random() * 0.04;  -- Gia vị khác
            END IF;
            
            SELECT COALESCE(SUM(CASE WHEN type = 'IN' THEN quantity ELSE -quantity END), 0)
            INTO current_stock
            FROM stock_transactions
            WHERE material_id = mat_rec.material_id AND created_at < day_date + interval '1 day';
            
            reorder_point := avg_daily_usage * 7;
            
            IF current_stock < reorder_point AND EXTRACT(DOW FROM day_date) BETWEEN 1 AND 5 THEN
                restock_qty := ROUND((avg_daily_usage * 14 * 1.2) - current_stock, 2);
                IF restock_qty > 0 THEN
                    INSERT INTO stock_transactions (material_id, type, quantity, unit_price, note, created_at)
                    VALUES (mat_rec.material_id, 'IN', restock_qty, mat_rec.unit_price, 'Nhập bổ sung', day_date + interval '8 hours');
                    current_stock := current_stock + restock_qty;
                END IF;
            END IF;
            
            IF EXTRACT(DOW FROM day_date) IN (0, 6) THEN out_qty := avg_daily_usage * (1.1 + random() * 0.2);
            ELSE out_qty := avg_daily_usage * (0.9 + random() * 0.2);
            END IF;
            
            out_qty := LEAST(out_qty, GREATEST(current_stock, 0));
            
            IF out_qty > 0 THEN
                INSERT INTO stock_transactions (material_id, type, quantity, unit_price, note, created_at)
                VALUES (mat_rec.material_id, 'OUT', ROUND(out_qty, 2), mat_rec.unit_price, 'Sử dụng ngày ' || to_char(day_date, 'DD/MM'), day_date + interval '12 hours');
            END IF;
        END LOOP;
    END LOOP;
END $$;

-- 8. UPDATE MATERIAL STOCK
UPDATE materials m SET 
    quantity_in_stock = (
        SELECT COALESCE(SUM(CASE WHEN type = 'IN' THEN quantity ELSE -quantity END), 0)
        FROM stock_transactions st WHERE st.material_id = m.material_id
    );

UPDATE materials SET quantity_in_stock = 0 WHERE quantity_in_stock < 0;

-- ==========================================
-- SUMMARY
-- ==========================================
DO $$
BEGIN
    RAISE NOTICE '=== DATABASE INITIALIZATION COMPLETE ===';
    RAISE NOTICE 'Data range: % to %', CURRENT_DATE - interval '1 year', CURRENT_DATE;
    RAISE NOTICE 'Products: %', (SELECT COUNT(*) FROM products);
    RAISE NOTICE 'Materials: %', (SELECT COUNT(*) FROM materials);
    RAISE NOTICE 'Staff: %', (SELECT COUNT(*) FROM users WHERE role_id IN (2,3));
    RAISE NOTICE 'Customers: %', (SELECT COUNT(*) FROM users WHERE role_id = 4);
    RAISE NOTICE 'Shifts: %', (SELECT COUNT(*) FROM shifts);
    RAISE NOTICE 'Orders: %', (SELECT COUNT(*) FROM orders);
END $$;

COMMENT ON DATABASE rice_shop IS 'Rice Shop Management System Database';
