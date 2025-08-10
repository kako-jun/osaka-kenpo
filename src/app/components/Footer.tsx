
const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#E94E77] text-white p-4 mt-8">
      <div className="container mx-auto text-center">
        <p>
          <a href="#" className="text-blue-400 hover:underline">llll-ll</a>
        </p>
        <p>&copy; {currentYear} kako-jun</p>
      </div>
    </footer>
  );
};

export default Footer;
