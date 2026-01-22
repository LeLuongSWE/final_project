import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Banner from '../components/Banner';
import CategoryTabs from '../components/CategoryTabs';
import MenuSection from '../components/MenuSection';
import { useAuth } from '../../../shared/context/AuthContext';
import { useCart } from '../../../shared/context/CartContext';
import productService from '../../../shared/services/productService';

function HomePage() {
    const [activeCategory, setActiveCategory] = useState('all');
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { isAuthenticated } = useAuth();
    const { addToCart } = useCart();
    const navigate = useNavigate();

    // Fetch products from API
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                const data = await productService.getAllProducts();

                // Map database category to filter ID
                const mapCategory = (dbCategory) => {
                    if (!dbCategory) return 'mon-man';
                    const cat = dbCategory.toUpperCase();
                    if (cat.includes('RAU') || cat.includes('CANH')) return 'rau-canh';
                    if (cat.includes('NƯỚC') || cat.includes('NUOC') || cat.includes('UỐNG') || cat.includes('UONG')) return 'nuoc';
                    if (cat.includes('CƠM') || cat.includes('COM')) return 'com-them';
                    return 'mon-man'; // Default MÓN MẶN
                };


                // Transform API data to match component format
                const transformedProducts = data.map(p => ({
                    id: p.productId,
                    product_id: p.productId,
                    name: p.name,
                    price: p.price,
                    image: p.imageUrl,
                    imageUrl: p.imageUrl,
                    imageData: p.imageData,
                    available: p.isActive,
                    category: mapCategory(p.category)
                }));

                setProducts(transformedProducts);
                setError(null);
            } catch (err) {
                console.error('Error fetching products:', err);
                setError('Không thể tải danh sách món ăn. Vui lòng thử lại sau.');
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    const handleAddToCart = (item) => {
        if (!isAuthenticated) {
            alert('Vui lòng đăng nhập để thêm vào giỏ hàng');
            navigate('/login');
            return;
        }
        addToCart(item);
    };

    const handleCategoryChange = (category) => {
        setActiveCategory(category);
    };

    // Filter items based on category and availability
    const getFilteredItems = (items) => {
        return items.filter((item) => {
            if (!item.available) return false;
            if (activeCategory === 'all') return true;
            return item.category === activeCategory;
        });
    };

    // Get current date in Vietnamese format
    const getCurrentDate = () => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date().toLocaleDateString('vi-VN', options);
    };

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Sidebar - only show if authenticated */}
            {isAuthenticated && <Sidebar activePath="/" />}

            {/* Main Content */}
            <main className="flex-1 p-6 overflow-auto">
                {/* Header with Login/Register for non-authenticated users */}
                {!isAuthenticated && (
                    <div className="bg-white rounded-lg shadow-sm p-4 mb-6 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-lg flex items-center justify-center">
                                <span className="text-white text-xl">🍚</span>
                            </div>
                            <h1 className="text-2xl font-bold text-gray-800">Cơm Bình Dân</h1>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => navigate('/login')}
                                className="px-6 py-2 border border-orange-600 text-orange-600 rounded-lg hover:bg-orange-50 transition font-medium"
                            >
                                Đăng nhập
                            </button>
                            <button
                                onClick={() => navigate('/register')}
                                className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition font-medium"
                            >
                                Đăng ký
                            </button>
                        </div>
                    </div>
                )}

                {/* Banner */}
                <Banner message="Hôm nay có sườn xào chua ngọt đặc biệt!" />

                {/* Menu Date Header */}
                <div className="mt-8 mb-4">
                    <h2 className="text-2xl font-bold text-gray-800 italic">
                        Thực đơn ngày: {getCurrentDate()}
                    </h2>
                </div>

                {/* Category Tabs */}
                <div className="mb-6">
                    <CategoryTabs
                        activeCategory={activeCategory}
                        onCategoryChange={handleCategoryChange}
                    />
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
                        <p className="mt-4 text-gray-600">Đang tải thực đơn...</p>
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800 text-center">
                        {error}
                    </div>
                )}

                {/* Menu Sections - show all products for now */}
                {!loading && !error && products.length > 0 && (
                    <MenuSection
                        title="Thực đơn hôm nay"
                        subtitle="(Đang sẵn hàng)"
                        items={getFilteredItems(products)}
                        onAddToCart={handleAddToCart}
                    />
                )}

                {/* No products */}
                {!loading && !error && products.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-gray-500">Chưa có món ăn nào trong thực đơn.</p>
                    </div>
                )}

                {/* Footer note */}
                <p className="text-center text-gray-400 text-sm mt-8">
                    (Sản phẩm từ cơ sở dữ liệu)
                </p>
            </main>
        </div>
    );
}

export default HomePage;
