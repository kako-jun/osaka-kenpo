
const Footer = () => {
  return (
    <footer className="bg-[#E94E77] text-white p-4 mt-auto">
      <div className="container mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <a href="https://llll-ll.com" className="flex items-center gap-2 text-cream hover:text-white hover:underline" target="_blank" rel="noopener noreferrer">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              llll-ll
            </a>
            <span>&copy; kako-jun</span>
          </div>
          <a href="/about" className="text-cream hover:text-white hover:underline text-sm flex items-center gap-2">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            このサイトのこと
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
