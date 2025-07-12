"""
Locust performance testing configuration for Digame application.
This file defines load testing scenarios for Core Web Vitals optimization validation.
"""

from locust import HttpUser, task, between
import random
import json


class DigameUser(HttpUser):
    """
    Simulates a typical user interacting with the Digame platform.
    Tests various endpoints to validate Core Web Vitals performance optimizations.
    """
    
    wait_time = between(1, 3)  # Wait 1-3 seconds between requests
    
    def on_start(self):
        """Called when a user starts. Simulates user login."""
        # Simulate user authentication
        self.login()
    
    def login(self):
        """Simulate user login process."""
        login_data = {
            "email": f"test_user_{random.randint(1, 1000)}@example.com",
            "password": "test_password"
        }
        
        with self.client.post("/api/auth/login", json=login_data, catch_response=True) as response:
            if response.status_code == 200 or response.status_code == 401:
                # Accept both success and auth failure for load testing
                response.success()
            else:
                response.failure(f"Login failed with status {response.status_code}")
    
    @task(10)
    def view_homepage(self):
        """Test homepage loading - critical for LCP optimization."""
        with self.client.get("/", catch_response=True) as response:
            if response.status_code == 200:
                # Check for critical performance indicators
                if "<!DOCTYPE html>" in response.text:
                    response.success()
                else:
                    response.failure("Homepage did not return valid HTML")
            else:
                response.failure(f"Homepage failed with status {response.status_code}")
    
    @task(8)
    def view_dashboard(self):
        """Test dashboard loading - tests dynamic content and CLS prevention."""
        self.client.get("/dashboard")
    
    @task(6)
    def view_profile(self):
        """Test profile page - tests image optimization and lazy loading."""
        self.client.get("/profile")
    
    @task(5)
    def api_user_data(self):
        """Test API endpoints - validates TTFB optimization."""
        self.client.get("/api/user/profile")
    
    @task(4)
    def view_analytics(self):
        """Test analytics page - heavy with charts and data visualization."""
        self.client.get("/analytics")
    
    @task(3)
    def view_team_collaboration(self):
        """Test team collaboration features."""
        self.client.get("/team")
    
    @task(3)
    def api_analytics_data(self):
        """Test analytics API endpoints."""
        self.client.get("/api/analytics/overview")
    
    @task(2)
    def view_security_settings(self):
        """Test security settings page."""
        self.client.get("/security")
    
    @task(2)
    def api_web_vitals(self):
        """Test Web Vitals reporting endpoint."""
        vitals_data = {
            "name": "LCP",
            "value": random.uniform(1000, 3000),
            "id": f"test-{random.randint(1000, 9999)}",
            "delta": random.uniform(100, 500),
            "rating": random.choice(["good", "needs-improvement", "poor"]),
            "timestamp": 1641234567890,
            "url": "http://localhost:3000/test"
        }
        
        self.client.post("/api/analytics/web-vitals", json=vitals_data)
    
    @task(1)
    def view_platform_owner(self):
        """Test platform owner pages - admin functionality."""
        self.client.get("/platform-owner")
    
    @task(1)
    def static_assets(self):
        """Test static asset loading - validates CDN and caching."""
        assets = [
            "/favicon.ico",
            "/manifest.json",
            "/icons/icon-192x192.png",
            "/_next/static/css/app.css",
            "/_next/static/js/app.js"
        ]
        
        asset = random.choice(assets)
        self.client.get(asset)


class MobileUser(HttpUser):
    """
    Simulates mobile users with slower connections.
    Tests mobile-specific optimizations and responsive design.
    """
    
    wait_time = between(2, 5)  # Slower mobile users
    
    def on_start(self):
        """Set mobile user agent."""
        self.client.headers.update({
            "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15"
        })
    
    @task(15)
    def mobile_homepage(self):
        """Test mobile homepage experience."""
        self.client.get("/")
    
    @task(10)
    def mobile_dashboard(self):
        """Test mobile dashboard with touch interactions."""
        self.client.get("/dashboard")
    
    @task(5)
    def mobile_profile(self):
        """Test mobile profile page."""
        self.client.get("/profile")
    
    @task(3)
    def mobile_api_calls(self):
        """Test API calls from mobile."""
        self.client.get("/api/user/profile")


class PerformanceTestUser(HttpUser):
    """
    Focused performance testing user for Core Web Vitals validation.
    """
    
    wait_time = between(0.5, 1.5)  # Faster requests for performance testing
    
    @task(20)
    def test_lcp_optimization(self):
        """Test Largest Contentful Paint optimization."""
        with self.client.get("/", catch_response=True) as response:
            if response.status_code == 200:
                # Measure response time as proxy for LCP
                if response.elapsed.total_seconds() < 2.0:
                    response.success()
                else:
                    response.failure(f"LCP too slow: {response.elapsed.total_seconds()}s")
    
    @task(15)
    def test_fcp_optimization(self):
        """Test First Contentful Paint optimization."""
        self.client.get("/dashboard")
    
    @task(10)
    def test_ttfb_optimization(self):
        """Test Time to First Byte optimization."""
        with self.client.get("/api/user/profile", catch_response=True) as response:
            if response.status_code == 200:
                # Check TTFB
                if response.elapsed.total_seconds() < 0.5:
                    response.success()
                else:
                    response.failure(f"TTFB too slow: {response.elapsed.total_seconds()}s")
    
    @task(8)
    def test_image_optimization(self):
        """Test image loading and optimization."""
        self.client.get("/profile")
    
    @task(5)
    def test_js_optimization(self):
        """Test JavaScript bundle optimization."""
        self.client.get("/analytics")


# Performance test scenarios
class LightLoad(DigameUser):
    """Light load scenario - normal usage."""
    weight = 3


class MediumLoad(DigameUser):
    """Medium load scenario - busy periods."""
    weight = 2
    wait_time = between(0.5, 2)


class HeavyLoad(DigameUser):
    """Heavy load scenario - peak usage."""
    weight = 1
    wait_time = between(0.1, 1)


class MobileLoad(MobileUser):
    """Mobile user load."""
    weight = 2


class PerformanceLoad(PerformanceTestUser):
    """Performance-focused load testing."""
    weight = 1