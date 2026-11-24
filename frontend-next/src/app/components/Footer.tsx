import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faInstagram, faLinkedin, faXTwitter,
} from '@fortawesome/free-brands-svg-icons';
import FooterGrid from './FooterGrid';

function Footer() {
  return (
    <footer className="relative overflow-hidden bg-neutral-50 px-6 py-6 text-bloom dark:bg-night-raised dark:text-night-text">
      <div className="footer-grid-wrap" aria-hidden="true">
        <FooterGrid />
      </div>
      <div className="relative z-10 mx-auto w-full max-w-6xl">
        <div className="flex items-center justify-between">
          <p>© {new Date().getFullYear()} {process.env.NEXT_PUBLIC_NAME ?? "PixelBloom"}</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
