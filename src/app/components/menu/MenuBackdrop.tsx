import { memo } from 'react';

interface MenuBackdropProps {
  onClick: () => void;
}

export const MenuBackdrop = memo(function MenuBackdrop({ onClick }: MenuBackdropProps) {
  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-20 transition-opacity"
      onClick={onClick}
    ></div>
  );
});
