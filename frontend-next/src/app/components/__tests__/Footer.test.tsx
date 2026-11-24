import { render, screen } from '@testing-library/react';
import Footer from '../Footer';

describe('Footer', () => {
  it('renders the footer component', () => {
    render(<Footer />);
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });

  it('displays the copyright text', () => {
    render(<Footer />);
    expect(screen.getByText(new RegExp(`© ${new Date().getFullYear()}`))).toBeInTheDocument();
  });

  it('renders the decorative grid background', () => {
    const { container } = render(<Footer />);
    expect(container.querySelector('.footer-grid')).toBeInTheDocument();
    expect(container.querySelector('rect[fill^="url(#footer-grid-pattern"]')).toBeInTheDocument();
  });
});
