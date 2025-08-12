
import Link from 'next/link';
import Menu from './Menu';
import ViewModeToggle from './ViewModeToggle';

const Header = () => {
  return (
    <header className="bg-[#E94E77] text-white px-4 py-2 text-center relative flex items-center">
      <Menu />
      <div className="container mx-auto">
        <Link href="/" className="inline-block text-white no-underline">
          <div className="py-1">
            <p className="text-lg font-bold">おおさかけんぽう</p>
            <p className="text-xs">法律をおおさか弁で知ろう。知らんけど</p>
          </div>
        </Link>
      </div>
      <ViewModeToggle />
    </header>
  );
};

export default Header;
