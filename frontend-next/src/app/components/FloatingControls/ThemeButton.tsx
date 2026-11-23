"use client"
import { useSyncExternalStore } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMoon, faSun } from '@fortawesome/free-solid-svg-icons';
import { useTheme } from '../../ThemeContext';

const subscribeNoop = () => () => {};

function ThemeButton() {
  // false during SSR/hydration, true once mounted on the client
  const isMounted = useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false
  );
  const { theme, toggleTheme } = useTheme();

  return (
    isMounted && (
      <div id="theme-container">
        <button
          aria-label="Change Theme"
          id="change-theme"
          data-testid="theme-button"
          className="btn-secondary"
          onClick={toggleTheme}
          type="button"
        >
          {/* Sun Icon for Light Theme */}
          <FontAwesomeIcon 
            icon={faSun} 
            className={`theme-icon sun-icon ${theme === 'light' ? 'active' : ''}`} 
          />
          {/* Moon Icon for Dark Theme */}
          <FontAwesomeIcon 
            icon={faMoon} 
            className={`theme-icon moon-icon ${theme === 'dark' ? 'active' : ''}`} 
          />
        </button>
      </div>
    )
  );
}

export default ThemeButton;
