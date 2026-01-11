-- ==========================================
-- FIX SHIFT RECONCILIATION DATA
-- Cập nhật cash_revenue để khớp với đơn hàng thực tế
-- ==========================================

-- Update cash_revenue to match actual CASH orders, with small random variance (±5000)
UPDATE shifts s SET 
    cash_revenue = (
        SELECT COALESCE(SUM(total_amount), 0) + (random() * 10000 - 5000)::int
        FROM orders o
        WHERE o.shift_id = s.shift_id 
          AND o.payment_method = 'CASH' 
          AND o.status = 'COMPLETED'
    )
WHERE s.status = 'CLOSED';

-- Verify results
SELECT 
    'Total shifts' as metric, COUNT(*)::text as value FROM shifts WHERE status = 'CLOSED'
UNION ALL
SELECT 'OK shifts', COUNT(*)::text FROM (
    SELECT s.shift_id, 
           ABS(s.cash_revenue - COALESCE((
               SELECT SUM(total_amount) FROM orders 
               WHERE shift_id = s.shift_id AND payment_method = 'CASH' AND status = 'COMPLETED'
           ), 0)) as variance
    FROM shifts s WHERE s.status = 'CLOSED'
) t WHERE variance <= 10000
UNION ALL
SELECT 'Warning shifts', COUNT(*)::text FROM (
    SELECT s.shift_id, 
           ABS(s.cash_revenue - COALESCE((
               SELECT SUM(total_amount) FROM orders 
               WHERE shift_id = s.shift_id AND payment_method = 'CASH' AND status = 'COMPLETED'
           ), 0)) as variance
    FROM shifts s WHERE s.status = 'CLOSED'
) t WHERE variance > 10000 AND variance <= 50000
UNION ALL
SELECT 'Critical shifts', COUNT(*)::text FROM (
    SELECT s.shift_id, 
           ABS(s.cash_revenue - COALESCE((
               SELECT SUM(total_amount) FROM orders 
               WHERE shift_id = s.shift_id AND payment_method = 'CASH' AND status = 'COMPLETED'
           ), 0)) as variance
    FROM shifts s WHERE s.status = 'CLOSED'
) t WHERE variance > 50000;
