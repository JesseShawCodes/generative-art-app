import { render, screen } from '@testing-library/react';
import FloatingControls from '../FloatingControls';
import { ThemeProvider } from '../../../ThemeContext';

jest.mock('../BackToTop', () => {
  const MockBackToTop = () => <div data-testid="back-to-top" />;
  MockBackToTop.displayName = 'MockBackToTop';
  return MockBackToTop;
});
jest.mock('../ThemeButton', () => {
  const MockThemeButton = () => <div data-testid="theme-button" />;
  MockThemeButton.displayName = 'MockThemeButton';
  return MockThemeButton;
});
jest.mock('../DownloadButton', () => {
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
    expect(screen.getByTestId('download-button')).toBeInTheDocument();
  });
});
