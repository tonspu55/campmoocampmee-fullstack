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
}
interface OtherBenefitsProps {
  otherBenefits: OtherBenefits;
}
const OtherBenefits = ({ otherBenefits }: OtherBenefitsProps) => {
  console.log(otherBenefits);
  return (
    <>
      <h4 className="text-lg font-bold mb-6">รายละเอียดเพิ่มเติม</h4>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 ">
        {otherBenefits.priceOfStay && (
          <div className="flex flex-row  gap-4 items-center">
            <Image
              priority
              src="/assets/images/management.svg"
              alt="Price of Stay"
              width={50}
              height={50}
            />
            <p>{otherBenefits.priceOfStay}</p>
          </div>
        )}
        {otherBenefits.checkIn && (
          <div className="flex flex-row  gap-4 items-center">
            <Image
              priority
              src="/assets/images/camper-van.svg"
              alt="Check In"
              width={50}
              height={50}
            />
            <p>{otherBenefits.checkIn}</p>
          </div>
        )}
        {otherBenefits.checkOut && (
          <div className="flex flex-row  gap-4 items-center">
            <Image
              priority
              src="/assets/images/check-out.svg"
              alt="Check Out"
              width={50}
              height={50}
            />
            <p>{otherBenefits.checkOut}</p>
          </div>
        )}
        {otherBenefits.nature && (
          <div className="flex flex-row  gap-4 items-center">
            <Image
              priority
              src="/assets/images/tent.svg"
              alt="Nature"
              width={50}
              height={50}
            />
            <p>{otherBenefits.nature}</p>
          </div>
        )}
        {otherBenefits.cabin && (
          <div className="flex flex-row  gap-4 items-center">
            <Image
              priority
              src="/assets/images/cabin.svg"
              alt="Cabin"
              width={50}
              height={50}
            />
            <p>{otherBenefits.cabin}</p>
          </div>
        )}
        {otherBenefits.noNoise && (
          <div className="flex flex-row  gap-4 items-center">
            <Image
              priority
              src="/assets/images/tent-to-night.svg"
              alt="No Noise"
              width={50}
              height={50}
            />
            <p>{otherBenefits.noNoise}</p>
          </div>
        )}
        {otherBenefits.petFriendly && (
          <div className="flex flex-row  gap-4 items-center">
            <Image
              priority
              src="/assets/images/dog.svg"
              alt="Pet Friendly"
              width={50}
              height={50}
            />
            <p>{otherBenefits.petFriendly}</p>
          </div>
        )}
        {otherBenefits.wifi && (
          <div className="flex flex-row  gap-4 items-center">
            <Image
              priority
              src="/assets/images/wifi-router.svg"
              alt="WiFi"
              width={50}
              height={50}
            />
            <p>{otherBenefits.wifi}</p>
          </div>
        )}
      </div>
    </>
  )
}
export default OtherBenefits;

