import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { ProjectCard } from '../src/components/ProjectCard';
import { ThemeToggle } from '../src/components/ThemeToggle';
import { ThemeProvider } from '../src/contexts/ThemeContext';
import type { ProjectSummary } from '../src/types';

const project: ProjectSummary = {
  id: 1,
  title: 'Accessible Portfolio',
  slug: 'accessible-portfolio',
  shortDescription: 'A tested portfolio built with React and TypeScript.',
  category: 'Web Applications',
  projectStatus: 'Completed',
  technologies: ['TypeScript', 'React', 'Express'],
  repositoryUrl: null,
  liveUrl: null,
  startDate: '2026-01-01',
  endDate: '2026-02-01',
  featured: true,
  coverImage: null,
  updatedAt: '2026-02-01T00:00:00.000Z',
};

describe('ProjectCard', () => {
  it('renders project details and links to the case study', () => {
    render(
      <MemoryRouter>
        <ProjectCard project={project} />
      </MemoryRouter>,
    );

    const link = screen.getByRole('link', { name: 'Accessible Portfolio' });
    expect(link).toHaveAttribute('href', '/projects/accessible-portfolio');
    expect(screen.getByText(project.shortDescription)).toBeInTheDocument();
    expect(screen.getByText('Featured')).toBeInTheDocument();
    expect(screen.getByText('TypeScript')).toBeInTheDocument();
  });
});

describe('ThemeToggle', () => {
  it('toggles the document theme and persists the choice', async () => {
    document.documentElement.setAttribute('data-theme', 'dark');
    const user = userEvent.setup();

    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>,
    );

    const button = screen.getByRole('button', { name: /switch to light theme/i });
    await user.click(button);

    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    expect(localStorage.getItem('mq-theme')).toBe('light');
    expect(screen.getByRole('button', { name: /switch to dark theme/i })).toBeInTheDocument();
  });
});
