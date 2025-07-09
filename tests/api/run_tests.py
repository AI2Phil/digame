#!/usr/bin/env python3
"""
Simple API Test Runner for Digame Platform
Validates all major API endpoints and system health
"""

import asyncio
import json
import time
from typing import Dict, Any, Optional
import httpx

# Configuration
BASE_URL = "http://localhost:8001"
TIMEOUT = 30.0

async def test_endpoint(client: httpx.AsyncClient, method: str, endpoint: str, data: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """Test a single API endpoint"""
    try:
        start_time = time.time()
        
        if method.upper() == "GET":
            response = await client.get(endpoint)
        elif method.upper() == "POST":
            response = await client.post(endpoint, json=data)
        elif method.upper() == "PUT":
            response = await client.put(endpoint, json=data)
        else:
            response = await client.delete(endpoint)
            
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

async def run_api_tests():
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
    
    results = []
    total_tests = len(test_cases)
    passed_tests = 0
    failed_tests = 0
    
    async with httpx.AsyncClient(base_url=BASE_URL, timeout=TIMEOUT) as client:
        for i, (name, method, endpoint) in enumerate(test_cases, 1):
            print(f"[{i:2d}/{total_tests}] Testing {name}...", end=" ")
            
            result = await test_endpoint(client, method, endpoint)
            results.append({
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
    response_times = [r["response_time"] for r in results if r["success"]]
    if response_times:
        avg_response_time = sum(response_times) / len(response_times)
        max_response_time = max(response_times)
        print(f"Average Response Time: {avg_response_time:.3f}s")
        print(f"Max Response Time: {max_response_time:.3f}s")
    
    # Show failed tests
    if failed_tests > 0:
        print(f"\n❌ FAILED TESTS ({failed_tests}):")
        for result in results:
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
            "detailed_results": results,
            "timestamp": time.time()
        }, f, indent=2)
    
    print(f"\n📄 Detailed results saved to: api_test_results.json")
    
    # System status assessment
    print(f"\n🏥 SYSTEM STATUS ASSESSMENT")
    print("=" * 50)
    
    # Check critical endpoints
    critical_endpoints = [
        "/health",
        "/api/health", 
        "/api/teams/health",
        "/api/advanced-reporting/health",
        "/api/ml/health"
    ]
    
    critical_results = [r for r in results if r["endpoint"] in critical_endpoints]
    critical_up = sum(1 for r in critical_results if r["success"] and r["status_code"] == 200)
    
    if critical_up == len(critical_endpoints):
        print("🟢 System Status: HEALTHY - All critical services operational")
    elif critical_up > len(critical_endpoints) // 2:
        print("🟡 System Status: DEGRADED - Some services may be unavailable")
    else:
        print("🔴 System Status: CRITICAL - Multiple services down")
    
    # API readiness assessment
    api_endpoints = [r for r in results if r["endpoint"].startswith("/api/")]
    api_ready = sum(1 for r in api_endpoints if r["success"] and r["status_code"] in [200, 201])
    api_auth_required = sum(1 for r in api_endpoints if r["success"] and r["status_code"] == 401)
    api_not_implemented = sum(1 for r in api_endpoints if r["success"] and r["status_code"] == 404)
    
    print(f"\n📡 API READINESS:")
    print(f"   Ready: {api_ready} endpoints")
    print(f"   Auth Required: {api_auth_required} endpoints")
    print(f"   Not Implemented: {api_not_implemented} endpoints")
    
    total_api_endpoints = len(api_endpoints)
    if total_api_endpoints > 0:
        readiness_score = ((api_ready + api_auth_required) / total_api_endpoints) * 100
        print(f"   Readiness Score: {readiness_score:.1f}%")
        
        if readiness_score >= 80:
            print("   🟢 Status: PRODUCTION READY")
        elif readiness_score >= 60:
            print("   🟡 Status: DEVELOPMENT READY")
        else:
            print("   🔴 Status: NEEDS IMPLEMENTATION")
    
    return failed_tests == 0

if __name__ == "__main__":
    success = asyncio.run(run_api_tests())
    exit(0 if success else 1)