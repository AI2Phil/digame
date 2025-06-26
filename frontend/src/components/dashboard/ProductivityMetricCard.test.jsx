import React from 'react';
import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom'; // For extended matchers like .toBeInTheDocument()

import ProductivityMetricCard from './ProductivityMetricCard';

// Mock the fetch function globally for tests that might trigger useEffect
global.fetch = jest.fn();

describe('ProductivityMetricCard', () => {
  beforeEach(() => {
    // Reset fetch mock before each test
    fetch.mockClear();
  });

  test('renders with initial loading state and then displays fetched data', async () => {
    // Mock a successful API response
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [
        { activity_id: 1, timestamp: new Date().toISOString(), activity_type: 'Work' },
        { activity_id: 2, timestamp: new Date().toISOString(), activity_type: 'Meeting' },
      ],
    });

    render(<ProductivityMetricCard userId={1} />);

    // Check for loading state initially (metric.value is "Loading...")
    // The title "Activities Today" should be there.
    expect(screen.getByText('Activities Today')).toBeInTheDocument();
    expect(screen.getByText('Loading...')).toBeInTheDocument();

    // Wait for the fetch to complete and state to update
    // For "Activities Today", it counts activities for the current day.
    // The mock data has 2 activities for the current day.
    await act(async () => {
      // Wait for the "Loading..." text to disappear, or for the expected value to appear.
      // Using findByText which retries until timeout.
      expect(await screen.findByText('2')).toBeInTheDocument();
    });

    expect(screen.getByText('tasks')).toBeInTheDocument(); // Unit
    // Ensure "Loading..." is gone
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
  });

  test('displays N/A and error message when fetch fails', async () => {
    // Mock a failed API response
    fetch.mockRejectedValueOnce(new Error('API Error: Failed to fetch'));

    render(<ProductivityMetricCard userId={1} />);

    // Check for loading state initially
    expect(screen.getByText('Activities Today')).toBeInTheDocument();
    expect(screen.getByText('Loading...')).toBeInTheDocument();

    // Wait for the fetch to fail and error state to update
    expect(await screen.findByText('N/A')).toBeInTheDocument(); // Value should be N/A
    expect(screen.getByText(/Could not load data/i)).toBeInTheDocument(); // Error message
    expect(screen.getByText('(API Error: Failed to fetch)')).toBeInTheDocument(); // Specific error shown

    // Ensure "Loading..." is gone
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
  });

  test('renders with specific title, value, and unit when passed directly (if component supported it - current does not)', () => {
    // Note: The current ProductivityMetricCard is hardcoded to "Activities Today" and fetches its own data.
    // This test demonstrates how one might test a more generic version if it took title/value as props.
    // For the current component, this specific test case isn't directly applicable for external props.

    // If we were to test the internal state after a successful fetch:
    // (This is covered by the first test 'renders with initial loading state...')
    // For example, if it displayed a different metric:
    // render(<ProductivityMetricCard title="Focus Hours" value="5.2" unit="hrs" />);
    // expect(screen.getByText('Focus Hours')).toBeInTheDocument();
    // expect(screen.getByText('5.2')).toBeInTheDocument();
    // expect(screen.getByText('hrs')).toBeInTheDocument();

    // Test the default state if no userId is passed (and it didn't fetch)
    // Current component fetches with userId=null if not provided, then errors.
    // If it had a true static default display:
    // render(<ProductivityMetricCard />);
    // expect(screen.getByText('Activities Today')).toBeInTheDocument();
    // expect(screen.getByText('Loading...')).toBeInTheDocument(); // As it would try to fetch with null userId
  });

  test('handles empty data array from API correctly', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [], // Empty array
    });

    render(<ProductivityMetricCard userId={1} />);

    expect(await screen.findByText('0')).toBeInTheDocument();
    expect(screen.getByText('tasks')).toBeInTheDocument();
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
  });

  test('handles API response not being an array', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: "Not an array" }), // Incorrect data format
    });

    render(<ProductivityMetricCard userId={1} />);

    expect(await screen.findByText('N/A')).toBeInTheDocument();
    expect(screen.getByText(/Could not load data/i)).toBeInTheDocument();
    expect(screen.getByText('(Invalid data format from API.)')).toBeInTheDocument();
  });

});
