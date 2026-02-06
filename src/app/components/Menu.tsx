'use client';

import { useState } from 'react';
import { lawsMetadata } from '@/data/lawsMetadata';
import { useScrollLock } from '@/hooks/useScrollLock';
import { HamburgerButton } from './menu/HamburgerButton';
import { MenuBackdrop } from './menu/MenuBackdrop';
import { CloseButton } from './menu/CloseButton';
import { MenuItem, HomeIcon, InfoIcon } from './menu/MenuItem';
import { MenuCategory } from './menu/MenuCategory';

const Menu = () => {
  const [isOpen, setIsOpen] = useState(false);
  useScrollLock(isOpen);

  return (
    <div>
      <HamburgerButton onClick={() => setIsOpen(!isOpen)} />

      {isOpen && <MenuBackdrop onClick={() => setIsOpen(false)} />}

      {/* Menu Panel */}
      <div
        className={`fixed top-0 left-0 w-72 h-full bg-gradient-to-b from-[#E94E77] to-[#d63d66] text-white z-30 transform transition-transform overflow-hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <CloseButton onClick={() => setIsOpen(false)} />

        <nav className="mt-16 text-lg space-y-4 px-4 pt-0 text-left h-full overflow-y-auto pb-32">
          <div className="space-y-1 mb-4">
            <MenuItem
              href="/"
              onClick={() => setIsOpen(false)}
              icon={<HomeIcon />}
              label="ホーム"
            />
            <MenuItem
              href="/about"
              onClick={() => setIsOpen(false)}
              icon={<InfoIcon />}
              label="このサイトのこと"
            />
          </div>

          {lawsMetadata.categories.map((category) => (
            <MenuCategory
              key={category.id}
              category={category}
              onLinkClick={() => setIsOpen(false)}
            />
          ))}
        </nav>
      </div>
    </div>
  );
};

export default Menu;
