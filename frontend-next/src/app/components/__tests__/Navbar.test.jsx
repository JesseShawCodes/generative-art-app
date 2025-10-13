import { render, screen } from '@testing-library/react';
import Navbar from '../Navbar';

describe('Navbar', () => {
  it('renders navbar', async () => {
    render(<Navbar />);
 
    const heading = await screen.findByRole('heading', {
      name: /PixelBloom/i,
    });
 
    expect(heading).toBeInTheDocument();
  });
});
