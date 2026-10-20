import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ContactForm } from '../src/components/ContactForm';
import { ToastProvider } from '../src/contexts/ToastContext';

const renderForm = () =>
  render(
    <ToastProvider>
      <ContactForm />
    </ToastProvider>,
  );

describe('ContactForm', () => {
  it('shows client-side validation errors for an empty submission', async () => {
    const user = userEvent.setup();
    renderForm();

    await user.click(screen.getByRole('button', { name: /send message/i }));

    expect(await screen.findByText('Enter your name')).toBeInTheDocument();
    expect(screen.getByText('Enter a valid email address')).toBeInTheDocument();
    expect(screen.getByText('Enter a subject')).toBeInTheDocument();
    expect(screen.getByText('Your message should be at least 10 characters')).toBeInTheDocument();
  });

  it('submits a valid message and shows confirmation', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          success: true,
          data: {
            received: true,
            message: 'Thank you for your message.',
            emailNotified: false,
          },
        }),
        { status: 201, headers: { 'Content-Type': 'application/json' } },
      ),
    );
    vi.stubGlobal('fetch', fetchMock);

    const user = userEvent.setup();
    renderForm();

    await user.type(screen.getByLabelText(/your name/i), 'Test Visitor');
    await user.type(screen.getByLabelText(/email address/i), 'visitor@example.com');
    await user.type(screen.getByLabelText(/subject/i), 'A genuine enquiry');
    await user.type(
      screen.getByLabelText(/^message/i),
      'Hello, I would like to discuss a software development opportunity with you.',
    );
    await user.click(screen.getByRole('button', { name: /send message/i }));

    expect(await screen.findByText('Message received')).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, options] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('/api/contact');
    expect(options.method).toBe('POST');
    expect(JSON.parse(options.body as string)).toMatchObject({
      name: 'Test Visitor',
      email: 'visitor@example.com',
    });

    vi.unstubAllGlobals();
  });

  it('maps server-side field errors onto the form', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Please check the highlighted fields',
            details: { email: ['This email address is not accepted'] },
          },
        }),
        { status: 422, headers: { 'Content-Type': 'application/json' } },
      ),
    );
    vi.stubGlobal('fetch', fetchMock);

    const user = userEvent.setup();
    renderForm();

    await user.type(screen.getByLabelText(/your name/i), 'Test Visitor');
    await user.type(screen.getByLabelText(/email address/i), 'visitor@example.com');
    await user.type(screen.getByLabelText(/subject/i), 'A genuine enquiry');
    await user.type(
      screen.getByLabelText(/^message/i),
      'Hello, I would like to discuss a software development opportunity with you.',
    );
    await user.click(screen.getByRole('button', { name: /send message/i }));

    expect(await screen.findByText('This email address is not accepted')).toBeInTheDocument();
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('highlighted fields'));

    vi.unstubAllGlobals();
  });
});
