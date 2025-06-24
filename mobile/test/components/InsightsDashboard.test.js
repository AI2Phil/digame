import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react-native';
import InsightsDashboard from '../../src/components/InsightsDashboard';
import AdvancedMobileService from '../../src/services/advancedMobileService';

// Mock AdvancedMobileService
jest.mock('../../src/services/advancedMobileService');

// Mock react-native-vector-icons
jest.mock('react-native-vector-icons/MaterialIcons', () => 'Icon');

describe('InsightsDashboard', () => {
  const mockNavigation = { navigate: jest.fn() };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render loading state initially', () => {
    AdvancedMobileService.getInsightsDashboardData.mockResolvedValueOnce(new Promise(() => {})); // Never resolves
    const { getByText } = render(<InsightsDashboard navigation={mockNavigation} />);
    expect(getByText('Loading AI Insights...')).toBeTruthy();
  });

  it('should display insights data after successful fetch', async () => {
    const mockData = {
      personalizedRecommendations: [{ id: 'rec1', title: 'Sleep More', description: 'Aim for 8 hours.' }],
      predictiveAnalytics: { productivityScoreForecast: 88, focusTimeNextWeek: '12h' },
      aiSuggestions: [{ id: 'sug1', text: 'Plan your week on Sunday.' }],
      contextualInsights: [{ id: 'ctx1', message: 'You are most productive in the mornings.' }],
      error: null,
    };
    AdvancedMobileService.getInsightsDashboardData.mockResolvedValueOnce(mockData);

    const { getByText, findByText } = render(<InsightsDashboard navigation={mockNavigation} />);

    await waitFor(() => {
      expect(findByText('Sleep More')).toBeTruthy();
      expect(getByText('Productivity Forecast')).toBeTruthy();
      expect(getByText('88%')).toBeTruthy(); // Part of predictiveAnalytics display
      expect(getByText('Plan your week on Sunday.')).toBeTruthy();
      expect(getByText('You are most productive in the mornings.')).toBeTruthy();
    });
  });

  it('should display "no data" messages when sections have no data', async () => {
    const mockData = {
      personalizedRecommendations: [],
      predictiveAnalytics: {},
      aiSuggestions: [],
      contextualInsights: [],
      error: null,
    };
    AdvancedMobileService.getInsightsDashboardData.mockResolvedValueOnce(mockData);

    const { getByText } = render(<InsightsDashboard navigation={mockNavigation} />);

    await waitFor(() => {
      expect(getByText('No recommendations available at the moment.')).toBeTruthy();
      expect(getByText('No predictive analytics available yet.')).toBeTruthy();
      expect(getByText('No suggestions available at the moment.')).toBeTruthy();
      // Contextual insights section might not render at all if data is empty, or show its own empty message.
    });
  });

  it('should display error state if fetching insights fails', async () => {
    AdvancedMobileService.getInsightsDashboardData.mockResolvedValueOnce({
      error: 'Network Error',
      personalizedRecommendations: [],
      predictiveAnalytics: {},
      aiSuggestions: [],
      contextualInsights: [],
    });

    const { getByText } = render(<InsightsDashboard navigation={mockNavigation} />);

    await waitFor(() => {
      expect(getByText('Could not load insights.')).toBeTruthy();
      expect(getByText('Network Error')).toBeTruthy();
    });
  });

  it('should allow refreshing the data by retrying after an error', async () => {
    // Initial load fails
    AdvancedMobileService.getInsightsDashboardData.mockResolvedValueOnce({
      error: 'Initial Load Error',
      personalizedRecommendations: [], predictiveAnalytics: {}, aiSuggestions: [], contextualInsights: [],
    });

    const { getByText, findByText } = render(<InsightsDashboard navigation={mockNavigation} />);
    await findByText('Initial Load Error'); // Wait for error to display

    // Setup for successful retry
    const refreshedData = {
      personalizedRecommendations: [{ id: 'rec2', title: 'Refreshed Rec', description: 'Desc 2' }],
      predictiveAnalytics: { productivityScoreForecast: 90 },
      aiSuggestions: [], contextualInsights: [], error: null,
    };
    AdvancedMobileService.getInsightsDashboardData.mockResolvedValueOnce(refreshedData);

    fireEvent.press(getByText('Try Again'));

    await findByText('Refreshed Rec');
    expect(AdvancedMobileService.getInsightsDashboardData).toHaveBeenCalledTimes(2); // Initial call + retry call
  });

});
