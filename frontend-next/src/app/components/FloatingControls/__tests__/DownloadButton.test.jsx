
import { render, screen, fireEvent } from '@testing-library/react';
import DownloadButton from '../DownloadButton';
import { useCanvas } from '../../../CanvasContext';

jest.mock('../../../CanvasContext');

describe('DownloadButton', () => {
  it('renders the download button', () => {
    useCanvas.mockReturnValue({ canvasRef: { current: null } });
    render(<DownloadButton />);
    const downloadButton = screen.getByTestId('download-button');
    expect(downloadButton).toBeInTheDocument();
  });

  it('triggers download on click', () => {
    const mockToDataURL = jest.fn().mockReturnValue('fake_data_url');
    const mockCanvasRef = {
      current: {
        toDataURL: mockToDataURL,
      },
    };
    useCanvas.mockReturnValue({ canvasRef: mockCanvasRef });

    Object.defineProperty(window, 'crypto', {
      value: { getRandomValues: () => [12345] },
      writable: true
    });

    const createElementSpy = jest.spyOn(document, 'createElement');
    const clickSpy = jest.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});

    render(<DownloadButton />);

    const downloadButton = screen.getByTestId('download-button');
    fireEvent.click(downloadButton);

    expect(createElementSpy).toHaveBeenCalledWith('a');
    expect(mockToDataURL).toHaveBeenCalledWith('image/png');
    expect(clickSpy).toHaveBeenCalled();

    createElementSpy.mockRestore();
    clickSpy.mockRestore();
  });
});
