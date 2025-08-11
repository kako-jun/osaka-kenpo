'use client';

import { useViewMode } from '../context/ViewModeContext';

const ViewModeToggle = () => {
  const { viewMode, setViewMode } = useViewMode();
  const isOsaka = viewMode === 'osaka';

  return (
    <div className="absolute top-4 right-4">
      <div 
        className="relative flex items-center w-36 h-8 bg-gray-200 rounded-full p-1 cursor-pointer"
        onClick={() => setViewMode(isOsaka ? 'original' : 'osaka')}
      >
        {/* Sliding Knob */}
        <div 
          className="absolute bg-[#E94E77] h-6 w-[calc(50%-4px)] rounded-full shadow-md transform transition-transform"
          style={{ transform: isOsaka ? 'translateX(0)' : 'translateX(calc(100% + 2px))' }}
        ></div>

        {/* Text Labels */}
        <div className="relative z-10 w-1/2 text-center text-xs font-bold" onClick={() => setViewMode('osaka')}>
          <span className={isOsaka ? 'text-white' : 'text-gray-600'}>おおさか</span>
        </div>
        <div className="relative z-10 w-1/2 text-center text-xs font-bold" onClick={() => setViewMode('original')}>
          <span className={!isOsaka ? 'text-white' : 'text-gray-600'}>原文</span>
        </div>
      </div>
    </div>
  );
};

export default ViewModeToggle;