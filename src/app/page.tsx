import Link from 'next/link';

export default function Home() {
  const laws = [
    { name: '日本国憲法', path: '/law/constitution', status: 'available' },
    { name: '民法', path: '/law/minpou', status: 'available' },
    { name: '商法', path: '/law/shouhou', status: 'available' },
    { name: '刑法', path: '/law/keihou', status: 'available' },
    { name: '民事訴訟法', path: '#', status: 'preparing' },
    { name: '刑事訴訟法', path: '#', status: 'preparing' },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-center">知りたい法律を選んでや</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {laws.map((law) => (
          <Link key={law.name} href={law.path} passHref className="block">
            <div
              className={`h-full flex flex-col justify-center p-6 rounded-lg shadow-md text-center text-white font-bold text-xl ${
                law.status === 'available'
                  ? 'bg-[#E94E77] hover:bg-opacity-80 cursor-pointer'
                  : 'bg-gray-400 cursor-not-allowed'
              }`}
            >
              <p>{law.name}</p>
              {law.status === 'preparing' && <span className="text-sm block mt-1 font-normal">（準備中）</span>}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
