"""
Performance & Monitoring Components Seeding Script
Comprehensive seeded data for all performance tracking elements
"""

from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import random
import uuid
import hashlib
import json

from app.models.performance_models import (
    UserSession, PageView, WebVital, DatabaseQuery, QueryOptimization,
    BundleAsset, AssetOptimization, PerformanceMetric, PerformanceAlert, SystemHealth
)

class PerformanceSeeder:
    """Comprehensive seeder for performance monitoring data"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def seed_all(self):
        """Seed all performance monitoring data"""
        print("🌱 Seeding Performance & Monitoring Components...")
        
        # Clear existing data
        self._clear_existing_data()
        
        # Seed data in dependency order
        self.seed_user_sessions()
        self.seed_page_views()
        self.seed_web_vitals()
        self.seed_database_queries()
        self.seed_query_optimizations()
        self.seed_bundle_assets()
        self.seed_asset_optimizations()
        self.seed_performance_metrics()
        self.seed_performance_alerts()
        self.seed_system_health()
        
        print("✅ Performance & Monitoring Components seeded successfully!")
    
    def _clear_existing_data(self):
        """Clear existing performance data"""
        tables = [
            SystemHealth, PerformanceAlert, PerformanceMetric,
            AssetOptimization, BundleAsset, QueryOptimization,
            DatabaseQuery, WebVital, PageView, UserSession
        ]
        
        for table in tables:
            self.db.query(table).delete()
        self.db.commit()
    
    def seed_user_sessions(self):
        """Seed user session data"""
        print("  📊 Seeding user sessions...")
        
        devices = ['desktop', 'mobile', 'tablet']
        browsers = ['Chrome', 'Firefox', 'Safari', 'Edge']
        operating_systems = ['Windows', 'macOS', 'Linux', 'iOS', 'Android']
        locations = ['New York', 'London', 'Tokyo', 'San Francisco', 'Berlin', 'Sydney']
        
        sessions = []
        for i in range(500):  # 500 sessions over last 30 days
            start_time = datetime.utcnow() - timedelta(
                days=random.randint(0, 30),
                hours=random.randint(0, 23),
                minutes=random.randint(0, 59)
            )
            
            duration = random.randint(30, 7200)  # 30 seconds to 2 hours
            end_time = start_time + timedelta(seconds=duration)
            
            session = UserSession(
                id=str(uuid.uuid4()),
                user_id=f"user_{random.randint(1, 100)}",
                session_id=f"session_{uuid.uuid4().hex[:16]}",
                start_time=start_time,
                end_time=end_time,
                duration=duration,
                page_views=random.randint(1, 20),
                interactions=random.randint(0, 50),
                device_type=random.choice(devices),
                browser=random.choice(browsers),
                os=random.choice(operating_systems),
                location=random.choice(locations),
                ip_address=f"{random.randint(1,255)}.{random.randint(1,255)}.{random.randint(1,255)}.{random.randint(1,255)}",
                user_agent=f"Mozilla/5.0 ({random.choice(operating_systems)}) Browser/{random.randint(90,120)}.0",
                bounce_rate=random.uniform(0.1, 0.8),
                conversion_events=random.randint(0, 5)
            )
            sessions.append(session)
        
        self.db.add_all(sessions)
        self.db.commit()
        print(f"    ✓ Created {len(sessions)} user sessions")
    
    def seed_page_views(self):
        """Seed page view data"""
        print("  📄 Seeding page views...")
        
        # Get existing sessions
        sessions = self.db.query(UserSession).all()
        
        pages = [
            '/dashboard', '/analytics', '/settings', '/profile', '/reports',
            '/projects', '/tasks', '/calendar', '/messages', '/help',
            '/api/docs', '/admin', '/billing', '/integrations'
        ]
        
        referrers = [
            'https://google.com', 'https://github.com', 'https://stackoverflow.com',
            'direct', 'https://twitter.com', 'https://linkedin.com'
        ]
        
        page_views = []
        for session in sessions:
            # Use safe defaults for page views and duration
            num_views = min(getattr(session, 'page_views', 1) or 1, 15)
            session_duration = getattr(session, 'duration', 300) or 300
            
            for i in range(num_views):
                view_time = session.start_time + timedelta(
                    seconds=random.randint(0, int(session_duration))
                )
                
                page_view = PageView(
                    id=str(uuid.uuid4()),
                    session_id=session.id,
                    page_path=random.choice(pages),
                    page_title=f"Page {random.choice(pages).replace('/', '').title()}",
                    referrer=random.choice(referrers) if i == 0 else None,
                    load_time=random.uniform(200, 3000),  # 200ms to 3s
                    time_on_page=random.randint(10, 300),  # 10s to 5min
                    scroll_depth=random.uniform(0.2, 1.0),
                    exit_page=(i == num_views - 1),
                    timestamp=view_time
                )
                page_views.append(page_view)
        
        self.db.add_all(page_views)
        self.db.commit()
        print(f"    ✓ Created {len(page_views)} page views")
    
    def seed_web_vitals(self):
        """Seed Core Web Vitals data"""
        print("  ⚡ Seeding Core Web Vitals...")
        
        sessions = self.db.query(UserSession).all()
        page_views = self.db.query(PageView).all()
        
        vital_metrics = [
            ('First Contentful Paint', 'ms', (800, 3000)),
            ('Largest Contentful Paint', 'ms', (1200, 4500)),
            ('First Input Delay', 'ms', (50, 300)),
            ('Cumulative Layout Shift', '', (0.05, 0.3)),
            ('Time to Interactive', 'ms', (2000, 8000))
        ]
        
        web_vitals = []
        for page_view in page_views[:1000]:  # Limit to 1000 for performance
            session = next((s for s in sessions if s.id == page_view.session_id), None)
            if not session:
                continue
            
            for metric_name, unit, (min_val, max_val) in vital_metrics:
                if random.random() < 0.7:  # 70% chance of having each metric
                    value = random.uniform(min_val, max_val)
                    
                    # Determine rating based on thresholds
                    if metric_name == 'First Contentful Paint':
                        rating = 'good' if value <= 1800 else 'needs-improvement' if value <= 3000 else 'poor'
                    elif metric_name == 'Largest Contentful Paint':
                        rating = 'good' if value <= 2500 else 'needs-improvement' if value <= 4000 else 'poor'
                    elif metric_name == 'First Input Delay':
                        rating = 'good' if value <= 100 else 'needs-improvement' if value <= 300 else 'poor'
                    elif metric_name == 'Cumulative Layout Shift':
                        rating = 'good' if value <= 0.1 else 'needs-improvement' if value <= 0.25 else 'poor'
                    else:  # Time to Interactive
                        rating = 'good' if value <= 3800 else 'needs-improvement' if value <= 7300 else 'poor'
                    
                    web_vital = WebVital(
                        id=str(uuid.uuid4()),
                        session_id=session.id,
                        page_path=page_view.page_path,
                        metric_name=metric_name,
                        metric_value=value,
                        metric_unit=unit,
                        rating=rating,
                        timestamp=page_view.timestamp
                    )
                    web_vitals.append(web_vital)
        
        self.db.add_all(web_vitals)
        self.db.commit()
        print(f"    ✓ Created {len(web_vitals)} web vital metrics")
    
    def seed_database_queries(self):
        """Seed database query performance data"""
        print("  🗄️ Seeding database queries...")
        
        query_templates = [
            "SELECT * FROM users WHERE id = %s",
            "SELECT u.*, p.* FROM users u JOIN profiles p ON u.id = p.user_id WHERE u.active = true",
            "INSERT INTO activities (user_id, title, duration) VALUES (%s, %s, %s)",
            "UPDATE users SET last_login = %s WHERE id = %s",
            "DELETE FROM sessions WHERE expires_at < %s",
            "SELECT COUNT(*) FROM activities WHERE created_at >= %s",
            "SELECT AVG(productivity_score) FROM activities WHERE user_id = %s AND date >= %s",
            "SELECT * FROM performance_metrics ORDER BY timestamp DESC LIMIT 100"
        ]
        
        databases = ['main_db', 'analytics_db', 'cache_db']
        tables = ['users', 'activities', 'sessions', 'performance_metrics', 'profiles']
        query_types = ['SELECT', 'INSERT', 'UPDATE', 'DELETE']
        
        queries = []
        for i in range(2000):  # 2000 queries over last 7 days
            query_text = random.choice(query_templates)
            query_hash = hashlib.md5(query_text.encode()).hexdigest()
            
            timestamp = datetime.utcnow() - timedelta(
                days=random.randint(0, 7),
                hours=random.randint(0, 23),
                minutes=random.randint(0, 59)
            )
            
            # Simulate realistic execution times based on query type
            base_time = random.uniform(1, 50)  # Base 1-50ms
            if 'JOIN' in query_text:
                base_time *= random.uniform(2, 5)  # Joins are slower
            if 'COUNT' in query_text or 'AVG' in query_text:
                base_time *= random.uniform(1.5, 3)  # Aggregations are slower
            
            query = DatabaseQuery(
                id=str(uuid.uuid4()),
                query_hash=query_hash,
                query_text=query_text,
                database_name=random.choice(databases),
                table_name=random.choice(tables),
                query_type=query_text.split()[0],
                execution_time=base_time,
                rows_examined=random.randint(1, 10000),
                rows_returned=random.randint(0, 1000),
                index_used=random.random() < 0.7,  # 70% use indexes
                cache_hit=random.random() < 0.4,   # 40% cache hits
                user_id=f"user_{random.randint(1, 100)}",
                timestamp=timestamp
            )
            queries.append(query)
        
        self.db.add_all(queries)
        self.db.commit()
        print(f"    ✓ Created {len(queries)} database queries")
    
    def seed_query_optimizations(self):
        """Seed query optimization recommendations"""
        print("  🔧 Seeding query optimizations...")
        
        # Get some query hashes to reference
        queries = self.db.query(DatabaseQuery).limit(50).all()
        
        optimization_types = ['index', 'query_rewrite', 'caching', 'partitioning']
        priorities = ['high', 'medium', 'low']
        efforts = ['low', 'medium', 'high']
        statuses = ['pending', 'in_progress', 'implemented', 'dismissed']
        
        optimizations = []
        for query in queries:
            if random.random() < 0.3:  # 30% of queries have optimization suggestions
                optimization = QueryOptimization(
                    id=str(uuid.uuid4()),
                    query_hash=query.query_hash,
                    optimization_type=random.choice(optimization_types),
                    priority=random.choice(priorities),
                    description=f"Optimize {query.query_type} query on {query.table_name} table",
                    estimated_improvement=f"{random.randint(20, 80)}% faster execution",
                    effort_level=random.choice(efforts),
                    implementation_steps=[
                        "Analyze query execution plan",
                        "Create appropriate indexes",
                        "Test performance improvement",
                        "Deploy to production"
                    ],
                    status=random.choice(statuses)
                )
                optimizations.append(optimization)
        
        self.db.add_all(optimizations)
        self.db.commit()
        print(f"    ✓ Created {len(optimizations)} query optimizations")
    
    def seed_bundle_assets(self):
        """Seed bundle asset data"""
        print("  📦 Seeding bundle assets...")
        
        build_ids = [f"build_{i}" for i in range(1, 11)]  # 10 builds
        asset_types = ['js', 'css', 'image', 'font', 'other']
        
        assets = []
        for build_id in build_ids:
            # Main application bundle
            main_js = BundleAsset(
                id=str(uuid.uuid4()),
                build_id=build_id,
                asset_name=f"main.{uuid.uuid4().hex[:8]}.js",
                asset_type='js',
                file_size=random.randint(200000, 800000),  # 200KB - 800KB
                gzip_size=random.randint(80000, 300000),   # Compressed
                chunks=['main', 'vendor'],
                modules=[f"module_{i}" for i in range(50, 150)],
                is_entry=True,
                is_initial=True,
                optimization_score=random.uniform(3.0, 8.0)
            )
            assets.append(main_js)
            
            # Vendor bundle
            vendor_js = BundleAsset(
                id=str(uuid.uuid4()),
                build_id=build_id,
                asset_name=f"vendor.{uuid.uuid4().hex[:8]}.js",
                asset_type='js',
                file_size=random.randint(500000, 1200000),  # 500KB - 1.2MB
                gzip_size=random.randint(200000, 500000),
                chunks=['vendor'],
                modules=[f"node_modules/{lib}" for lib in ['react', 'lodash', 'axios', 'moment']],
                is_entry=False,
                is_initial=True,
                optimization_score=random.uniform(4.0, 7.0)
            )
            assets.append(vendor_js)
            
            # CSS bundle
            main_css = BundleAsset(
                id=str(uuid.uuid4()),
                build_id=build_id,
                asset_name=f"main.{uuid.uuid4().hex[:8]}.css",
                asset_type='css',
                file_size=random.randint(50000, 200000),  # 50KB - 200KB
                gzip_size=random.randint(20000, 80000),
                chunks=['main'],
                modules=[f"styles/{i}.css" for i in range(10, 30)],
                is_entry=False,
                is_initial=True,
                optimization_score=random.uniform(5.0, 9.0)
            )
            assets.append(main_css)
            
            # Additional chunks
            for i in range(3, 8):  # 3-7 additional chunks
                chunk_asset = BundleAsset(
                    id=str(uuid.uuid4()),
                    build_id=build_id,
                    asset_name=f"chunk.{i}.{uuid.uuid4().hex[:8]}.js",
                    asset_type='js',
                    file_size=random.randint(10000, 100000),  # 10KB - 100KB
                    gzip_size=random.randint(5000, 40000),
                    chunks=[f"chunk_{i}"],
                    modules=[f"lazy_module_{j}" for j in range(5, 15)],
                    is_entry=False,
                    is_initial=False,
                    optimization_score=random.uniform(6.0, 9.0)
                )
                assets.append(chunk_asset)
        
        self.db.add_all(assets)
        self.db.commit()
        print(f"    ✓ Created {len(assets)} bundle assets")
    
    def seed_asset_optimizations(self):
        """Seed asset optimization recommendations"""
        print("  ⚡ Seeding asset optimizations...")
        
        assets = self.db.query(BundleAsset).all()
        
        optimization_types = ['code_splitting', 'tree_shaking', 'compression', 'lazy_loading', 'asset_optimization']
        priorities = ['high', 'medium', 'low']
        efforts = ['low', 'medium', 'high']
        statuses = ['pending', 'in_progress', 'implemented', 'dismissed']
        
        optimizations = []
        for asset in assets:
            if random.random() < 0.4:  # 40% of assets have optimization suggestions
                optimization = AssetOptimization(
                    id=str(uuid.uuid4()),
                    asset_id=asset.id,
                    optimization_type=random.choice(optimization_types),
                    priority=random.choice(priorities),
                    title=f"Optimize {asset.asset_name}",
                    description=f"Reduce bundle size for {asset.asset_type} asset",
                    impact_description=f"Reduce load time by {random.randint(10, 40)}%",
                    effort_level=random.choice(efforts),
                    estimated_savings=random.randint(10000, asset.file_size // 2),
                    implementation_steps=[
                        "Analyze bundle composition",
                        "Implement optimization strategy",
                        "Test performance impact",
                        "Deploy optimized bundle"
                    ],
                    status=random.choice(statuses)
                )
                optimizations.append(optimization)
        
        self.db.add_all(optimizations)
        self.db.commit()
        print(f"    ✓ Created {len(optimizations)} asset optimizations")
    
    def seed_performance_metrics(self):
        """Seed performance metrics"""
        print("  📈 Seeding performance metrics...")
        
        metric_names = [
            'response_time', 'throughput', 'error_rate', 'cpu_usage',
            'memory_usage', 'disk_io', 'network_io', 'cache_hit_rate'
        ]
        
        categories = ['frontend', 'backend', 'database', 'infrastructure']
        components = ['api_server', 'web_server', 'database', 'cache', 'cdn']
        statuses = ['good', 'warning', 'critical']
        
        metrics = []
        for i in range(1000):  # 1000 metrics over last 24 hours
            timestamp = datetime.utcnow() - timedelta(
                hours=random.randint(0, 24),
                minutes=random.randint(0, 59)
            )
            
            metric_name = random.choice(metric_names)
            
            # Generate realistic values based on metric type
            if metric_name == 'response_time':
                value = random.uniform(50, 2000)  # 50ms - 2s
                unit = 'ms'
                warning_threshold = 500
                critical_threshold = 1000
            elif metric_name == 'throughput':
                value = random.uniform(100, 5000)  # 100-5000 req/s
                unit = 'req/s'
                warning_threshold = 1000
                critical_threshold = 500
            elif metric_name == 'error_rate':
                value = random.uniform(0, 10)  # 0-10%
                unit = '%'
                warning_threshold = 2
                critical_threshold = 5
            elif 'usage' in metric_name:
                value = random.uniform(10, 95)  # 10-95%
                unit = '%'
                warning_threshold = 70
                critical_threshold = 85
            else:
                value = random.uniform(0, 100)
                unit = 'units'
                warning_threshold = 70
                critical_threshold = 85
            
            # Determine status
            if value >= critical_threshold:
                status = 'critical'
            elif value >= warning_threshold:
                status = 'warning'
            else:
                status = 'good'
            
            metric = PerformanceMetric(
                id=str(uuid.uuid4()),
                metric_name=metric_name,
                metric_value=value,
                metric_unit=unit,
                category=random.choice(categories),
                component=random.choice(components),
                status=status,
                threshold_warning=warning_threshold,
                threshold_critical=critical_threshold,
                timestamp=timestamp
            )
            metrics.append(metric)
        
        self.db.add_all(metrics)
        self.db.commit()
        print(f"    ✓ Created {len(metrics)} performance metrics")
    
    def seed_performance_alerts(self):
        """Seed performance alerts"""
        print("  🚨 Seeding performance alerts...")
        
        alert_types = ['performance', 'error', 'resource', 'security']
        severities = ['low', 'medium', 'high', 'critical']
        components = ['api_server', 'web_server', 'database', 'cache', 'cdn']
        
        alerts = []
        for i in range(50):  # 50 alerts over last 7 days
            created_at = datetime.utcnow() - timedelta(
                days=random.randint(0, 7),
                hours=random.randint(0, 23)
            )
            
            alert_type = random.choice(alert_types)
            severity = random.choice(severities)
            component = random.choice(components)
            
            # Generate realistic alert data
            if alert_type == 'performance':
                title = f"High response time detected on {component}"
                description = f"Response time exceeded threshold on {component}"
                metric_name = 'response_time'
                metric_value = random.uniform(1000, 5000)
                threshold_value = 1000
            elif alert_type == 'error':
                title = f"Error rate spike on {component}"
                description = f"Error rate increased significantly on {component}"
                metric_name = 'error_rate'
                metric_value = random.uniform(5, 20)
                threshold_value = 5
            elif alert_type == 'resource':
                title = f"High resource usage on {component}"
                description = f"CPU/Memory usage exceeded threshold on {component}"
                metric_name = 'cpu_usage'
                metric_value = random.uniform(85, 100)
                threshold_value = 85
            else:  # security
                title = f"Security event detected on {component}"
                description = f"Suspicious activity detected on {component}"
                metric_name = None
                metric_value = None
                threshold_value = None
            
            resolved = random.random() < 0.6  # 60% resolved
            resolved_at = created_at + timedelta(hours=random.randint(1, 48)) if resolved else None
            
            alert = PerformanceAlert(
                id=str(uuid.uuid4()),
                alert_type=alert_type,
                severity=severity,
                title=title,
                description=description,
                component=component,
                metric_name=metric_name,
                metric_value=metric_value,
                threshold_value=threshold_value,
                resolved=resolved,
                resolved_at=resolved_at,
                resolved_by=f"user_{random.randint(1, 10)}" if resolved else None,
                actions_taken=[
                    "Investigated root cause",
                    "Applied temporary fix",
                    "Monitored for recurrence"
                ] if resolved else None,
                created_at=created_at
            )
            alerts.append(alert)
        
        self.db.add_all(alerts)
        self.db.commit()
        print(f"    ✓ Created {len(alerts)} performance alerts")
    
    def seed_system_health(self):
        """Seed system health metrics"""
        print("  💚 Seeding system health...")
        
        server_ids = ['web-01', 'web-02', 'api-01', 'api-02', 'db-01', 'cache-01']
        
        health_records = []
        for i in range(1440):  # 24 hours of minute-by-minute data
            timestamp = datetime.utcnow() - timedelta(minutes=i)
            
            for server_id in server_ids:
                # Generate realistic system metrics
                base_cpu = random.uniform(20, 80)
                base_memory = random.uniform(40, 85)
                base_disk = random.uniform(15, 60)
                
                # Add some correlation and patterns
                if 'db' in server_id:
                    base_cpu += random.uniform(0, 20)  # DB servers work harder
                    base_memory += random.uniform(0, 15)
                
                if 'api' in server_id:
                    base_cpu += random.uniform(-10, 15)  # API servers vary more
                
                health = SystemHealth(
                    id=str(uuid.uuid4()),
                    server_id=server_id,
                    cpu_usage=min(95, max(5, base_cpu + random.uniform(-5, 5))),
                    memory_usage=min(95, max(10, base_memory + random.uniform(-5, 5))),
                    disk_usage=min(95, max(5, base_disk + random.uniform(-2, 2))),
                    network_io=random.uniform(1, 50),  # MB/s
                    active_connections=random.randint(50, 500),
                    response_time=random.uniform(50, 500),  # ms
                    error_rate=random.uniform(0, 2),  # %
                    uptime=random.uniform(99.5, 100),  # %
                    timestamp=timestamp
                )
                health_records.append(health)
        
        self.db.add_all(health_records)
        self.db.commit()
        print(f"    ✓ Created {len(health_records)} system health records")


def seed_performance_data(db: Session):
    """Main function to seed all performance data"""
    seeder = PerformanceSeeder(db)
    seeder.seed_all()


if __name__ == "__main__":
    from app.database import SessionLocal
    
    db = SessionLocal()
    try:
        seed_performance_data(db)
    finally:
        db.close()