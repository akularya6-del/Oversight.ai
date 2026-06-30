import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { QueueItemCard } from './QueueItemCard';
import { StagedAction } from '@/types/actions';

const mockActionEmail: StagedAction = {
  id: 'action-1',
  type: 'draft_email',
  reasoning: 'Needs follow up',
  payload: {
    to: 'test@example.com',
    subject: 'Test Subject',
    body: 'Test Body',
  },
  status: 'pending_approval',
  priority: 'normal',
};

const mockActionEvent: StagedAction = {
  id: 'action-2',
  type: 'schedule_event',
  reasoning: 'Wants a meeting',
  payload: {
    title: 'Sync',
    startDateTime: '2026-07-01T10:00:00Z',
    endDateTime: '2026-07-01T11:00:00Z',
    attendees: ['client@example.com'],
  },
  status: 'pending_approval',
  priority: 'high',
};

describe('QueueItemCard Component', () => {
  it('renders email draft action correctly', () => {
    const onApprove = vi.fn();
    const onDismiss = vi.fn();

    render(
      <QueueItemCard
        action={mockActionEmail}
        onApprove={onApprove}
        onDismiss={onDismiss}
      />
    );

    expect(screen.getByText('Draft email to test@example.com')).toBeInTheDocument();
    expect(screen.getByText('Test Body')).toBeInTheDocument();
    expect(screen.getByText(/"Needs follow up"/)).toBeInTheDocument();
  });

  it('renders schedule event action correctly', () => {
    const onApprove = vi.fn();
    const onDismiss = vi.fn();

    render(
      <QueueItemCard
        action={mockActionEvent}
        onApprove={onApprove}
        onDismiss={onDismiss}
      />
    );

    expect(screen.getByText(/Schedule "Sync" for/)).toBeInTheDocument();
    expect(screen.getByText('Guests: client@example.com')).toBeInTheDocument();
  });

  it('calls onApprove when approve button is clicked', () => {
    const onApprove = vi.fn();
    const onDismiss = vi.fn();

    render(
      <QueueItemCard
        action={mockActionEmail}
        onApprove={onApprove}
        onDismiss={onDismiss}
      />
    );

    const approveButton = screen.getByRole('button', { name: /Approve/i });
    fireEvent.click(approveButton);
    expect(onApprove).toHaveBeenCalledWith(mockActionEmail);
  });

  it('calls onDismiss when reject button is clicked', () => {
    const onApprove = vi.fn();
    const onDismiss = vi.fn();

    render(
      <QueueItemCard
        action={mockActionEmail}
        onApprove={onApprove}
        onDismiss={onDismiss}
      />
    );

    const rejectButton = screen.getByRole('button', { name: /Reject/i });
    fireEvent.click(rejectButton);
    expect(onDismiss).toHaveBeenCalledWith(mockActionEmail.id);
  });
});
