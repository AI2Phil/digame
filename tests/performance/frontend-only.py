"""
Frontend-only Locust performance testing configuration.
Tests the Next.js frontend application without requiring backend services.
Ideal for Core Web Vitals validation during frontend development.
"""

from locust import HttpUser, task, between
import random


class FrontendUser(HttpUser):
    """
    Simulates users interacting with the frontend application only.
    Tests static pages, client-side routing, and frontend performance optimizations.
    """
    
    wait_time = between(1, 3)
    
    @task(20)
    def view_homepage(self):
        """Test homepage loading - critical for LCP optimization."""
        with self.client.get("/", catch_response=True) as response:
            if response.status_code == 200:
                # Check for Next.js application
                if "<!DOCTYPE html>" in response.text and "_next" in response.text:
                    response.success()
                else:
                    response.failure("Homepage did not return valid Next.js HTML")
            else:
                response.failure(f"Homepage failed with status {response.status_code}")
    
    @task(15)
    def view_dashboard(self):
        """Test dashboard page - client-side routing and dynamic content."""
        self.client.get("/dashboard")
    
    @task(10)
    def view_profile(self):
        """Test profile page - image optimization and lazy loading."""
        self.client.get("/profile")
    
    @task(8)
    def view_analytics(self):
        """Test analytics page - heavy with charts and data visualization."""
        self.client.get("/analytics")
    
    @task(6)
    def view_team(self):
        """Test team collaboration page."""
        self.client.get("/team")
    
    @task(5)
    def view_security(self):
        """Test security settings page."""
        self.client.get("/security")
    
    @task(4)
    def view_platform_owner(self):
        """Test platform owner pages."""
        self.client.get("/platform-owner")
    
    @task(3)
    def view_onboarding(self):
        """Test onboarding flow."""
        self.client.get("/onboarding")
    
    @task(2)
    def view_settings(self):
        """Test settings page."""
        self.client.get("/settings")
    
    @task(10)
    def static_assets(self):
        """Test static asset loading - validates optimization and caching."""
        assets = [
            "/favicon.ico",
            "/manifest.json",
            "/icons/icon-192x192.png",
            "/icons/icon-512x512.png",
            "/sw.js"  # Service worker
        ]
        
        asset = random.choice(assets)
        with self.client.get(asset, catch_response=True) as response:
            if response.status_code == 200 or response.status_code == 404:
                # Accept 404 for optional assets
                response.success()
            else:
                response.failure(f"Asset {asset} failed with status {response.status_code}")
    
    @task(5)
    def next_js_assets(self):
        """Test Next.js specific assets and API routes."""
        next_routes = [
            "/_next/static/chunks/pages/index.js",
            "/_next/static/chunks/main.js",
            "/_next/static/css/app.css",
            "/api/health",  # Frontend API route
            "/api/analytics/web-vitals"  # Web Vitals endpoint
        ]
        
        route = random.choice(next_routes)
        with self.client.get(route, catch_response=True) as response:
            # Accept various status codes for different asset types
            if response.status_code in [200, 404, 405]:
                response.success()
            else:
                response.failure(f"Next.js route {route} failed with status {response.status_code}")


class MobileFrontendUser(HttpUser):
    """
    Simulates mobile users testing frontend performance.
    Tests mobile-specific optimizations and responsive design.
    """
    
    wait_time = between(2, 5)  # Slower mobile connections
    
    def on_start(self):
        """Set mobile user agent."""
        self.client.headers.update({
            "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.2 Mobile/15E148 Safari/604.1"
        })
    
    @task(20)
    def mobile_homepage(self):
        """Test mobile homepage experience."""
        with self.client.get("/", catch_response=True) as response:
            if response.status_code == 200:
                # Check for responsive design indicators
                if "viewport" in response.text.lower():
                    response.success()
                else:
                    response.failure("Mobile viewport not configured")
    
    @task(15)
    def mobile_dashboard(self):
        """Test mobile dashboard."""
        self.client.get("/dashboard")
    
    @task(10)
    def mobile_profile(self):
        """Test mobile profile page."""
        self.client.get("/profile")
    
    @task(5)
    def mobile_navigation(self):
        """Test mobile navigation patterns."""
        pages = ["/team", "/analytics", "/settings"]
        page = random.choice(pages)
        self.client.get(page)


class PerformanceFrontendUser(HttpUser):
    """
    Focused performance testing for Core Web Vitals validation.
    Tests frontend-specific performance optimizations.
    """
    
    wait_time = between(0.5, 1.5)
    
    @task(25)
    def test_lcp_optimization(self):
        """Test Largest Contentful Paint optimization."""
        with self.client.get("/", catch_response=True) as response:
            if response.status_code == 200:
                # Measure response time as proxy for LCP
                response_time = response.elapsed.total_seconds()
                if response_time < 2.0:
                    response.success()
                elif response_time < 4.0:
                    # Mark as success but log for improvement
                    response.success()
                    print(f"LCP needs improvement: {response_time:.2f}s")
                else:
                    response.failure(f"LCP too slow: {response_time:.2f}s")
    
    @task(20)
    def test_fcp_optimization(self):
        """Test First Contentful Paint optimization."""
        with self.client.get("/dashboard", catch_response=True) as response:
            if response.status_code == 200:
                response_time = response.elapsed.total_seconds()
                if response_time < 1.8:
                    response.success()
                else:
                    response.failure(f"FCP too slow: {response_time:.2f}s")
    
    @task(15)
    def test_static_asset_caching(self):
        """Test static asset caching and optimization."""
        with self.client.get("/favicon.ico", catch_response=True) as response:
            if response.status_code == 200:
                # Check for caching headers
                cache_control = response.headers.get('cache-control', '')
                if 'max-age' in cache_control or 'public' in cache_control:
                    response.success()
                else:
                    response.failure("Static assets not properly cached")
    
    @task(10)
    def test_service_worker(self):
        """Test service worker for PWA functionality."""
        with self.client.get("/sw.js", catch_response=True) as response:
            if response.status_code == 200:
                if "self.addEventListener" in response.text:
                    response.success()
                else:
                    response.failure("Service worker not properly configured")
            elif response.status_code == 404:
                # Service worker is optional
                response.success()
    
    @task(8)
    def test_manifest_json(self):
        """Test PWA manifest.json."""
        with self.client.get("/manifest.json", catch_response=True) as response:
            if response.status_code == 200:
                try:
                    import json
                    manifest = json.loads(response.text)
                    if "name" in manifest and "icons" in manifest:
                        response.success()
                    else:
                        response.failure("Invalid manifest.json structure")
                except json.JSONDecodeError:
                    response.failure("Invalid JSON in manifest.json")
            elif response.status_code == 404:
                response.failure("PWA manifest.json not found")


# Load distribution for frontend-only testing
class LightFrontendLoad(FrontendUser):
    """Light load scenario for frontend testing."""
    weight = 3


class MediumFrontendLoad(FrontendUser):
    """Medium load scenario for frontend testing."""
    weight = 2
    wait_time = between(0.5, 2)


class HeavyFrontendLoad(FrontendUser):
    """Heavy load scenario for frontend testing."""
    weight = 1
    wait_time = between(0.1, 1)


class MobileFrontendLoad(MobileFrontendUser):
    """Mobile user load for frontend testing."""
    weight = 2


class PerformanceFrontendLoad(PerformanceFrontendUser):
    """Performance-focused frontend testing."""
    weight = 1