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
            <p className="text-sm font-normal">{`${InfoAddress.province}`}</p>
            <p className="text-sm font-normal">{`${InfoAddress.district}`}</p>
            <p className="text-sm font-normal">{`${InfoAddress.subdistrict}`}</p>
          </div>
        </>
      )}

    </>
  )
}
export default InfoAddress;

