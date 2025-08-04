'use client'

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"

const THAILAND_PROVINCES = [
  "กรุงเทพมหานคร", "สมุทรปราการ", "นนทบุรี", "ปทุมธานี", "พระนครศรีอยุธยา", "อ่างทอง", "ลพบุรี", "สิงห์บุรี", "ชัยนาท", "สระบุรี",
  "ชลบุรี", "ระยอง", "จันทบุรี", "ตราด", "ฉะเชิงเทรา", "ปราจีนบุรี", "นครนายก", "สระแก้ว",
  "นครราชสีมา", "บุรีรัมย์", "สุรินทร์", "ศรีสะเกษ", "อุบลราชธานี", "ยโสธร", "ชัยภูมิ", "อำนาจเจริญ", "หนองบัวลำภู", "ขอนแก่น", "อุดรธานี", "เลย", "หนองคาย", "มหาสารคาม", "ร้อยเอ็ด", "กาฬสินธุ์", "สกลนคร", "นครพนม", "มุกดาหาร", "บึงกาฬ",
  "เชียงใหม่", "ลำพูน", "ลำปาง", "อุตรดิตถ์", "แพร่", "น่าน", "พะเยา", "เชียงราย", "แม่ฮ่องสอน",
  "นครสวรรค์", "อุทัยธานี", "กำแพงเพชร", "ตาก", "สุโขทัย", "พิษณุโลก", "พิจิตร", "เพชรบูรณ์",
  "ราชบุรี", "กาญจนบุรี", "สุพรรณบุรี", "นครปฐม", "สมุทรสาคร", "สมุทรสงคราม", "เพชรบุรี", "ประจวบคีรีขันธ์",
  "นครศรีธรรมราช", "กระบี่", "พังงา", "ภูเก็ต", "สุราษฎร์ธานี", "ระนอง", "ชุมพร", "สงขลา", "สตูล", "ตรัง", "พัทลุง", "ปัตตานี", "ยะลา", "นราธิวาส"
];

export default function SearchBox() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredProvinces, setFilteredProvinces] = useState<string[]>([]);
  const [selectedProvince, setSelectedProvince] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const router = useRouter();

  const handleInputChange = (value: string) => {
    setSearchTerm(value);
    setSelectedProvince(value);

    if (value.length > 0) {
      const filtered = THAILAND_PROVINCES.filter(province =>
        province.includes(value)
      );
      setFilteredProvinces(filtered);
    } else {
      setFilteredProvinces(THAILAND_PROVINCES);
    }
    setShowDropdown(true);
  };

  const handleProvinceSelect = (province: string) => {
    setSelectedProvince(province);
    setSearchTerm(province);
    setShowDropdown(false);
  };

  const handleSearch = () => {
    if (selectedProvince.trim()) {
      router.push(`/search?province=${encodeURIComponent(selectedProvince)}`);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleInputFocus = () => {
    if (searchTerm.length > 0) {
      const filtered = THAILAND_PROVINCES.filter(province =>
        province.includes(searchTerm)
      );
      setFilteredProvinces(filtered);
    } else {
      setFilteredProvinces(THAILAND_PROVINCES);
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
          placeholder="ระบุชื่อจังหวัด"
          className="border-0 bg-white dark:text-[#000000] dark:bg-white focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 rounded-r-none"
        />
        <Button
          onClick={handleSearch}
          className="rounded-l-none cursor-pointer"
          disabled={!selectedProvince.trim()}
        >
          ค้นหา
        </Button>
      </div>

      {showDropdown && filteredProvinces.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-50 overflow-y-auto">
          {filteredProvinces.map((province, index) => (
            <div
              key={index}
              onClick={() => handleProvinceSelect(province)}
              className="text-left px-4 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
            >
              <p className="text-sm md:text-md dark:text-black">{province}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
