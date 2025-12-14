interface ToggleProps {
  viewMode: 'garden' | 'list'
  onToggle: (mode: 'garden' | 'list') => void
}

export default function Toggle({ viewMode, onToggle }: ToggleProps) {
  return (
    <div className='fixed z-20 bottom-0 left-0'>
      <div className='bg-white'>
        <div className='flex items-center justify-around'>
          <button
            onClick={() => onToggle('garden')}
            className={`w-[72px] lg:w-[100px] py-1 text-xl lg:text-2xl font-${
              viewMode === 'garden' ? 'bold' : 'normal'
            } ${viewMode === 'garden' ? 'bg-black text-white' : 'text-gray-400'}`}
          >
            잔디밭
          </button>
          <button
            onClick={() => onToggle('list')}
            className={`w-[72px] lg:w-[100px] py-1 text-xl lg:text-2xl font-${
              viewMode === 'list' ? 'bold' : 'normal'
            } ${viewMode === 'list' ? 'bg-black text-white' : 'text-gray-400'} relative`}
          >
            리스트
          </button>
        </div>
      </div>
    </div>
  )
}