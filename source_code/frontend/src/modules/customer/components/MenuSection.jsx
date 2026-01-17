import React from 'react';
import MenuItemCard from './MenuItemCard';

function MenuSection({ title, subtitle, items = [], onAddToCart }) {
    if (items.length === 0) return null;

    return (
        <section className="mb-8">
            {/* Section Header */}
            <div className="mb-4">
                <h2 className="text-xl font-bold text-gray-800">
                    {title}
                </h2>
                {subtitle && (
                    <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
                )}
            </div>

            {/* Items Grid - More columns = smaller cards = sharper images */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3">
                {items.map((item) => (
                    <MenuItemCard
                        key={item.id}
                        item={item}
                        onAddToCart={onAddToCart}
                    />
                ))}
            </div>
        </section>
    );
}

export default MenuSection;
