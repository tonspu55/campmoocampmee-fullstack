'use client'



type Address = {
  province: string;
  district: string;
  subdistrict: string;
}
interface InfoAddressProps {
  InfoAddress: Address;
}
const InfoAddress = ({ InfoAddress }: InfoAddressProps) => {

  return (
    <>
      {InfoAddress?.province && (
        <>
          <div className="flex flex-row gap-1">
            <p className="text-sm ">{`จ.${InfoAddress.province}`}</p>
            <p className="text-sm line-clamp-1">{`อ.${InfoAddress.district}`}</p>
            <p className="text-sm line-clamp-1">{`ต.${InfoAddress.subdistrict}`}</p>
          </div>
        </>
      )}

    </>
  )
}
export default InfoAddress;

