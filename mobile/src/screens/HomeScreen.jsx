import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  ScrollView,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Services
import enhancedOfflineService from '../services/enhancedOfflineService';
import gestureNavigationService from '../services/gestureNavigationService';
import accessibilityService from '../services/accessibilityService';
import responsiveDesign from '../utils/responsiveDesign';

// Components
import {
  OptimizedContainer,
  AdaptiveLayout,
  EnhancedTouchable,
  ResponsiveText,
  OptimizedFlatList,
  AdaptiveCard,
  LoadingSkeleton,
  ResponsiveGrid,
  usePerformanceMonitor,
} from '../components/MobileOptimizedUI';

const HomeScreen = ({ navigation }) => {
  usePerformanceMonitor('HomeScreen');

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [data, setData] = useState([]);
  const [quickActions, setQuickActions] = useState([]);
  const [screenData, setScreenData] = useState(responsiveDesign.getScreenData());

  // Initialize screen
  useEffect(() => {
    initializeScreen();
    setupGestures();
    
    // Listen for screen changes
    const unsubscribe = responsiveDesign.addListener(setScreenData);
    return unsubscribe;
  }, []);

  const initializeScreen = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Load data from offline storage first
      const cachedData = await enhancedOfflineService.getCachedData('home_data');
      if (cachedData) {
        setData(cachedData.items || []);
        setQuickActions(cachedData.quickActions || []);
      }
      
      // Try to fetch fresh data
      await fetchFreshData();
      
    } catch (error) {
      console.error('Failed to initialize home screen:', error);
      
      // Show user-friendly error message
      if (accessibilityService.isScreenReaderEnabled()) {
        await accessibilityService.announceForScreenReader(
          'Failed to load content. Using offline data.'
        );
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchFreshData = useCallback(async () => {
    try {
      // Simulate API call
      const freshData = await simulateApiCall();
      
      setData(freshData.items);
      setQuickActions(freshData.quickActions);
      
      // Cache the fresh data
      await enhancedOfflineService.cacheData('home_data', freshData);
      
    } catch (error) {
      console.error('Failed to fetch fresh data:', error);
      
      // Add to sync queue for later
      enhancedOfflineService.addToSyncQueue({
        type: 'fetch_home_data',
        endpoint: '/api/home',
        priority: 'medium',
      });
    }
  }, []);

  const simulateApiCall = useCallback(async () => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      items: [
        { id: '1', title: 'Welcome Back!', subtitle: 'Check out what\'s new', type: 'welcome' },
        { id: '2', title: 'Recent Activity', subtitle: '5 new updates', type: 'activity' },
        { id: '3', title: 'Quick Stats', subtitle: 'Your progress this week', type: 'stats' },
        { id: '4', title: 'Recommendations', subtitle: 'Personalized for you', type: 'recommendations' },
      ],
      quickActions: [
        { id: 'scan', title: 'Scan', icon: 'scan', color: '#007AFF' },
        { id: 'create', title: 'Create', icon: 'add-circle', color: '#34C759' },
        { id: 'search', title: 'Search', icon: 'search', color: '#FF9500' },
        { id: 'share', title: 'Share', icon: 'share', color: '#AF52DE' },
      ],
    };
  }, []);

  const setupGestures = useCallback(() => {
    // Register voice commands for accessibility
    gestureNavigationService.registerNavigationCallback('refresh', handleRefresh);
    
    if (accessibilityService.isVoiceControlEnabled()) {
      accessibilityService.registerVoiceCommand('refresh page', handleRefresh, 'Refresh the home screen');
      accessibilityService.registerVoiceCommand('go to settings', () => navigation.navigate('Settings'), 'Navigate to settings');
    }
  }, [navigation]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    
    try {
      await fetchFreshData();
      
      // Provide haptic feedback
      if (gestureNavigationService.hapticEnabled) {
        await gestureNavigationService.triggerHaptic('success');
      }
      
      // Announce completion for screen readers
      if (accessibilityService.isScreenReaderEnabled()) {
        await accessibilityService.announceForScreenReader('Content refreshed');
      }
      
    } catch (error) {
      console.error('Refresh failed:', error);
      
      if (gestureNavigationService.hapticEnabled) {
        await gestureNavigationService.triggerHaptic('error');
      }
      
      Alert.alert('Refresh Failed', 'Unable to refresh content. Please try again.');
    } finally {
      setIsRefreshing(false);
    }
  }, [fetchFreshData]);

  const handleQuickAction = useCallback(async (action) => {
    console.log('Quick action pressed:', action.id);
    
    // Provide haptic feedback
    if (gestureNavigationService.hapticEnabled) {
      await gestureNavigationService.triggerHaptic('light');
    }
    
    // Announce action for screen readers
    if (accessibilityService.isScreenReaderEnabled()) {
      await accessibilityService.announceForScreenReader(`${action.title} selected`);
    }
    
    // Handle different actions
    switch (action.id) {
      case 'scan':
        // Navigate to scan screen or show camera
        Alert.alert('Scan', 'Camera functionality would open here');
        break;
      case 'create':
        // Navigate to create screen
        Alert.alert('Create', 'Create new item functionality');
        break;
      case 'search':
        // Navigate to search screen
        Alert.alert('Search', 'Search functionality would open here');
        break;
      case 'share':
        // Open share dialog
        Alert.alert('Share', 'Share functionality would open here');
        break;
      default:
        console.warn('Unknown quick action:', action.id);
    }
  }, []);

  const handleItemPress = useCallback(async (item) => {
    console.log('Item pressed:', item.id);
    
    // Provide haptic feedback
    if (gestureNavigationService.hapticEnabled) {
      await gestureNavigationService.triggerHaptic('light');
    }
    
    // Navigate based on item type
    switch (item.type) {
      case 'welcome':
        Alert.alert('Welcome', 'Welcome message details');
        break;
      case 'activity':
        Alert.alert('Activity', 'Recent activity details');
        break;
      case 'stats':
        Alert.alert('Stats', 'Statistics details');
        break;
      case 'recommendations':
        Alert.alert('Recommendations', 'Personalized recommendations');
        break;
      default:
        Alert.alert('Details', `Details for ${item.title}`);
    }
  }, []);

  // Memoized components for performance
  const QuickActionItem = useMemo(() => React.memo(({ item, onPress }) => {
    const touchTargetSize = responsiveDesign.getTouchTargetSize(56);
    const iconSize = screenData.isTablet ? 28 : 24;
    
    return (
      <EnhancedTouchable
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: touchTargetSize,
          minWidth: touchTargetSize,
          padding: responsiveDesign.getSpacing(8),
        }}
        onPress={() => onPress(item)}
        hapticFeedback="light"
        {...accessibilityService.createAccessibilityProps({
          label: `${item.title} button`,
          hint: `Tap to ${item.title.toLowerCase()}`,
          role: 'button',
        })}
      >
        <View
          style={{
            width: touchTargetSize,
            height: touchTargetSize,
            borderRadius: touchTargetSize / 2,
            backgroundColor: item.color,
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 8,
          }}
        >
          <Ionicons name={item.icon} size={iconSize} color="#FFFFFF" />
        </View>
        <ResponsiveText
          variant="caption"
          style={{
            textAlign: 'center',
            color: '#8E8E93',
            fontSize: responsiveDesign.scaledFont(12),
          }}
        >
          {item.title}
        </ResponsiveText>
      </EnhancedTouchable>
    );
  }), [screenData, handleQuickAction]);

  const DataItem = useMemo(() => React.memo(({ item, onPress }) => (
    <AdaptiveCard
      style={{
        marginHorizontal: responsiveDesign.getSpacing(16),
        marginVertical: responsiveDesign.getSpacing(8),
      }}
      elevation={2}
    >
      <EnhancedTouchable
        style={{ padding: responsiveDesign.getSpacing(16) }}
        onPress={() => onPress(item)}
        hapticFeedback="light"
        {...accessibilityService.createAccessibilityProps({
          label: item.title,
          hint: item.subtitle,
          role: 'button',
        })}
      >
        <ResponsiveText
          variant="headline"
          style={{
            marginBottom: 4,
            fontSize: responsiveDesign.scaledFont(18),
          }}
        >
          {item.title}
        </ResponsiveText>
        <ResponsiveText
          variant="body"
          style={{
            color: '#8E8E93',
            fontSize: responsiveDesign.scaledFont(14),
          }}
        >
          {item.subtitle}
        </ResponsiveText>
      </EnhancedTouchable>
    </AdaptiveCard>
  )), [handleItemPress]);

  const LoadingContent = useMemo(() => (
    <View style={{ padding: responsiveDesign.getSpacing(16) }}>
      {/* Quick Actions Skeleton */}
      <View style={{ marginBottom: responsiveDesign.getSpacing(24) }}>
        <LoadingSkeleton width="40%" height={20} style={{ marginBottom: 16 }} />
        <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
          {[1, 2, 3, 4].map(i => (
            <View key={i} style={{ alignItems: 'center' }}>
              <LoadingSkeleton width={56} height={56} borderRadius={28} style={{ marginBottom: 8 }} />
              <LoadingSkeleton width={40} height={12} />
            </View>
          ))}
        </View>
      </View>
      
      {/* Data Items Skeleton */}
      {[1, 2, 3].map(i => (
        <AdaptiveCard key={i} style={{ marginBottom: 16 }}>
          <View style={{ padding: 16 }}>
            <LoadingSkeleton width="70%" height={18} style={{ marginBottom: 8 }} />
            <LoadingSkeleton width="50%" height={14} />
          </View>
        </AdaptiveCard>
      ))}
    </View>
  ), []);

  if (isLoading) {
    return (
      <OptimizedContainer>
        <ScrollView showsVerticalScrollIndicator={false}>
          {LoadingContent}
        </ScrollView>
      </OptimizedContainer>
    );
  }

  return (
    <OptimizedContainer>
      <AdaptiveLayout>
        {({ isTablet, orientation }) => (
          <ScrollView
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={handleRefresh}
                tintColor="#007AFF"
                colors={['#007AFF']}
              />
            }
            contentContainerStyle={{
              paddingBottom: responsiveDesign.getSafeAreaInsets().bottom + 20,
            }}
          >
            {/* Header */}
            <View style={{ 
              padding: responsiveDesign.getSpacing(16),
              paddingTop: responsiveDesign.getSafeAreaInsets().top + 16,
            }}>
              <ResponsiveText
                variant="title"
                style={{
                  fontSize: responsiveDesign.scaledFont(28),
                  fontWeight: '700',
                  marginBottom: 8,
                }}
                {...accessibilityService.createAccessibilityProps({
                  label: 'Home screen',
                  role: 'header',
                })}
              >
                Welcome Back
              </ResponsiveText>
              <ResponsiveText
                variant="body"
                style={{
                  color: '#8E8E93',
                  fontSize: responsiveDesign.scaledFont(16),
                }}
              >
                Here's what's happening today
              </ResponsiveText>
            </View>

            {/* Quick Actions */}
            <View style={{ 
              marginBottom: responsiveDesign.getSpacing(24),
              paddingHorizontal: responsiveDesign.getSpacing(16),
            }}>
              <ResponsiveText
                variant="headline"
                style={{
                  fontSize: responsiveDesign.scaledFont(20),
                  fontWeight: '600',
                  marginBottom: 16,
                }}
              >
                Quick Actions
              </ResponsiveText>
              
              <ResponsiveGrid
                data={quickActions}
                renderItem={({ item }) => (
                  <QuickActionItem item={item} onPress={handleQuickAction} />
                )}
                numColumns={responsiveDesign.getColumns(4)}
                spacing={responsiveDesign.getSpacing(16)}
              />
            </View>

            {/* Main Content */}
            <View>
              <ResponsiveText
                variant="headline"
                style={{
                  fontSize: responsiveDesign.scaledFont(20),
                  fontWeight: '600',
                  marginBottom: 16,
                  paddingHorizontal: responsiveDesign.getSpacing(16),
                }}
              >
                Recent Updates
              </ResponsiveText>
              
              {data.map(item => (
                <DataItem key={item.id} item={item} onPress={handleItemPress} />
              ))}
            </View>
          </ScrollView>
        )}
      </AdaptiveLayout>
    </OptimizedContainer>
  );
};

export default HomeScreen;