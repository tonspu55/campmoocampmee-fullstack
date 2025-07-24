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
            <p className="text-sm ">{`${InfoAddress.province}`}</p>
            <p className="text-sm line-clamp-1">{`${InfoAddress.district}`}</p>
            <p className="text-sm line-clamp-1">{`${InfoAddress.subdistrict}`}</p>
          </div>
        </>
      )}

    </>
  )
}
export default InfoAddress;

