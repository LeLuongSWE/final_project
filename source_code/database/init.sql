-- Rice Shop Database Initialization Script
-- PostgreSQL 15+

-- Create extensions if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- TABLE: roles
-- Mô tả: Quản lý vai trò người dùng (Admin, Cashier, Kitchen Staff, Customer)
-- ==========================================
CREATE TABLE roles (
    role_id BIGSERIAL PRIMARY KEY,
    role_name VARCHAR(20) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- TABLE: users
-- Mô tả: Quản lý người dùng hệ thống
-- ==========================================
CREATE TABLE users (
    user_id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL, -- BCrypt hashed password
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    role_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user_role FOREIGN KEY (role_id) REFERENCES roles(role_id) ON DELETE RESTRICT
);

CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_role_id ON users(role_id);

-- ==========================================
-- TABLE: products
-- Mô tả: Quản lý món ăn (Master Data)
-- ==========================================
CREATE TABLE products (
    product_id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
    image_url VARCHAR(255),
    category VARCHAR(50) DEFAULT 'MÓN MẶN', -- MÓN MẶN, RAU/CANH, CƠM THÊM
    is_active BOOLEAN DEFAULT true, -- Trạng thái hiển thị trong menu
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_products_is_active ON products(is_active);

-- ==========================================
-- TABLE: orders
-- Mô tả: Quản lý đơn hàng
-- ==========================================
CREATE TABLE orders (
    order_id BIGSERIAL PRIMARY KEY,
    user_id BIGINT, -- NULL nếu khách vãng lai
    order_code VARCHAR(20) NOT NULL UNIQUE, -- Mã đơn hàng dạng #DH2412001
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    estimated_pickup_time TIMESTAMP, -- Thời gian dự kiến nhận
    total_amount DECIMAL(15, 2) NOT NULL CHECK (total_amount >= 0),
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING', -- PENDING, PREPARING, READY, COMPLETED, CANCELLED
    payment_method VARCHAR(20) NOT NULL, -- CASH, VIETQR
    table_number VARCHAR(10), -- Số bàn (cho đơn tại quán)
    order_type VARCHAR(20) NOT NULL DEFAULT 'ONLINE', -- ONLINE, INSTORE
    shift_id BIGINT, -- Ca làm việc
    cashier_id BIGINT, -- Nhân viên tạo đơn (cho INSTORE)
    CONSTRAINT fk_order_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL
);

CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_order_date ON orders(order_date);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_order_code ON orders(order_code);

-- ==========================================
-- TABLE: order_items
-- Mô tả: Chi tiết đơn hàng (Snapshot giá tại thời điểm mua)
-- ==========================================
CREATE TABLE order_items (
    item_id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    price_at_purchase DECIMAL(10, 2) NOT NULL CHECK (price_at_purchase >= 0), -- Snapshot giá
    CONSTRAINT fk_order_item_order FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
    CONSTRAINT fk_order_item_product FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE RESTRICT
);

CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);

-- ==========================================
-- TABLE: order_status_history
-- Mô tả: Lịch sử thay đổi trạng thái đơn hàng
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
-- Mô tả: Quản lý ca làm việc của nhân viên
-- ==========================================
CREATE TABLE shifts (
    shift_id BIGSERIAL PRIMARY KEY,
    cashier_id BIGINT NOT NULL,
    start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    end_time TIMESTAMP,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE', -- ACTIVE, CLOSED
    total_orders INTEGER DEFAULT 0,
    total_revenue DECIMAL(15, 2) DEFAULT 0,
    cash_revenue DECIMAL(15, 2) DEFAULT 0,
    transfer_revenue DECIMAL(15, 2) DEFAULT 0,
    CONSTRAINT fk_shift_cashier FOREIGN KEY (cashier_id) REFERENCES users(user_id) ON DELETE RESTRICT
);

CREATE INDEX idx_shifts_cashier_id ON shifts(cashier_id);
CREATE INDEX idx_shifts_status ON shifts(status);

-- ==========================================
-- INSERT SAMPLE DATA
-- ==========================================

-- Insert roles
INSERT INTO roles (role_name) VALUES 
    ('ADMIN'),
    ('CASHIER'),
    ('KITCHEN'),
    ('CUSTOMER');

-- Insert sample admin user (password: admin123)
INSERT INTO users (username, password, full_name, role_id) VALUES 
    ('admin', '$2a$10$ZzznGLbzRYsL2V6iTYheOuyaVDRBsqUHdt8q5ZSWpQCAQiOxOIWgS', 'Administrator', 1),
    ('cashier1', '$2a$10$ZzznGLbzRYsL2V6iTYheOuyaVDRBsqUHdt8q5ZSWpQCAQiOxOIWgS', 'Nguyễn Thu Ngân', 2),
    ('kitchen1', '$2a$10$ZzznGLbzRYsL2V6iTYheOuyaVDRBsqUHdt8q5ZSWpQCAQiOxOIWgS', 'Trần Bếp Trưởng', 3);

-- Insert sample products (món ăn) - matching mockup with categories
INSERT INTO products (name, price, image_url, category, is_active) VALUES 
    ('Sườn xào', 15000, '/images/suon-xao.jpg', 'MÓN MẶN', true),
    ('Thịt kho', 10000, '/images/thit-kho.jpg', 'MÓN MẶN', true),
    ('Cá kho tộ', 20000, '/images/ca-kho-to.jpg', 'MÓN MẶN', true),
    ('Gà rang', 15000, '/images/ga-rang.jpg', 'MÓN MẶN', true),
    ('Trứng rán', 5000, '/images/trung-ran.jpg', 'MÓN MẶN', true),
    ('Đậu sốt', 5000, '/images/dau-sot.jpg', 'RAU/CANH', true),
    ('Rau muống', 5000, '/images/rau-muong.jpg', 'RAU/CANH', true),
    ('Canh chua', 10000, '/images/canh-chua.jpg', 'RAU/CANH', true),
    ('Canh rau', 0, '/images/canh-rau.jpg', 'RAU/CANH', true),
    ('Cơm suất thường', 30000, '/images/com-suat-thuong.jpg', 'CƠM THÊM', true),
    ('Cơm thêm', 5000, '/images/com-them.jpg', 'CƠM THÊM', true);

-- Insert sample order (online order)
INSERT INTO orders (user_id, order_code, estimated_pickup_time, total_amount, status, payment_method, order_type) VALUES 
    (2, 'DH2412001', CURRENT_TIMESTAMP + INTERVAL '30 minutes', 85000, 'COMPLETED', 'CASH', 'ONLINE');

-- Insert sample order items
INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase) VALUES 
    (1, 1, 1, 35000), -- 1x Cơm Sườn Nướng
    (1, 2, 1, 40000), -- 1x Cơm Gà Xối Mỡ
    (1, 7, 2, 5000);  -- 2x Trà Đá

