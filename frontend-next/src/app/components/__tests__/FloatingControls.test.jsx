
import { render, screen } from '@testing-library/react';
// import FloatingControls from '../components/FloatingControls/FloatingControls';
// import { ThemeProvider } from '../ThemeContext';
import FloatingControls from '../FloatingControls/FloatingControls';
import { ThemeProvider } from '../../ThemeContext';

jest.mock('../FloatingControls/BackToTop', () => {
  const MockBackToTop = () => <div data-testid="back-to-top" />;
  MockBackToTop.displayName = 'MockBackToTop';
  return MockBackToTop;
});
jest.mock('../FloatingControls/ThemeButton', () => {
  const MockThemeButton = () => <div data-testid="theme-button" />;
  MockThemeButton.displayName = 'MockThemeButton';
  return MockThemeButton;
});
jest.mock('../FloatingControls/DownloadButton', () => {
  const MockDownloadButton = () => <div data-testid="download-button" />;
  MockDownloadButton.displayName = 'MockDownloadButton';
  return MockDownloadButton;
});

describe('FloatingControls', () => {
  it('should render the BackToTop and ThemeButton components', () => {
    render(
      <ThemeProvider>
        <FloatingControls />
      </ThemeProvider>
    );

    expect(screen.getByTestId('back-to-top')).toBeInTheDocument();
    expect(screen.getByTestId('theme-button')).toBeInTheDocument();
  });
});
