export default function Toggle() {
  return (
    <div className='fixed z-20 bottom-0 left-0'>
      <div className='bg-white'>
        <div className='flex items-center justify-around'>
          <button className='bg-black w-[72px] lg:w-[100px] py-1 font-normal text-xl lg:text-2xl font-bold text-white'>잔디밭</button>
          <button className='text-gray-400 w-[72px] lg:w-[100px] py-1 text-xl lg:text-2xl font-normal relative'>리스트</button>
        </div>
      </div>
    </div>
  )
}