-- Insert sample order status history
INSERT INTO order_status_history (order_id, status, changed_at) VALUES 
    (1, 'PENDING', CURRENT_TIMESTAMP - INTERVAL '45 minutes'),
    (1, 'PREPARING', CURRENT_TIMESTAMP - INTERVAL '30 minutes'),
    (1, 'READY', CURRENT_TIMESTAMP - INTERVAL '15 minutes'),
    (1, 'COMPLETED', CURRENT_TIMESTAMP);

-- ==========================================
-- VIEWS (Optional - For Reporting)
-- ==========================================

-- View: Daily revenue
CREATE OR REPLACE VIEW daily_revenue AS
SELECT 
    DATE(order_date) as date,
    COUNT(*) as order_count,
    SUM(total_amount) as total_revenue
FROM orders
WHERE status = 'COMPLETED'
GROUP BY DATE(order_date)
ORDER BY date DESC;

-- View: Top selling products
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
-- TRIGGERS (Auto-update timestamp)
-- ==========================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for products table
CREATE TRIGGER update_products_updated_at 
BEFORE UPDATE ON products
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- TABLE: materials (Nguyên vật liệu)
-- Mô tả: Quản lý nguyên vật liệu, tồn kho
-- ==========================================
CREATE TABLE materials (
    material_id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    unit VARCHAR(20) NOT NULL, -- kg, lít, bó, gói...
    unit_price DECIMAL(10, 2) DEFAULT 0,
    quantity_in_stock DECIMAL(10, 2) DEFAULT 0,
    min_stock_level DECIMAL(10, 2) DEFAULT 0, -- Mức cảnh báo tồn kho thấp
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_materials_name ON materials(name);

-- ==========================================
-- TABLE: stock_transactions (Giao dịch nhập/xuất kho)
-- Mô tả: Lịch sử nhập xuất nguyên vật liệu
-- ==========================================
CREATE TABLE stock_transactions (
    transaction_id BIGSERIAL PRIMARY KEY,
    material_id BIGINT NOT NULL,
    type VARCHAR(10) NOT NULL CHECK (type IN ('IN', 'OUT')), -- IN: nhập, OUT: xuất
    quantity DECIMAL(10, 2) NOT NULL,
    unit_price DECIMAL(10, 2) DEFAULT 0,
    note TEXT,
    created_by BIGINT, -- user_id của người thao tác
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_stock_material FOREIGN KEY (material_id) REFERENCES materials(material_id) ON DELETE CASCADE
);

CREATE INDEX idx_stock_transactions_material ON stock_transactions(material_id);
CREATE INDEX idx_stock_transactions_type ON stock_transactions(type);
CREATE INDEX idx_stock_transactions_created_at ON stock_transactions(created_at);

-- Trigger for materials table
CREATE TRIGGER update_materials_updated_at 
BEFORE UPDATE ON materials
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- INSERT: Sample materials data
-- ==========================================
INSERT INTO materials (name, unit, unit_price, quantity_in_stock, min_stock_level) VALUES
('Gạo tẻ', 'kg', 18000, 50, 10),
('Thịt lợn ba chỉ', 'kg', 120000, 15, 5),
('Thịt gà', 'kg', 85000, 10, 3),
('Cá rô phi', 'kg', 55000, 8, 2),
('Trứng gà', 'quả', 3500, 100, 30),
('Đậu phụ', 'bìa', 5000, 20, 5),
('Rau muống', 'bó', 8000, 15, 5),
('Rau cải ngọt', 'bó', 10000, 12, 4),
('Bí xanh', 'kg', 15000, 5, 2),
('Dầu ăn', 'lít', 45000, 10, 3),
('Nước mắm', 'lít', 35000, 5, 2),
('Muối', 'kg', 8000, 3, 1),
('Đường', 'kg', 22000, 3, 1),
('Hành khô', 'kg', 40000, 2, 0.5),
('Tỏi', 'kg', 80000, 1.5, 0.5);

-- Sample stock transactions
INSERT INTO stock_transactions (material_id, type, quantity, unit_price, note) VALUES
(1, 'IN', 50, 18000, 'Nhập kho đầu kỳ'),
(2, 'IN', 15, 120000, 'Nhập kho đầu kỳ'),
(3, 'IN', 10, 85000, 'Nhập kho đầu kỳ'),
(5, 'IN', 100, 3500, 'Nhập kho đầu kỳ'),
(1, 'OUT', 5, 18000, 'Sử dụng nấu cơm'),
(2, 'OUT', 2, 120000, 'Sử dụng làm thịt kho');

-- ==========================================
-- COMPLETED
-- ==========================================
COMMENT ON DATABASE rice_shop IS 'Rice Shop Management System Database';
