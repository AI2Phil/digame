# Database Seeding System

Comprehensive seeding scripts for Performance & Monitoring Components and User Interface & Dashboard Components with realistic test data.

## Overview

This seeding system provides extensive test data to ensure all dashboard elements are properly supported with realistic patterns and relationships.

## Components Seeded

### Performance & Monitoring Components
- **User Experience Analytics**: 500 user sessions with page views and Core Web Vitals
- **Query Optimization**: 2000 database queries with performance metrics and optimization recommendations
- **Bundle Analysis**: Multiple build assets with optimization suggestions
- **Performance Monitoring**: Real-time metrics, alerts, and system health data

### User Interface & Dashboard Components
- **Activity Breakdown**: Comprehensive activity tracking across 12 categories
- **Productivity Charts**: 90 days of productivity data for 20 users
- **Activity Management**: Realistic work patterns with proper time distribution
- **Goal Tracking**: User goals with progress tracking and insights

## Data Characteristics

### Realistic Patterns
- **Work Hours**: Activities concentrated during business hours (7 AM - 7 PM)
- **Weekly Patterns**: Reduced activity on weekends (30% chance)
- **Productivity Cycles**: Morning peaks, afternoon dips, realistic variations
- **Activity Distribution**: Development (35%), Meetings (15%), Email (12%), etc.

### Comprehensive Coverage
- **20 Users**: Multiple user profiles with different patterns
- **90 Days**: Three months of historical data
- **12 Activity Categories**: Full spectrum of work activities
- **Performance Metrics**: Real-time system monitoring data
- **Optimization Insights**: Actionable recommendations

## Usage

### Quick Start
```bash
# Seed all data (recommended)
python app/seeds/seed_all.py

# Reset database and seed fresh data
python app/seeds/seed_all.py --reset

# Only create tables without seeding
python app/seeds/seed_all.py --tables-only
```

### Individual Components
```python
from app.seeds import seed_performance_data, seed_activity_data
from app.database import SessionLocal

db = SessionLocal()

# Seed only performance data
seed_performance_data(db)

# Seed only activity data
seed_activity_data(db)

db.close()
```

## Data Structure

### Performance Data
```
UserSession (500 records)
├── PageView (2000+ records)
├── WebVital (5000+ records)
└── Performance metrics

DatabaseQuery (2000 records)
├── QueryOptimization (600 records)
└── Execution analytics

BundleAsset (60+ records)
├── AssetOptimization (24+ records)
└── Build analysis

PerformanceMetric (1000 records)
PerformanceAlert (50 records)
SystemHealth (8640 records - 24h minute data)
```

### Activity Data
```
ActivityCategory (12 categories)
├── Development, Meetings, Learning, etc.
└── Color-coded with productivity flags

UserActivity (15000+ records)
├── 20 users × 90 days × 4-12 activities/day
├── Realistic durations and productivity scores
└── Time-based patterns and variations

ProductivityMetric (1800 records)
├── Daily aggregated metrics per user
├── Efficiency, focus, and energy scores
└── Peak productivity time analysis

ActivityPattern (100+ records)
├── Detected behavioral patterns
├── Daily, weekly, monthly insights
└── Confidence scores and recommendations

ActivityGoal (80+ records)
├── User-defined productivity goals
├── Progress tracking and status
└── Time-based and efficiency targets
```

## Data Quality Features

### Realistic Relationships
- Activities link to proper categories
- Productivity metrics calculated from actual activities
- Web vitals correlate with page performance
- Query optimization based on actual execution patterns

### Intelligent Fallbacks
- All services include fallback data generation
- Frontend components gracefully handle missing data
- API endpoints return consistent data structures
- Error handling with realistic demo data

### Performance Optimized
- Batch inserts for large datasets
- Indexed database queries
- Efficient data relationships
- Minimal memory footprint during seeding

## Customization

### Modify Data Patterns
Edit the seeding scripts to adjust:
- User count and activity patterns
- Time ranges and data density
- Productivity score distributions
- Activity category weights

### Add New Categories
```python
# In activity_seeds.py
categories_data.append({
    "name": "New Category",
    "description": "Description",
    "icon": "🆕",
    "color": "#custom",
    "is_productive": True
})
```

### Extend Performance Metrics
```python
# In performance_seeds.py
metric_names.append('custom_metric')
# Add corresponding value generation logic
```

## Verification

After seeding, verify data integrity:

```sql
-- Check activity distribution
SELECT ac.name, COUNT(*) as activity_count 
FROM user_activities ua 
JOIN activity_categories ac ON ua.category_id = ac.id 
GROUP BY ac.name;

-- Check productivity trends
SELECT DATE(date) as day, AVG(efficiency_score) as avg_efficiency 
FROM productivity_metrics 
GROUP BY DATE(date) 
ORDER BY day DESC LIMIT 7;

-- Check performance metrics
SELECT metric_name, COUNT(*) as count, AVG(metric_value) as avg_value
FROM performance_metrics 
GROUP BY metric_name;
```

## Troubleshooting

### Common Issues
1. **Import Errors**: Ensure you're running from the project root
2. **Database Connection**: Check database configuration in `app/database.py`
3. **Memory Issues**: Reduce batch sizes in seeding scripts for large datasets
4. **Type Errors**: Ensure SQLAlchemy models are properly defined

### Reset Database
```bash
# Complete reset
python app/seeds/seed_all.py --reset

# Or manually
DROP DATABASE digame;
CREATE DATABASE digame;
python app/seeds/seed_all.py
```

## Integration

The seeded data integrates seamlessly with:
- **Frontend Components**: ActivityBreakdown.tsx, ProductivityChart.tsx
- **API Endpoints**: All performance and activity routers
- **Service Layers**: PerformanceService, ActivityService
- **Database Models**: All SQLAlchemy models

This comprehensive seeding system ensures that all dashboard elements have rich, realistic data to demonstrate full functionality and provide meaningful user experiences.