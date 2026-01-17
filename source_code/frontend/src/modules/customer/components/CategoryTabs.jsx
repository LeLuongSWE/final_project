import React from 'react';

const categories = [
    { id: 'all', label: 'TẤT CẢ' },
    { id: 'mon-man', label: 'MÓN MẶN' },
    { id: 'rau-canh', label: 'RAU/CANH' },
    { id: 'com-them', label: 'CƠM THÊM' },
];

function CategoryTabs({ activeCategory = 'all', onCategoryChange }) {
    return (
        <div className="flex flex-wrap gap-2">
            {categories.map((category) => {
                const isActive = activeCategory === category.id;
                return (
                    <button
                        key={category.id}
                        onClick={() => onCategoryChange?.(category.id)}
                        className={`
              px-5 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 border-2
              ${isActive
                                ? 'bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-200'
                                : 'bg-white text-gray-700 border-gray-200 hover:border-orange-300 hover:text-orange-600'
                            }
            `}
                    >
                        {category.label}
                    </button>
                );
            })}
        </div>
    );
}

export default CategoryTabs;
