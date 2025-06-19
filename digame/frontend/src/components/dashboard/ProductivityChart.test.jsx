import React from 'react';
import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';

import ProductivityChart from './ProductivityChart';

// Mock the fetch function globally
global.fetch = jest.fn();

// Mock Recharts components
// We are interested if our component *uses* them and passes correct data,
// not in testing Recharts' own rendering.
jest.mock('recharts', () => {
  const MockResponsiveContainer = ({ children }) => <div data-testid="responsive-container">{children}</div>;
  const MockBarChart = ({ data, children, margin }) => (
    <div data-testid="bar-chart" data-chartdata={JSON.stringify(data)} data-margin={JSON.stringify(margin)}>
      {children}
    </div>
  );
  const MockXAxis = ({ dataKey }) => <div data-testid="x-axis" data-datakey={dataKey}>XAxis</div>;
  const MockYAxis = () => <div data-testid="y-axis">YAxis</div>;
  const MockCartesianGrid = () => <div data-testid="cartesian-grid">CartesianGrid</div>;
  const MockTooltip = () => <div data-testid="tooltip">Tooltip</div>;
  const MockLegend = () => <div data-testid="legend">Legend</div>;
  const MockBar = ({ dataKey, name, fill }) => (
    <div data-testid="bar" data-datakey={dataKey} data-name={name} data-fill={fill}>
      Bar
    </div>
  );
  return {
    BarChart: MockBarChart,
    Bar: MockBar,
    XAxis: MockXAxis,
    YAxis: MockYAxis,
    CartesianGrid: MockCartesianGrid,
    Tooltip: MockTooltip,
    Legend: MockLegend,
    ResponsiveContainer: MockResponsiveContainer,
  };
});


describe('ProductivityChart Component', () => {
  beforeEach(() => {
    fetch.mockClear();
    // Clear any previous mock implementations for recharts if necessary, though jest.mock is module-wide
  });

  test('renders loading state initially when userId is provided', () => {
    render(<ProductivityChart userId={1} />);
    expect(screen.getByText(/Productivity Trend/i)).toBeInTheDocument();
    expect(screen.getByText('Loading chart data...')).toBeInTheDocument();
  });

  test('renders error state if userId is not provided', () => {
    render(<ProductivityChart userId={null} />); // Pass null or undefined for userId
    expect(screen.getByText(/Productivity Trend/i)).toBeInTheDocument();
    expect(screen.getByText(/Could not load chart data/i)).toBeInTheDocument();
    expect(screen.getByText('(User ID is required to fetch chart data.)')).toBeInTheDocument();
    expect(screen.queryByText('Loading chart data...')).not.toBeInTheDocument();
  });

  test('renders error state when API fetch fails', async () => {
    fetch.mockRejectedValueOnce(new Error('API Chart Fetch Error'));
    render(<ProductivityChart userId={1} />);

    expect(await screen.findByText(/Could not load chart data/i)).toBeInTheDocument();
    expect(screen.getByText('(API Chart Fetch Error)')).toBeInTheDocument();
  });

  test('renders empty state when API returns no activities', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });
    render(<ProductivityChart userId={1} />);

    expect(await screen.findByText('No activity data to display chart for the last 7 days.')).toBeInTheDocument();
  });

  test('renders error state when API returns non-array data', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: "Not an array for chart" }),
    });
    render(<ProductivityChart userId={1} />);

    expect(await screen.findByText(/Could not load chart data/i)).toBeInTheDocument();
    expect(screen.getByText('(Invalid data format from API.)')).toBeInTheDocument();
  });

  describe('Successful data processing and Recharts rendering', () => {
    // Helper to format date as YYYY-MM-DD for consistent comparison
    const formatDateISO = (date) => {
        const d = new Date(date);
        let month = '' + (d.getMonth() + 1);
        let day = '' + d.getDate();
        const year = d.getFullYear();
        if (month.length < 2) month = '0' + month;
        if (day.length < 2) day = '0' + day;
        return [year, month, day].join('-');
    };

    // Generate mock data for 10 days ending today
    const today = new Date();
    const mockApiData = Array.from({ length: 10 }, (_, i) => {
        const date = new Date();
        date.setDate(today.getDate() - i);
        return { activity_id: i, timestamp: date.toISOString(), activity_type: \`Type\${i % 2}\` };
    }).reverse(); // oldest first for processing

    test('processes data correctly (last 7 days, sorted, formatted for Recharts) and renders Recharts components', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockApiData,
      });
      render(<ProductivityChart userId={1} />);

      // Wait for chart components to be rendered
      expect(await screen.findByTestId('responsive-container')).toBeInTheDocument();
      const barChartElement = screen.getByTestId('bar-chart');
      expect(barChartElement).toBeInTheDocument();
      expect(screen.getByTestId('x-axis')).toBeInTheDocument();
      expect(screen.getByTestId('y-axis')).toBeInTheDocument();
      expect(screen.getByTestId('cartesian-grid')).toBeInTheDocument();
      expect(screen.getByTestId('tooltip')).toBeInTheDocument();
      expect(screen.getByTestId('legend')).toBeInTheDocument();
      const barElement = screen.getByTestId('bar');
      expect(barElement).toBeInTheDocument();

      // Verify data passed to BarChart (last 7 days)
      const chartDataAttribute = barChartElement.getAttribute('data-chartdata');
      const parsedChartData = JSON.parse(chartDataAttribute);

      expect(parsedChartData.length).toBe(7);

      // Check if dates are correct (last 7 days)
      const expectedDates = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(today.getDate() - i);
        expectedDates.push(formatDateISO(date));
      }

      parsedChartData.forEach((item, index) => {
        expect(item.date).toEqual(expectedDates[index]);
        expect(item.displayDate).toBeDefined(); // e.g., "10/27"
        expect(item.count).toBeGreaterThanOrEqual(0); // Each day from mockApiData has 1 activity
      });

      // Verify XAxis dataKey
      expect(screen.getByTestId('x-axis')).toHaveAttribute('data-datakey', 'displayDate');

      // Verify Bar dataKey and props
      expect(barElement).toHaveAttribute('data-datakey', 'count');
      expect(barElement).toHaveAttribute('data-name', 'Activities');
      expect(barElement).toHaveAttribute('data-fill', '#3B82F6');
    });
  });
});
