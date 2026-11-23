import React from 'react';
import Link from 'next/link';

const Navbar = () => {
  return (
    <nav
      className="flex min-h-13 items-center bg-white dark:bg-night"
      role="navigation"
      aria-label="main navigation"
    >
      <Link className="flex items-center px-3 py-2" href="/">
        <h1>
          PixelBloom
        </h1>
      </Link>
    </nav>
  );
};

export default Navbar;
