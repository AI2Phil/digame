import React from 'react';
import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';

import RecentActivity from './RecentActivity';

// Mock the fetch function globally
global.fetch = jest.fn();

describe('RecentActivity Component', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  test('renders loading state initially', () => {
    render(<RecentActivity userId={1} />);
    expect(screen.getByText('Recent Activity')).toBeInTheDocument();
    expect(screen.getByText('Loading activities...')).toBeInTheDocument();
  });

  test('renders error state when API fetch fails', async () => {
    fetch.mockRejectedValueOnce(new Error('API Fetch Error'));
    render(<RecentActivity userId={1} />);

    // Wait for error message
    expect(await screen.findByText(/Could not load recent activities/i)).toBeInTheDocument();
    expect(screen.getByText('(API Fetch Error)')).toBeInTheDocument(); // Check for specific error
    expect(screen.queryByText('Loading activities...')).not.toBeInTheDocument();
  });

  test('renders empty state when API returns no activities', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [], // Empty array
    });
    render(<RecentActivity userId={1} />);

    expect(await screen.findByText('No recent activity found.')).toBeInTheDocument();
    expect(screen.queryByText('Loading activities...')).not.toBeInTheDocument();
  });

  test('renders error state when API returns non-array data', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: "Not an array" }), // Invalid data format
    });
    render(<RecentActivity userId={1} />);

    expect(await screen.findByText(/Could not load recent activities/i)).toBeInTheDocument();
    expect(screen.getByText('(Invalid data format from API.)')).toBeInTheDocument();
  });

  describe('Successful data rendering', () => {
    const mockActivities = [
      { activity_id: 1, timestamp: '2023-10-27T10:00:00Z', activity_type: 'Logged In', app_category: 'System' },
      { activity_id: 2, timestamp: '2023-10-27T09:30:00Z', activity_type: 'Viewed Page', app_category: 'Navigation' },
      { activity_id: 3, timestamp: '2023-10-27T11:00:00Z', activity_type: 'Edited Profile', app_category: 'User Actions' },
      { activity_id: 4, timestamp: '2023-10-26T15:00:00Z', activity_type: 'Sent Message', app_category: 'Communication' },
    ];

    test('displays a list of activities sorted by timestamp (most recent first)', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockActivities,
      });
      render(<RecentActivity userId={1} />);

      // Wait for activities to be rendered
      expect(await screen.findByText('Edited Profile')).toBeInTheDocument(); // Most recent
      expect(screen.getByText('Logged In')).toBeInTheDocument();
      expect(screen.getByText('Viewed Page')).toBeInTheDocument();

      // Check order (visual inspection or more complex DOM query)
      const listItems = screen.getAllByRole('listitem');
      expect(listItems[0]).toHaveTextContent('Edited Profile'); // 11:00 AM
      expect(listItems[1]).toHaveTextContent('Logged In');    // 10:00 AM
      expect(listItems[2]).toHaveTextContent('Viewed Page'); // 09:30 AM
      // 'Sent Message' from previous day should be there if maxItems allows
      expect(screen.getByText('Sent Message')).toBeInTheDocument();
    });

    test('respects maxItems prop', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockActivities, // 4 items
      });
      render(<RecentActivity userId={1} maxItems={2} />);

      expect(await screen.findByText('Edited Profile')).toBeInTheDocument();
      expect(screen.getByText('Logged In')).toBeInTheDocument();
      expect(screen.queryByText('Viewed Page')).not.toBeInTheDocument();
      expect(screen.queryByText('Sent Message')).not.toBeInTheDocument();
    });

    test('formats timestamps correctly (e.g., HH:MM AM/PM)', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [{ activity_id: 1, timestamp: '2023-10-27T10:00:00Z', activity_type: 'Test Activity' }],
      });
      render(<RecentActivity userId={1} />);

      // Assuming toLocaleTimeString for 'en-US' with hour: '2-digit', minute: '2-digit'
      // This will be locale-dependent. For consistency, one might mock Date.toLocaleTimeString
      // or use a more specific matcher if the format is strictly defined.
      // For now, let's check for a part of it.
      const expectedTime = new Date('2023-10-27T10:00:00Z').toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      expect(await screen.findByText(expectedTime)).toBeInTheDocument();
    });

    test('displays app_category if available', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [{ activity_id: 1, timestamp: '2023-10-27T10:00:00Z', activity_type: 'Test', app_category: 'TestCategory' }],
      });
      render(<RecentActivity userId={1} />);

      expect(await screen.findByText(/TestCategory/)).toBeInTheDocument();
    });

    test('handles missing activity_id gracefully (uses timestamp as key)', async () => {
        fetch.mockResolvedValueOnce({
          ok: true,
          json: async () => [{ timestamp: '2023-10-27T10:00:00Z', activity_type: 'Activity without ID' }],
        });
        render(<RecentActivity userId={1} />);
        expect(await screen.findByText('Activity without ID')).toBeInTheDocument();
    });

    test('handles missing activity_type gracefully', async () => {
        fetch.mockResolvedValueOnce({
          ok: true,
          json: async () => [{ activity_id: 1, timestamp: '2023-10-27T10:00:00Z' }],
        });
        render(<RecentActivity userId={1} />);
        expect(await screen.findByText('Unknown Activity')).toBeInTheDocument();
    });
  });
});
