import React, { useState, useEffect } from 'react';
import api from '../api/axiosClient';

/**
 * AddressSelector - Cascading dropdowns for Vietnamese administrative divisions
 * Uses backend API endpoints
 * 
 * Props:
 * - city: Current selected province name
 * - district: Current selected district name
 * - ward: Current selected ward name
 * - onChange: Callback with { city, district, ward } when any selection changes
 * - disabled: Whether the selectors are disabled
 */
const AddressSelector = ({ city, district, ward, onChange, disabled = false }) => {
    // Data lists
    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);

    // Loading states
    const [loadingProvinces, setLoadingProvinces] = useState(true);
    const [loadingDistricts, setLoadingDistricts] = useState(false);
    const [loadingWards, setLoadingWards] = useState(false);

    // Selected codes
    const [selectedProvinceCode, setSelectedProvinceCode] = useState('');
    const [selectedDistrictCode, setSelectedDistrictCode] = useState('');
    const [selectedWardCode, setSelectedWardCode] = useState('');

    // Load provinces on mount
    useEffect(() => {
        const loadProvinces = async () => {
            try {
                const response = await api.get('/addresses/provinces');
                setProvinces(response.data);
            } catch (err) {
                console.error('Error loading provinces:', err);
            } finally {
                setLoadingProvinces(false);
            }
        };
        loadProvinces();
    }, []);

    // Effect: Sync props (city/district/ward names) to internal state (codes)
    // Only happens when props change from parent or when data lists are loaded
    useEffect(() => {
        if (!city || provinces.length === 0) {
            if (!city) setSelectedProvinceCode('');
            return;
        }

        // Find province code by name
        const province = provinces.find(p => p.name === city || p.nameWithType === city);
        if (province) {
            if (province.code !== selectedProvinceCode) {
                setSelectedProvinceCode(province.code);
            }

            // If we have a province code but no districts list, we need to load districts
            // This is handled by the useEffect watching selectedProvinceCode
        }
    }, [city, provinces]);

    useEffect(() => {
        if (!district || districts.length === 0) {
            if (!district && !loadingDistricts) setSelectedDistrictCode('');
            return;
        }

        // Find district code by name
        const districtObj = districts.find(d => d.name === district || d.nameWithType === district);
        if (districtObj) {
            if (districtObj.code !== selectedDistrictCode) {
                setSelectedDistrictCode(districtObj.code);
            }
        }
    }, [district, districts]);

    useEffect(() => {
        if (!ward || wards.length === 0) {
            if (!ward && !loadingWards) setSelectedWardCode('');
            return;
        }

        // Find ward code by name
        const wardObj = wards.find(w => w.name === ward || w.nameWithType === ward);
        if (wardObj) {
            if (wardObj.code !== selectedWardCode) {
                setSelectedWardCode(wardObj.code);
            }
        }
    }, [ward, wards]);


    // Load districts when province code changes
    useEffect(() => {
        if (!selectedProvinceCode) {
            setDistricts([]);
            return;
        }

        const loadDistricts = async () => {
            setLoadingDistricts(true);
            try {
                const response = await api.get(`/addresses/provinces/${selectedProvinceCode}/districts`);
                setDistricts(response.data);
            } catch (err) {
                console.error('Error loading districts:', err);
            } finally {
                setLoadingDistricts(false);
            }
        };
        loadDistricts();
    }, [selectedProvinceCode]);

    // Load wards when district code changes
    useEffect(() => {
        if (!selectedDistrictCode) {
            setWards([]);
            return;
        }

        const loadWards = async () => {
            setLoadingWards(true);
            try {
                const response = await api.get(`/addresses/districts/${selectedDistrictCode}/wards`);
                setWards(response.data);
            } catch (err) {
                console.error('Error loading wards:', err);
            } finally {
                setLoadingWards(false);
            }
        };
        loadWards();
    }, [selectedDistrictCode]);


    // Handlers
    const handleProvinceChange = (e) => {
        const code = e.target.value;
        setSelectedProvinceCode(code);
        setSelectedDistrictCode('');
        setSelectedWardCode('');
        setDistricts([]);
        setWards([]);

        const province = provinces.find(p => p.code === code);
        onChange({
            city: province ? province.name : '',
            district: '',
            ward: ''
        });
    };

    const handleDistrictChange = (e) => {
        const code = e.target.value;
        setSelectedDistrictCode(code);
        setSelectedWardCode('');
        setWards([]);

        const province = provinces.find(p => p.code === selectedProvinceCode);
        const district = districts.find(d => d.code === code);
        onChange({
            city: province ? province.name : '',
            district: district ? district.name : '',
            ward: ''
        });
    };

    const handleWardChange = (e) => {
        const code = e.target.value;
        setSelectedWardCode(code);

        const province = provinces.find(p => p.code === selectedProvinceCode);
        const district = districts.find(d => d.code === selectedDistrictCode);
        const wardObj = wards.find(w => w.code === code);
        onChange({
            city: province ? province.name : '',
            district: district ? district.name : '',
            ward: wardObj ? wardObj.name : ''
        });
    };

    if (loadingProvinces) {
        return (
            <div className="grid grid-cols-3 gap-3">
                <div className="animate-pulse bg-gray-200 h-10 rounded-lg"></div>
                <div className="animate-pulse bg-gray-200 h-10 rounded-lg"></div>
                <div className="animate-pulse bg-gray-200 h-10 rounded-lg"></div>
            </div>
        );
    }

    const selectClass = "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed";

    return (
        <div className="grid grid-cols-3 gap-3">
            {/* Province/City */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tỉnh/Thành phố
                </label>
                <select
                    value={selectedProvinceCode}
                    onChange={handleProvinceChange}
                    disabled={disabled}
                    className={selectClass}
                >
                    <option value="">-- Chọn --</option>
                    {provinces.map(p => (
                        <option key={p.code} value={p.code}>{p.name}</option>
                    ))}
                </select>
            </div>

            {/* District */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quận/Huyện
                </label>
                <select
                    value={selectedDistrictCode}
                    onChange={handleDistrictChange}
                    disabled={disabled || !selectedProvinceCode || loadingDistricts}
                    className={selectClass}
                >
                    <option value="">{loadingDistricts ? 'Đang tải...' : '-- Chọn --'}</option>
                    {districts.map(d => (
                        <option key={d.code} value={d.code}>{d.name}</option>
                    ))}
                </select>
            </div>

            {/* Ward */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phường/Xã
                </label>
                <select
                    value={selectedWardCode}
                    onChange={handleWardChange}
                    disabled={disabled || !selectedDistrictCode || loadingWards}
                    className={selectClass}
                >
                    <option value="">{loadingWards ? 'Đang tải...' : '-- Chọn --'}</option>
                    {wards.map(w => (
                        <option key={w.code} value={w.code}>{w.name}</option>
                    ))}
                </select>
            </div>
        </div>
    );
};

export default AddressSelector;
