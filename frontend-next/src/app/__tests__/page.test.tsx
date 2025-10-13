import { render, screen } from '@testing-library/react';
import Home from '../page';

describe('Home', () => {
  it('renders a button', async () => {
    render(<Home />);
 
    const button = await screen.findByRole('button', {
      name: /Generate New Art/i,
    });
 
    expect(button).toBeInTheDocument();
  });
});
