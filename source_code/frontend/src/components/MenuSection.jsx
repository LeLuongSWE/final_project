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

            {/* Items Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
