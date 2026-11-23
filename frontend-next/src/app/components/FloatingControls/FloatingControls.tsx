import BackToTop from './BackToTop';
import ThemeButton from './ThemeButton';
import DownloadButton from './DownloadButton';

function FloatingControls() {
  return (
    <div className="floating-controls">
      <BackToTop />
      <ThemeButton />
      <DownloadButton />
    </div>
  );
}

export default FloatingControls;
