import { render, screen } from '@testing-library/react';
import Home from '../page';
import { CanvasProvider } from '../CanvasContext';

describe('Home', () => {
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
});
