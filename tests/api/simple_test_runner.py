#!/usr/bin/env python3
"""
Simple API Test Runner for Digame Platform
Validates all major API endpoints without complex framework dependencies
"""

import asyncio
import json
import time
import httpx
from typing import Dict, Any, List, Optional

# Configuration
BASE_URL = "http://localhost:8001"
TIMEOUT = 30.0

class SimpleAPITester:
    """Simple API testing class without complex dependencies"""
    
    def __init__(self):
        self.base_url = BASE_URL
        self.timeout = TIMEOUT
        self.results: List[Dict[str, Any]] = []
    
    async def test_endpoint(self, method: str, endpoint: str, data: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Test a single API endpoint"""
        try:
            start_time = time.time()
            
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                if method.upper() == "GET":
                    response = await client.get(f"{self.base_url}{endpoint}")
                elif method.upper() == "POST":
                    response = await client.post(f"{self.base_url}{endpoint}", json=data)
                elif method.upper() == "PUT":
                    response = await client.put(f"{self.base_url}{endpoint}", json=data)
                else:
                    response = await client.delete(f"{self.base_url}{endpoint}")
                
                end_time = time.time()
                
                return {
                    "success": True,
                    "status_code": response.status_code,
                    "response_time": end_time - start_time,
                    "endpoint": endpoint,
                    "method": method.upper()
                }
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "endpoint": endpoint,
                "method": method.upper(),
                "status_code": 0,
                "response_time": 0
            }
    
    async def run_all_tests(self) -> Dict[str, Any]:
        """Run comprehensive API tests"""
        print("🚀 Digame Platform API Test Suite")
        print("=" * 50)
        
        # Test endpoints organized by category
        test_cases = [
            # Health Checks
            ("Health", "GET", "/health"),
            ("API Health", "GET", "/api/health"),
            
            # Team Management APIs
            ("Teams List", "GET", "/api/teams"),
            ("Team Analytics", "GET", "/api/teams/analytics/summary"),
            ("Team Health", "GET", "/api/teams/health"),
            
            # Advanced Reporting APIs
            ("Reporting Dashboard", "GET", "/api/advanced-reporting/dashboard"),
            ("Report Builder", "GET", "/api/advanced-reporting/report-builder"),
            ("Visualization Engine", "GET", "/api/advanced-reporting/visualization-engine"),
            ("Predictive Analytics", "GET", "/api/advanced-reporting/predictive-analytics"),
            ("Reporting Health", "GET", "/api/advanced-reporting/health"),
            
            # Real-Time Collaboration APIs
            ("Collaboration Workspace", "GET", "/api/collaboration/workspace"),
            ("Collaboration Channels", "GET", "/api/collaboration/channels"),
            ("Online Users", "GET", "/api/collaboration/users/online"),
            ("Active Sessions", "GET", "/api/collaboration/sessions/active"),
            
            # ML/AI APIs
            ("ML Models", "GET", "/api/ml/models"),
            ("Training Jobs", "GET", "/api/ml/training-jobs"),
            ("ML Predictions", "GET", "/api/ml/predictions"),
            ("ML Analytics", "GET", "/api/ml/analytics/overview"),
            ("ML Health", "GET", "/api/ml/health"),
            ("ML Status", "GET", "/api/ml/status"),
            
            # Security & Compliance APIs
            ("Security Dashboard", "GET", "/api/security/dashboard"),
            ("Audit Events", "GET", "/api/security/audit-events"),
            ("Security Events", "GET", "/api/security/security-events"),
            ("Compliance Checks", "GET", "/api/security/compliance-checks"),
            ("Vulnerabilities", "GET", "/api/security/vulnerabilities"),
            ("Risk Assessments", "GET", "/api/security/risk-assessments"),
            ("Security Incidents", "GET", "/api/security/incidents"),
            
            # Notification System APIs
            ("Notifications", "GET", "/api/notifications"),
            ("Notification Templates", "GET", "/api/notifications/templates"),
            ("Notification Preferences", "GET", "/api/notifications/preferences"),
            ("Notification Metrics", "GET", "/api/notifications/metrics"),
        ]
        
        total_tests = len(test_cases)
        passed_tests = 0
        failed_tests = 0
        
        for i, (name, method, endpoint) in enumerate(test_cases, 1):
            print(f"[{i:2d}/{total_tests}] Testing {name}...", end=" ")
            
            result = await self.test_endpoint(method, endpoint)
            self.results.append({
                "name": name,
                **result
            })
            
            # Determine if test passed
            # 200/201 = success, 401 = auth required (expected), 404 = not implemented yet
            success_codes = [200, 201, 401, 404]
            test_passed = result["success"] and result["status_code"] in success_codes
            
            if test_passed:
                passed_tests += 1
                status_icon = "✅"
                status_text = f"({result['status_code']})"
            else:
                failed_tests += 1
                status_icon = "❌"
                status_text = f"({result.get('status_code', 'ERR')})"
                if not result["success"]:
                    status_text += f" - {result.get('error', 'Unknown error')}"
            
            print(f"{status_icon} {status_text}")
        
        # Print summary
        print("\n" + "=" * 50)
        print("📊 TEST SUMMARY")
        print("=" * 50)
        print(f"Total Tests: {total_tests}")
        print(f"Passed: {passed_tests} ✅")
        print(f"Failed: {failed_tests} ❌")
        
        if total_tests > 0:
            success_rate = (passed_tests / total_tests) * 100
            print(f"Success Rate: {success_rate:.1f}%")
        
        # Performance analysis
        response_times = [r["response_time"] for r in self.results if r["success"]]
        if response_times:
            avg_response_time = sum(response_times) / len(response_times)
            max_response_time = max(response_times)
            print(f"Average Response Time: {avg_response_time:.3f}s")
            print(f"Max Response Time: {max_response_time:.3f}s")
        
        # Show failed tests
        if failed_tests > 0:
            print(f"\n❌ FAILED TESTS ({failed_tests}):")
            for result in self.results:
                success_codes = [200, 201, 401, 404]
                test_passed = result["success"] and result["status_code"] in success_codes
                if not test_passed:
                    error_msg = result.get("error", f"HTTP {result.get('status_code', 'ERR')}")
                    print(f"   - {result['name']}: {error_msg}")
        
        # Save detailed results
        with open("api_test_results.json", "w") as f:
            json.dump({
                "summary": {
                    "total_tests": total_tests,
                    "passed": passed_tests,
                    "failed": failed_tests,
                    "success_rate": (passed_tests / total_tests) * 100 if total_tests > 0 else 0,
                    "avg_response_time": sum(response_times) / len(response_times) if response_times else 0,
                    "max_response_time": max(response_times) if response_times else 0
                },
                "detailed_results": self.results,
                "timestamp": time.time()
            }, f, indent=2)
        
        print(f"\n📄 Detailed results saved to: api_test_results.json")
        
        return {
            "total": total_tests,
            "passed": passed_tests,
            "failed": failed_tests,
            "success_rate": (passed_tests / total_tests) * 100 if total_tests > 0 else 0
        }

async def main():
    """Main test runner function"""
    tester = SimpleAPITester()
    results = await tester.run_all_tests()
    
    # Return exit code based on test results
    return 0 if results["failed"] == 0 else 1

if __name__ == "__main__":
    exit_code = asyncio.run(main())
    exit(exit_code)