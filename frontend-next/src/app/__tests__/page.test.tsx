import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import Home from '../page';
import { CanvasProvider } from '../CanvasContext';
import { generateArt } from '../../lib/api';

jest.mock('../../lib/api', () => ({
  generateArt: jest.fn(),
}));

const mockedGenerateArt = jest.mocked(generateArt);

describe('Home', () => {
  beforeEach(() => {
    mockedGenerateArt.mockReset();
    mockedGenerateArt.mockResolvedValue([]);
  });

  it('renders a button', async () => {
    render(
      <CanvasProvider>
        <Home />
      </CanvasProvider>
    );

    const button = await screen.findByRole('button', {
      name: /Generate New Art/i,
    });

    expect(button).toBeInTheDocument();
  });

  it('surfaces API errors to the user', async () => {
    mockedGenerateArt
      .mockResolvedValueOnce([])
      .mockRejectedValueOnce(new Error('NEXT_PUBLIC_API_URL is not set'));

    render(
      <CanvasProvider>
        <Home />
      </CanvasProvider>
    );

    await waitFor(() => expect(mockedGenerateArt).toHaveBeenCalledTimes(1));

    fireEvent.click(screen.getByRole('button', { name: /Generate New Art/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      /NEXT_PUBLIC_API_URL is not set/
    );
  });
});
