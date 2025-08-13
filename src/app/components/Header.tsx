
import Link from 'next/link';
import Image from 'next/image';
import Menu from './Menu';
import ViewModeToggle from './ViewModeToggle';

const Header = () => {
  return (
    <header className="bg-[#E94E77] text-white px-4 py-2 text-center relative flex items-center">
      <Menu />
      <div className="container mx-auto">
        <Link href="/" className="inline-block text-white no-underline">
          <div className="py-1">
            <Image 
              src="/osaka-kenpo-title.webp" 
              alt="おおさかけんぽう" 
              width={240} 
              height={48}
              className="mx-auto"
            />
            <p className="text-xs mt-1">法律をおおさか弁で知ろう。知らんけど</p>
          </div>
        </Link>
      </div>
      <ViewModeToggle />
    </header>
  );
};

export default Header;
