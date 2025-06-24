import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, RefreshControl, FlatList, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AdvancedMobileService from '../services/advancedMobileService';

const InsightsDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    personalizedRecommendations: [],
    predictiveAnalytics: {},
    aiSuggestions: [],
    contextualInsights: [],
    error: null,
  });

  const fetchInsightsData = async () => {
    try {
      const data = await AdvancedMobileService.getInsightsDashboardData();
      setDashboardData(data);
    } catch (error) {
      // This catch is mostly for unexpected errors in the service call itself,
      // as getInsightsDashboardData is designed to return an error object within its response.
      console.error("Critical error fetching insights:", error);
      setDashboardData({
        personalizedRecommendations: [],
        predictiveAnalytics: {},
        aiSuggestions: [],
        contextualInsights: [],
        error: 'Failed to load insights due to a critical error.',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchInsightsData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchInsightsData();
  };

  const renderInsightCard = ({ title, data, renderItem, keyExtractor, category }) => {
    if (!data || data.length === 0) {
      return (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{title}</Text>
          <Text style={styles.emptyText}>No {category} available at the moment.</Text>
        </View>
      );
    }

    return (
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{title}</Text>
        <FlatList
          data={data}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          nestedScrollEnabled
        />
      </View>
    );
  };

  const renderRecommendationItem = ({ item }) => (
    <TouchableOpacity style={styles.listItem}>
      <Icon name="lightbulb-outline" size={20} color="#6366f1" style={styles.listItemIcon} />
      <View style={styles.listItemContent}>
        <Text style={styles.listItemTitle}>{item.title || 'Recommendation'}</Text>
        <Text style={styles.listItemDescription}>{item.description}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderSuggestionItem = ({ item }) => (
    <TouchableOpacity style={styles.listItem}>
      <Icon name="assistant" size={20} color="#10b981" style={styles.listItemIcon} />
       <View style={styles.listItemContent}>
        <Text style={styles.listItemTitle}>{item.text || 'Suggestion'}</Text>
        {item.relatedGoalId && <Text style={styles.listItemMeta}>Related Goal ID: {item.relatedGoalId}</Text>}
      </View>
    </TouchableOpacity>
  );

  const renderContextualInsightItem = ({ item }) => (
    <View style={[styles.listItem, styles.contextualItem]}>
      <Icon name="info-outline" size={20} color="#f59e0b" style={styles.listItemIcon} />
      <View style={styles.listItemContent}>
        <Text style={styles.listItemDescription}>{item.message || 'Contextual Insight'}</Text>
      </View>
    </View>
  );


  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
        <Text style={styles.loadingText}>Loading AI Insights...</Text>
      </View>
    );
  }

  if (dashboardData.error && !loading) { // Show error if not loading and error exists
    return (
      <View style={styles.errorContainer}>
        <Icon name="error-outline" size={48} color="#ef4444" />
        <Text style={styles.errorText}>Could not load insights.</Text>
        <Text style={styles.errorDetail}>{dashboardData.error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchInsightsData}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#6366f1"]} />}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>AI-Powered Insights</Text>
        <Text style={styles.headerSubtitle}>Your personalized productivity hub</Text>
      </View>

      {/* Predictive Analytics Section */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Predictive Analytics</Text>
        {Object.keys(dashboardData.predictiveAnalytics || {}).length > 0 ? (
          <View style={styles.predictiveContent}>
            <View style={styles.predictiveItem}>
              <Icon name="trending-up" size={24} color="#8b5cf6" />
              <Text style={styles.predictiveValue}>{dashboardData.predictiveAnalytics.productivityScoreForecast || 'N/A'}%</Text>
              <Text style={styles.predictiveLabel}>Productivity Forecast</Text>
            </View>
            <View style={styles.predictiveItem}>
              <Icon name="timelapse" size={24} color="#06b6d4" />
              <Text style={styles.predictiveValue}>{dashboardData.predictiveAnalytics.focusTimeNextWeek || 'N/A'}</Text>
              <Text style={styles.predictiveLabel}>Est. Focus Next Week</Text>
            </View>
            {/* Add more predictive items as needed */}
          </View>
        ) : (
          <Text style={styles.emptyText}>No predictive analytics available yet.</Text>
        )}
      </View>

      {renderInsightCard({
        title: 'Personalized Recommendations',
        data: dashboardData.personalizedRecommendations,
        renderItem: renderRecommendationItem,
        keyExtractor: (item, index) => item.id || `rec-${index}`,
        category: 'recommendations'
      })}

      {renderInsightCard({
        title: 'AI-Generated Suggestions',
        data: dashboardData.aiSuggestions,
        renderItem: renderSuggestionItem,
        keyExtractor: (item, index) => item.id || `sug-${index}`,
        category: 'suggestions'
      })}

      {/* Contextual Insights - could be less prominent or displayed differently if they are more transient */}
      {dashboardData.contextualInsights && dashboardData.contextualInsights.length > 0 && (
         renderInsightCard({
          title: 'Contextual Insights (Current)',
          data: dashboardData.contextualInsights,
          renderItem: renderContextualInsightItem,
          keyExtractor: (item, index) => item.id || `ctx-${index}`,
          category: 'contextual insights'
        })
      )}
      <View style={styles.footerSpacer} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4f8', // Light background color
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f4f8',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#555',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f0f4f8',
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ef4444',
    marginTop: 10,
    textAlign: 'center',
  },
  errorDetail: {
    fontSize: 14,
    color: '#4b5563',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#6366f1',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    backgroundColor: '#6366f1', // Primary color
    paddingVertical: 20,
    paddingHorizontal: 15,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 15,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#e0e7ff',
    textAlign: 'center',
    marginTop: 4,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 15,
    marginHorizontal: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#777',
    textAlign: 'center',
    paddingVertical: 10,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  listItemIcon: {
    marginRight: 10,
    marginTop: 2, // Align icon better with text
  },
  listItemContent: {
    flex: 1,
  },
  listItemTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#444',
  },
  listItemDescription: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  listItemMeta: {
    fontSize: 11,
    color: '#888',
    marginTop: 4,
  },
  contextualItem: {
    backgroundColor: '#fffbeb', // Light yellow for contextual items
    borderRadius: 8,
    padding: 10, // Slightly different padding
    marginBottom: 8,
    borderBottomWidth: 0, // Remove border if it's a distinct block
  },
  predictiveContent: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
  },
  predictiveItem: {
    alignItems: 'center',
    flex: 1,
  },
  predictiveValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 5,
  },
  predictiveLabel: {
    fontSize: 12,
    color: '#777',
    marginTop: 3,
  },
  footerSpacer: {
      height: 20,
  }
});

export default InsightsDashboard;
