'use client';

import { useViewMode } from '../context/ViewModeContext';

const ViewModeToggle = () => {
  const { viewMode, setViewMode } = useViewMode();
  const isOsaka = viewMode === 'osaka';

  return (
    <div className="absolute top-1/2 right-4 -translate-y-1/2">
      <div 
        className="relative flex items-center w-16 sm:w-36 h-8 bg-gray-200 rounded-full p-1 cursor-pointer"
        onClick={() => setViewMode(isOsaka ? 'original' : 'osaka')}
      >
        {/* Sliding Knob */}
        <div 
          className="absolute bg-[#E94E77] h-6 w-[calc(50%-4px)] rounded-full shadow-md transform transition-transform"
          style={{ transform: isOsaka ? 'translateX(0)' : 'translateX(100%)' }}
        ></div>

        {/* Text Labels */}
        <div className="relative z-10 w-1/2 text-center text-xs font-bold" onClick={() => setViewMode('osaka')}>
          <span className={isOsaka ? 'text-white' : 'text-gray-600'}>
            <span className="sm:hidden">お</span>
            <span className="hidden sm:inline">おおさか</span>
          </span>
        </div>
        <div className="relative z-10 w-1/2 text-center text-xs font-bold" onClick={() => setViewMode('original')}>
          <span className={!isOsaka ? 'text-white' : 'text-gray-600'}>
            <span className="sm:hidden">原</span>
            <span className="hidden sm:inline">原文</span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default ViewModeToggle;