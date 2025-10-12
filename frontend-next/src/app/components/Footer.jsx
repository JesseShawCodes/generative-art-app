import { React } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faInstagram, faLinkedin, faXTwitter,
} from '@fortawesome/free-brands-svg-icons';

function Footer() {
  return (
    <footer className="footer py-4">
      <div className="container">
        <div className="level">
          <div className="level-left">
            <div className="level-item">
              <p>© 2025 {process.env.NEXT_PUBLIC_NAME}</p>
            </div>
          </div>
          <div className="level-right">
            <a className="level-item" href="#" title="Instagram">
              <span className="icon">
                <FontAwesomeIcon icon={faInstagram} />
              </span>
            </a>
            <a className="level-item" href="#" title="LinkedIn">
              <span className="icon">
                <FontAwesomeIcon icon={faLinkedin} />
              </span>
            </a>
            <a className="level-item" href="#" title="Twitter">
              <span className="icon">
                <FontAwesomeIcon icon={faXTwitter} />
              </span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;