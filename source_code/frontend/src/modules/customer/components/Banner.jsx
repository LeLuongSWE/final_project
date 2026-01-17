import React from 'react';
import { Megaphone } from 'lucide-react';

function Banner({ message = "Hôm nay có sườn xào chua ngọt đặc biệt!" }) {
    return (
        <div className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
            {/* Decorative background patterns */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute -right-10 -top-10 w-40 h-40 bg-white rounded-full"></div>
                <div className="absolute -left-5 -bottom-5 w-24 h-24 bg-white rounded-full"></div>
            </div>

            <div className="relative z-10 flex items-center gap-4">
                <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                    <Megaphone size={28} className="text-white" />
                </div>
                <div>
                    <h2 className="text-lg font-bold uppercase tracking-wide">
                        Banner Quảng Cáo / Thông Báo Hôm Nay
                    </h2>
                    <p className="mt-1 text-white/90 text-sm">
                        (Ví dụ: {message})
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Banner;
