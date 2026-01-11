import React from 'react';
import { Plus, ImageOff } from 'lucide-react';

function MenuItemCard({ item, onAddToCart }) {
    const { id, name, price, image, imageUrl, imageData, available = true } = item;

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN').format(price) + ' đ';
    };

    // Get image source - prioritize imageData then imageUrl then image
    const getImageSrc = () => {
        if (imageData) return imageData;
        if (imageUrl) return imageUrl;
        if (image) return image;
        return null;
    };

    const imageSrc = getImageSrc();

    return (
        <div className={`
      bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm 
      hover:shadow-lg hover:border-orange-200 transition-all duration-300
      ${!available ? 'opacity-60' : ''}
    `}>
            {/* Image Container - Fixed aspect ratio with proper sizing */}
            <div className="relative w-full aspect-square bg-gray-100 flex items-center justify-center overflow-hidden">
                {imageSrc ? (
                    <img
                        src={imageSrc}
                        alt={name}
                        className="w-full h-full object-cover"
                        style={{ objectFit: 'cover' }}
                        onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling && (e.target.nextSibling.style.display = 'flex');
                        }}
                    />
                ) : null}
                {!imageSrc && (
                    <div className="flex flex-col items-center gap-2 text-gray-400">
                        <ImageOff size={32} />
                        <span className="text-xs">[X] Hình ảnh món ăn</span>
                    </div>
                )}
                {!available && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                            Hết món
                        </span>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-4">
                <h3 className="font-semibold text-gray-800 text-base line-clamp-2 min-h-[48px]">
                    {name}
                </h3>
                <p className="text-orange-600 font-bold text-lg mt-2">
                    {formatPrice(price)}
                </p>

                {/* Add Button */}
                <button
                    onClick={() => available && onAddToCart?.(item)}
                    disabled={!available}
                    className={`
            w-full mt-3 py-2.5 rounded-lg font-medium text-sm flex items-center justify-center gap-2
            transition-all duration-200
            ${available
                            ? 'bg-orange-50 text-orange-600 hover:bg-orange-500 hover:text-white border border-orange-200 hover:border-orange-500'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                        }
          `}
                >
                    <Plus size={18} />
                    <span>Nút Thêm (+)</span>
                </button>
            </div>
        </div>
    );
}

export default MenuItemCard;
