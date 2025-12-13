export default function Category() {
  return (
    <div className='fixed z-20 bottom-0 right-0'>
      <div className='bg-white'>
        <div className='flex items-center justify-around'>
          <button className='bg-white w-[60px] lg:w-[100px] py-1 text-xl lg:text-2xl font-normal text-gray-400'>정보</button>
          <button className='text-black w-[60px] lg:w-[100px] py-1 text-xl lg:text-2xl font-bold relative'>문서</button>
          <button className='text-gray-400 w-[60px] lg:w-[100px] py-1 text-xl lg:text-2xl font-normal relative'>일상</button>
        </div>
      </div>
    </div>
  )
}
