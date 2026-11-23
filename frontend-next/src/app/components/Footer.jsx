import { React } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faInstagram, faLinkedin, faXTwitter,
} from '@fortawesome/free-brands-svg-icons';

const socialLinks = [
  { title: 'Instagram', icon: faInstagram },
  { title: 'LinkedIn', icon: faLinkedin },
  { title: 'Twitter', icon: faXTwitter },
];

function Footer() {
  return (
    <footer className="bg-neutral-50 px-6 py-6 text-bloom dark:bg-night-raised dark:text-night-text">
      <div className="mx-auto w-full max-w-6xl">
        <div className="flex items-center justify-between">
          <p>© 2025 {process.env.NEXT_PUBLIC_NAME}</p>
          <div className="flex items-center gap-3">
            {socialLinks.map(({ title, icon }) => (
              <a
                key={title}
                className="flex items-center justify-center"
                href="#"
                title={title}
              >
                <span className="inline-flex size-6 items-center justify-center">
                  <FontAwesomeIcon icon={icon} />
                </span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
