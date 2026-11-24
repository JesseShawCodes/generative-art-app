import Link from 'next/link';

const Navbar = () => {
  return (
    <nav
      className="flex min-h-13 items-center bg-[#212529] text-white"
      role="navigation"
      aria-label="main navigation"
    >
      <Link className="flex items-center px-3 py-2 text-white hover:text-bloom-pink" href="/">
        <h1>
          PixelBloom
        </h1>
      </Link>
    </nav>
  );
};

export default Navbar;
