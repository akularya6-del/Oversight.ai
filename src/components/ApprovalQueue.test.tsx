import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { ApprovalQueue } from './ApprovalQueue';
import { LiveIntelligenceProvider } from '@/lib/contexts/LiveIntelligenceContext';
// Mock the child components to simplify testing
vi.mock('./QueueItemCard', () => ({
  QueueItemCard: ({ action }: any) => <div data-testid="queue-item">{action.id}</div>
}));

describe('ApprovalQueue Component', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('renders loading state initially', () => {
    // Prevent the fetch from resolving immediately
    global.fetch = vi.fn(() => new Promise(() => {})) as any;

    render(
      <LiveIntelligenceProvider>
        <ApprovalQueue />
      </LiveIntelligenceProvider>
    );
    expect(screen.getByText('Syncing inbox...')).toBeInTheDocument();
  });

  it('renders empty state when no actions or insights exist', async () => {
    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url === '/api/agent') {
        // Return an empty SSE stream for agent
        const encoder = new TextEncoder();
        const stream = new ReadableStream({
          start(controller) {
            controller.enqueue(encoder.encode('data: {"type":"result","actions":[]}\n\n'));
            controller.close();
          }
        });
        return Promise.resolve({
          ok: true,
          body: stream,
        });
      }
      if (url === '/api/followup/check') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ insights: [] })
        });
      }
      return Promise.reject(new Error('Unknown endpoint'));
    }) as any;

    render(
      <LiveIntelligenceProvider>
        <ApprovalQueue />
      </LiveIntelligenceProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Inbox Zero')).toBeInTheDocument();
    });
  });

  it('renders actions and insights as a unified queue', async () => {
    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url === '/api/agent') {
        const encoder = new TextEncoder();
        const stream = new ReadableStream({
          start(controller) {
            controller.enqueue(encoder.encode(
              `data: {"type":"result","actions":[{"id":"action-1","type":"draft_email"}]}\n\n`
            ));
            controller.close();
          }
        });
        return Promise.resolve({
          ok: true,
          body: stream,
        });
      }
      if (url === '/api/followup/check') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            insights: [
              {
                id: 'insight-1',
                proposedAction: { id: 'insight-action-1', type: 'schedule_event' },
                replyFrom: 'test',
                replySnippet: 'test'
              }
            ]
          })
        });
      }
      return Promise.reject(new Error('Unknown endpoint'));
    }) as any;

    render(
      <LiveIntelligenceProvider>
        <ApprovalQueue />
      </LiveIntelligenceProvider>
    );

    await waitFor(() => {
      const items = screen.getAllByTestId('queue-item');
      expect(items).toHaveLength(2);
      expect(items[0]).toHaveTextContent('action-1');
      expect(items[1]).toHaveTextContent('insight-action-1');
      expect(screen.getByText('2 items need attention')).toBeInTheDocument();
    });
  });
});
