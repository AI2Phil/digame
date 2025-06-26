import React from 'react';
import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';

import ActivityBreakdown from './ActivityBreakdown';

// Mock the fetch function globally
global.fetch = jest.fn();

describe('ActivityBreakdown Component', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  test('renders loading state initially', () => {
    render(<ActivityBreakdown userId={1} />);
    expect(screen.getByText('Activity Breakdown')).toBeInTheDocument();
    expect(screen.getByText('Loading breakdown...')).toBeInTheDocument();
  });

  test('renders error state when API fetch fails', async () => {
    fetch.mockRejectedValueOnce(new Error('API Breakdown Fetch Error'));
    render(<ActivityBreakdown userId={1} />);

    expect(await screen.findByText(/Could not load activity breakdown/i)).toBeInTheDocument();
    expect(screen.getByText('(API Breakdown Fetch Error)')).toBeInTheDocument();
    expect(screen.queryByText('Loading breakdown...')).not.toBeInTheDocument();
  });

  test('renders empty state when API returns no activities', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [], // Empty array
    });
    render(<ActivityBreakdown userId={1} />);

    expect(await screen.findByText('No activity data to display breakdown.')).toBeInTheDocument();
    expect(screen.queryByText('Loading breakdown...')).not.toBeInTheDocument();
  });

  test('renders error state when API returns non-array data', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: "Not an array for breakdown" }),
    });
    render(<ActivityBreakdown userId={1} />);

    expect(await screen.findByText(/Could not load activity breakdown/i)).toBeInTheDocument();
    expect(screen.getByText('(Invalid data format from API.)')).toBeInTheDocument();
  });

  describe('Successful data rendering and aggregation', () => {
    const mockApiData = [
      { activity_id: 1, timestamp: '2023-10-27T10:00:00Z', activity_type: 'Work' },
      { activity_id: 2, timestamp: '2023-10-27T11:00:00Z', activity_type: 'Work' },
      { activity_id: 3, timestamp: '2023-10-27T12:00:00Z', activity_type: 'Meeting' },
      { activity_id: 4, timestamp: '2023-10-27T13:00:00Z', activity_type: 'Work' },
      { activity_id: 5, timestamp: '2023-10-27T14:00:00Z', activity_type: 'Break' },
      { activity_id: 6, timestamp: '2023-10-27T15:00:00Z', activity_type: 'Meeting' },
      { activity_id: 7, timestamp: '2023-10-27T16:00:00Z', activity_type: 'Work' }, // Total 4 Work
      { activity_id: 8, timestamp: '2023-10-27T17:00:00Z', activity_type: null },   // 1 Unknown
    ]; // Total 8 activities

    beforeEach(() => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockApiData,
      });
    });

    test('correctly aggregates activity types and counts, sorted by count', async () => {
      render(<ActivityBreakdown userId={1} />);

      // Wait for elements to appear
      expect(await screen.findByText('Work')).toBeInTheDocument();
      expect(screen.getByText('Meeting')).toBeInTheDocument();
      expect(screen.getByText('Break')).toBeInTheDocument();
      expect(screen.getByText('Unknown')).toBeInTheDocument();

      // Verify counts (Work: 4, Meeting: 2, Break: 1, Unknown: 1)
      // Percentages: Work 50%, Meeting 25%, Break 12.5%, Unknown 12.5%
      const workItem = screen.getByText('Work').closest('div');
      expect(workItem).toHaveTextContent('4 activities (50.0%)');

      const meetingItem = screen.getByText('Meeting').closest('div');
      expect(meetingItem).toHaveTextContent('2 activities (25.0%)');

      const breakItem = screen.getByText('Break').closest('div');
      expect(breakItem).toHaveTextContent('1 activities (12.5%)');

      const unknownItem = screen.getByText('Unknown').closest('div');
      expect(unknownItem).toHaveTextContent('1 activities (12.5%)');

      // Check order (Work should be first due to highest count)
      const breakdownItems = screen.getAllByText(/activities \(\d+\.\d+%\)/).map(el => el.closest('div'));
      expect(breakdownItems[0]).toContainElement(screen.getByText('Work'));
      expect(breakdownItems[1]).toContainElement(screen.getByText('Meeting'));
      // Break and Unknown have same count, order between them might vary based on string sort of type
      // This test assumes 'Break' comes before 'Unknown' if counts are equal, which might not be guaranteed
      // by the sort if types are used as secondary sort key. The current sort is just by count.
    });

    test('renders activity type, count, percentage, and a styled bar element for each type', async () => {
      render(<ActivityBreakdown userId={1} />);

      // For "Work"
      expect(await screen.findByText('Work')).toBeInTheDocument();
      const workTextElement = screen.getByText('4 activities (50.0%)');
      expect(workTextElement).toBeInTheDocument();
      // Find the progress bar div associated with "Work"
      // The structure is: <div> <div>(text)</div> <div>(bar container) <div (actual bar)></div> </div> </div>
      const workBar = workTextElement.parentElement.nextElementSibling.firstChild;
      expect(workBar).toHaveStyle('width: 50.0%');
      expect(workBar).toHaveClass('bg-blue-500'); // Color for 'Work'

      // For "Meeting"
      expect(screen.getByText('Meeting')).toBeInTheDocument();
      const meetingTextElement = screen.getByText('2 activities (25.0%)');
      const meetingBar = meetingTextElement.parentElement.nextElementSibling.firstChild;
      expect(meetingBar).toHaveStyle('width: 25.0%');
      expect(meetingBar).toHaveClass('bg-green-500'); // Color for 'Meeting'

      // For "Unknown"
      expect(screen.getByText('Unknown')).toBeInTheDocument();
      const unknownTextElement = screen.getByText('1 activities (12.5%)');
      const unknownBar = unknownTextElement.parentElement.nextElementSibling.firstChild;
      expect(unknownBar).toHaveStyle('width: 12.5%');
      expect(unknownBar).toHaveClass('bg-gray-400'); // Default color
    });
  });
});
