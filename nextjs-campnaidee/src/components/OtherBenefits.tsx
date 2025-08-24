'use client'

import Image from "next/image";

type OtherBenefits = {
  priceOfStay: string;
  checkIn: string;
  checkOut: string;
  nature: string;
  cabin: string;
  noNoise: string;
  petFriendly: string;
  wifi: string;
  food: string
}
interface OtherBenefitsProps {
  otherBenefits: OtherBenefits;
}
const OtherBenefits = ({ otherBenefits }: OtherBenefitsProps) => {

  return (
    <>
      <h4 className="text-lg font-bold mb-4">รายละเอียดเพิ่มเติม</h4>
      <div className="grid grid-cols-2 gap-2 md:grid-cols-3 md:gap-4 ">
        {otherBenefits.priceOfStay && (
          <div className="flex flex-row  gap-4 items-center">
            <Image
              priority
              src="/assets/images/plains.svg"
              alt="Price of Stay"
              width={35}
              height={35}
            />
            <p className="max-md:text-sm">ค่าเข้า {otherBenefits.priceOfStay} / คน</p>
          </div>
        )}
        {otherBenefits.checkIn && (
          <div className="flex flex-row  gap-4 items-center">
            <Image
              priority
              src="/assets/images/camper-van.svg"
              alt="Check In"
              width={35}
              height={35}
            />
            <p className="max-md:text-sm">เช็คอิน {otherBenefits.checkIn} น.</p>
          </div>
        )}
        {otherBenefits.checkOut && (
          <div className="flex flex-row  gap-4 items-center">
            <Image
              priority
              src="/assets/images/check-out.svg"
              alt="Check Out"
              width={35}
              height={35}
            />
            <p className="max-md:text-sm">เช็คเอาท์ {otherBenefits.checkOut} น.</p>
          </div>
        )}
        {otherBenefits.nature && (
          <div className="flex flex-row  gap-4 items-center">
            <Image
              priority
              src="/assets/images/tent.svg"
              alt="Nature"
              width={35}
              height={35}
            />
            <p className="max-md:text-sm">{otherBenefits.nature}</p>
          </div>
        )}
        {otherBenefits.cabin && (
          <div className="flex flex-row  gap-4 items-center">
            <Image
              priority
              src="/assets/images/cabin.svg"
              alt="Cabin"
              width={35}
              height={35}
            />
            <p className="max-md:text-sm">{otherBenefits.cabin}</p>
          </div>
        )}
        {otherBenefits.noNoise && (
          <div className="flex flex-row  gap-4 items-center">
            <Image
              priority
              src="/assets/images/tent-to-night.svg"
              alt="No Noise"
              width={35}
              height={35}
            />
            <p className="max-md:text-sm">งดส่งเสียง {otherBenefits.noNoise} น.</p>
          </div>
        )}
        {otherBenefits.petFriendly && (
          <div className="flex flex-row  gap-4 items-center">
            <Image
              priority
              src="/assets/images/dog.svg"
              alt="Pet Friendly"
              width={35}
              height={35}
            />
            <p className="max-md:text-sm">{otherBenefits.petFriendly}</p>
          </div>
        )}
        {otherBenefits.wifi && (
          <div className="flex flex-row  gap-4 items-center">
            <Image
              priority
              src="/assets/images/wifi-router.svg"
              alt="WiFi"
              width={35}
              height={35}
            />
            <p className="max-md:text-sm">{otherBenefits.wifi}</p>
          </div>
        )}
        {otherBenefits.food && (
          <div className="flex flex-row  gap-4 items-center">
            <Image
              priority
              src="/assets/images/roast.svg"
              alt="Food"
              width={35}
              height={35}
            />
            <p className="max-md:text-sm">{otherBenefits.food}</p>
          </div>
        )}
      </div>
    </>
  )
}
export default OtherBenefits;

