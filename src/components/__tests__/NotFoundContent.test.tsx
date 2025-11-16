import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import NotFoundContent from '../NotFoundContent';

describe('NotFoundContent', () => {
  const renderWithRouter = (component: React.ReactElement) => {
    return render(<BrowserRouter>{component}</BrowserRouter>);
  };

  it('should render default title', () => {
    renderWithRouter(<NotFoundContent />);
    expect(screen.getByRole('heading', { name: /conteúdo não encontrado/i })).toBeInTheDocument();
  });

  it('should render custom title when provided', () => {
    renderWithRouter(<NotFoundContent title="404" />);
    expect(screen.getByText('404')).toBeInTheDocument();
  });

  it('should have link to homepage', () => {
    renderWithRouter(<NotFoundContent />);
    const homeLink = screen.getByRole('link', { name: /voltar à página inicial/i });
    expect(homeLink).toBeInTheDocument();
    expect(homeLink).toHaveAttribute('href', '/');
  });

  it('should accept custom props', () => {
    renderWithRouter(
      <NotFoundContent
        title="Custom Title"
        message="Custom message"
        backLink="/custom"
        backText="Go Back"
      />
    );
    expect(screen.getByText('Custom Title')).toBeInTheDocument();
    expect(screen.getByText('Custom message')).toBeInTheDocument();
    const link = screen.getByRole('link', { name: 'Go Back' });
    expect(link).toHaveAttribute('href', '/custom');
  });
});
