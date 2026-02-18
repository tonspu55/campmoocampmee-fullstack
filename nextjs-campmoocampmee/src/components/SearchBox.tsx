'use client'

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"

interface ProvinceData {
  name: string;
  slug: string;
  count: number;
}

const SearchBox = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredProvinces, setFilteredProvinces] = useState<ProvinceData[]>([]);
  const [availableProvinces, setAvailableProvinces] = useState<ProvinceData[]>([]);
  const [selectedProvince, setSelectedProvince] = useState<ProvinceData | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // ดึงข้อมูลจังหวัดที่มีข้อมูลจาก API
  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const response = await fetch('/api/provinces');
        if (response.ok) {
          const data = await response.json();
          setAvailableProvinces(data.provinces || []);
        }
      } catch (error) {
        console.error('Error fetching provinces:', error);
        // Fallback to empty array if API fails
        setAvailableProvinces([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProvinces();
  }, []);

  const handleInputChange = (value: string) => {
    setSearchTerm(value);
    setSelectedProvince(null);

    if (value.length > 0) {
      const filtered = availableProvinces.filter((province: ProvinceData) =>
        province.name.includes(value)
      );
      setFilteredProvinces(filtered);
    } else {
      setFilteredProvinces(availableProvinces);
    }
    setShowDropdown(true);
  };

  const handleProvinceSelect = (province: ProvinceData) => {
    setSelectedProvince(province);
    setSearchTerm(province.name);
    setShowDropdown(false);
  };

  const handleSearch = () => {
    if (selectedProvince) {
      router.push(`/search?province=${selectedProvince.slug}`);
    } else if (searchTerm.trim()) {
      // ถ้าพิมพ์เองไม่ได้เลือก ให้หา slug จากชื่อที่ตรงกัน
      const matchedProvince = availableProvinces.find(p => p.name === searchTerm.trim());
      if (matchedProvince) {
        router.push(`/search?province=${matchedProvince.slug}`);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleInputFocus = () => {
    if (searchTerm.length > 0) {
      const filtered = availableProvinces.filter((province: ProvinceData) =>
        province.name.includes(searchTerm)
      );
      setFilteredProvinces(filtered);
    } else {
      setFilteredProvinces(availableProvinces);
    }
    setShowDropdown(true);
  };

  const handleInputBlur = () => {
    // ใช้ setTimeout เพื่อให้ onclick ของ dropdown item ทำงานก่อน
    setTimeout(() => {
      setShowDropdown(false);
    }, 150);
  };

  return (
    <div className="relative">
      <div className="flex">
        <Input
          value={searchTerm}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyPress={handleKeyPress}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          placeholder={isLoading ? "กำลังโหลดข้อมูล..." : "ระบุชื่อจังหวัด"}
          disabled={isLoading}
          className="border-0 bg-white dark:text-[#000000] dark:bg-white focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 rounded-r-none"
        />
        <Button
          onClick={handleSearch}
          className="rounded-l-none cursor-pointer"
          disabled={!selectedProvince && !searchTerm.trim() || isLoading}
        >
          ค้นหา
        </Button>
      </div>

      {showDropdown && filteredProvinces.length > 0 && !isLoading && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-50 overflow-y-auto">
          {filteredProvinces.map((province, index) => (
            <div
              key={index}
              onClick={() => handleProvinceSelect(province)}
              className="text-left  py-2 px-3  hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
            >
              <div className="flex flex-row justify-between items-center">
                <p className="text-sm md:text-md dark:text-black">{province.name}</p>
                <span className="text-xs text-gray-500 ml-2">(พบ {province.count} แคมป์)</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {showDropdown && filteredProvinces.length === 0 && !isLoading && searchTerm && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
          <div className="text-left py-2 px-3">
            <p className="text-sm md:text-md text-gray-500">ไม่พบข้อมูลแคมป์ที่ระบุ</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default SearchBox;
