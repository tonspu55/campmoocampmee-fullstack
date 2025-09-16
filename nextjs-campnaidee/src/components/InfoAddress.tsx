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

  const isBangkok = InfoAddress?.province === 'กรุงเทพมหานคร';
  const districtPrefix = isBangkok ? 'เขต ' : 'อ.';
  const subdistrictPrefix = isBangkok ? 'แขวง ' : 'ต.';

  return (
    <>
      {InfoAddress?.province && (
        <>
          <div className="flex flex-row gap-1">
            <p className="text-sm ">{`จ.${InfoAddress.province}`}</p>
            <p className="text-sm line-clamp-1">{`${districtPrefix}${InfoAddress.district}`}</p>
            <p className="text-sm line-clamp-1">{`${subdistrictPrefix}${InfoAddress.subdistrict}`}</p>
          </div>
        </>
      )}
    </>
  )
}

export default InfoAddress;

