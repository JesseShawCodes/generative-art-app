import Image from 'next/image';
import Link from 'next/link';

const Navbar = () => {
  return (
    <nav
      className="flex min-h-14 items-center bg-[#212529] text-white"
      role="navigation"
      aria-label="main navigation"
    >
      <Link className="flex items-center gap-2 px-3 py-2 text-white hover:text-bloom-pink" href="/">
        <Image
          src="/bloom_logo.png"
          alt=""
          width={32}
          height={32}
          className="h-8 w-8"
          priority
        />
        <h1>
          PixelBloom
        </h1>
      </Link>
    </nav>
  );
};

export default Navbar;
