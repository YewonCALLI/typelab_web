interface ToggleProps {
  showList: boolean
  onToggle: (show: boolean) => void
}

export default function Toggle({ showList, onToggle }: ToggleProps) {
  return (
    <div className='fixed z-20 bottom-0 left-0'>
      <div className='bg-white'>
        <div className='flex items-center justify-around'>
          <button 
            onClick={() => onToggle(false)}
            className={`${
              !showList 
                ? 'bg-black text-white font-bold' 
                : 'text-gray-400 font-normal'
            } w-[72px] lg:w-[100px] py-1 text-xl lg:text-2xl transition-all`}
          >
            잔디밭
          </button>
          <button 
            onClick={() => onToggle(true)}
            className={`${
              showList 
                ? 'bg-black text-white font-bold' 
                : 'text-gray-400 font-normal'
            } w-[72px] lg:w-[100px] py-1 text-xl lg:text-2xl transition-all`}
          >
            리스트
          </button>
        </div>
      </div>
    </div>
  )
}