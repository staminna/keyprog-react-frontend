import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import HashRedirect from '../HashRedirect';

describe('HashRedirect', () => {
  it('should render without crashing', () => {
    // Component requires router context
    const { container } = render(
      <MemoryRouter>
        <HashRedirect />
      </MemoryRouter>
    );

    // Component renders null, so just verify no errors occurred
    expect(container).toBeDefined();
  });

  it('should return null (no visual output)', () => {
    const { container } = render(
      <MemoryRouter>
        <HashRedirect />
      </MemoryRouter>
    );

    // HashRedirect renders nothing to the DOM
    expect(container.querySelector('*')).toBeNull();
  });

  it('should handle different routes without errors', () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/servicos']}>
        <HashRedirect />
      </MemoryRouter>
    );

    // Should handle any route without crashing
    expect(container).toBeDefined();
  });
});
