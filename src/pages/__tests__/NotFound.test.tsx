import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import NotFound from '../NotFound';

describe('NotFound Page', () => {
  const renderWithRouter = (component: React.ReactElement) => {
    return render(<BrowserRouter>{component}</BrowserRouter>);
  };

  it('should render without crashing', () => {
    renderWithRouter(<NotFound />);
    // NotFound page contains NotFoundContent component
    expect(screen.getByText(/404/i)).toBeInTheDocument();
  });

  it('should have link back to homepage', () => {
    renderWithRouter(<NotFound />);
    const homeLink = screen.getByRole('link', { name: /voltar.*home/i });
    expect(homeLink).toBeInTheDocument();
    expect(homeLink).toHaveAttribute('href', '/');
  });
});
