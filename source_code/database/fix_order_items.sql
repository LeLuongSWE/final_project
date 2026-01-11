-- ==========================================
-- FIX ORDER_ITEMS DATA - Thêm nhiều món thực vào mỗi đơn
-- ==========================================

-- Xóa order_items cũ (fake data)
TRUNCATE TABLE order_items CASCADE;

-- Lấy danh sách product_ids và prices
DO $$
DECLARE
    order_rec RECORD;
    prod_rec RECORD;
    items_count INTEGER;
    item_i INTEGER;
    rand_product_id INTEGER;
    rand_price DECIMAL;
    total_calc DECIMAL;
    products_arr INTEGER[];
    prices_arr DECIMAL[];
BEGIN
    -- Lấy products có giá > 0
    SELECT ARRAY_AGG(product_id), ARRAY_AGG(price)
    INTO products_arr, prices_arr
    FROM products WHERE is_active = true AND price > 0;
    
    -- Loop qua từng order
    FOR order_rec IN SELECT order_id, total_amount FROM orders LOOP
        total_calc := 0;
        items_count := 2 + floor(random() * 3)::int; -- 2-4 items per order
        
        FOR item_i IN 1..items_count LOOP
            -- Random product
            DECLARE
                rand_idx INTEGER := 1 + floor(random() * array_length(products_arr, 1))::int;
            BEGIN
                IF rand_idx <= array_length(products_arr, 1) THEN
                    rand_product_id := products_arr[rand_idx];
                    rand_price := prices_arr[rand_idx];
                    
                    -- Insert order item
                    INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase)
                    VALUES (order_rec.order_id, rand_product_id, 1, rand_price);
                    
                    total_calc := total_calc + rand_price;
                END IF;
            END;
        END LOOP;
        
        -- Update order total to match items
        UPDATE orders SET total_amount = total_calc WHERE order_id = order_rec.order_id;
    END LOOP;
    
    RAISE NOTICE 'Fixed order_items for % orders', (SELECT COUNT(*) FROM orders);
END $$;

-- Verify
SELECT 
    'Total order_items' as metric, 
    COUNT(*)::text as value 
FROM order_items
UNION ALL
SELECT 
    'Unique products sold', 
    COUNT(DISTINCT product_id)::text 
FROM order_items
UNION ALL
SELECT 
    'Products with orders', 
    (SELECT COUNT(DISTINCT oi.product_id) FROM order_items oi)::text;
