import React, { useEffect, useRef, useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';

// Fix for default marker icon issues in Vite/Webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Component to handle map center updates
const RecenterMap = ({ position }) => {
    const map = useMap();
    useEffect(() => {
        if (position) {
            map.flyTo(position, 16);
        }
    }, [position, map]);
    return null;
};

const MapSelector = ({ position, onPositionChange, showGetLocation = true, height = "h-64" }) => {
    const markerRef = useRef(null);
    const [isGettingLocation, setIsGettingLocation] = useState(false);
    const [locationError, setLocationError] = useState(null);

    // Default to Hanoi if no position provided
    const center = position || [21.028511, 105.804817];

    // Check if position is valid
    const isValidPosition = position &&
        typeof position[0] === 'number' &&
        typeof position[1] === 'number';

    const eventHandlers = useMemo(
        () => ({
            dragend() {
                const marker = markerRef.current;
                if (marker) {
                    const latLng = marker.getLatLng();
                    onPositionChange([latLng.lat, latLng.lng]);
                }
            },
        }),
        [onPositionChange],
    );

    // Get current location using browser geolocation API
    const getCurrentLocation = () => {
        if (!navigator.geolocation) {
            setLocationError('Trình duyệt không hỗ trợ định vị');
            return;
        }

        setIsGettingLocation(true);
        setLocationError(null);

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                onPositionChange([latitude, longitude]);
                setIsGettingLocation(false);
            },
            (error) => {
                setIsGettingLocation(false);
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        setLocationError('Bạn đã từ chối quyền truy cập vị trí');
                        break;
                    case error.POSITION_UNAVAILABLE:
                        setLocationError('Không thể lấy vị trí hiện tại');
                        break;
                    case error.TIMEOUT:
                        setLocationError('Hết thời gian lấy vị trí');
                        break;
                    default:
                        setLocationError('Lỗi không xác định');
                }
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 60000
            }
        );
    };

    return (
        <div className="relative">
            {/* Get Location Button */}
            {showGetLocation && (
                <div className="mb-2">
                    <button
                        type="button"
                        onClick={getCurrentLocation}
                        disabled={isGettingLocation}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${isGettingLocation
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-blue-600 hover:bg-blue-700 text-white'
                            }`}
                    >
                        {isGettingLocation ? (
                            <>
                                <span className="animate-spin">⏳</span>
                                Đang lấy vị trí...
                            </>
                        ) : (
                            <>
                                📍 Vị trí hiện tại
                            </>
                        )}
                    </button>
                    {locationError && (
                        <p className="text-red-500 text-sm mt-1">{locationError}</p>
                    )}
                </div>
            )}

            {/* Map Container */}
            <div className={`${height} w-full rounded-lg overflow-hidden border border-gray-300 z-0`}>
                <MapContainer
                    center={center}
                    zoom={13}
                    style={{ height: '100%', width: '100%' }}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    {isValidPosition && (
                        <>
                            <Marker
                                draggable={true}
                                eventHandlers={eventHandlers}
                                position={position}
                                ref={markerRef}
                            >
                            </Marker>
                            <RecenterMap position={position} />
                        </>
                    )}
                </MapContainer>
            </div>

            {/* Instructions */}
            <p className="text-xs text-gray-500 mt-1">
                💡 Kéo thả marker để điều chỉnh vị trí chính xác
            </p>
        </div>
    );
};

export default MapSelector;

