
import Link from 'next/link';
import Menu from './Menu';
import ViewModeToggle from './ViewModeToggle';

const Header = () => {
  return (
    <header className="bg-[#E94E77] text-white p-4 text-center relative">
      <Menu />
      <div className="container mx-auto">
        <Link href="/" className="block text-white no-underline">
        <div className="container mx-auto py-2">
          <p className="text-xl font-bold">おおさかけんぽう</p>
          <p className="text-sm">法律を大阪弁で知ろう。知らんけど</p>
        </div>
      </Link>
      </div>
      <ViewModeToggle />
    </header>
  );
};

export default Header;
