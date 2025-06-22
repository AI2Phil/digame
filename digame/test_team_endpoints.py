#!/usr/bin/env python3
"""
Simple test script to verify team collaboration API endpoints are working.
Run this after starting the FastAPI server.
"""

import requests
import json
import sys

BASE_URL = "http://localhost:8000"

def test_endpoint(method, endpoint, data=None, description=""):
    """Test a single API endpoint"""
    url = f"{BASE_URL}{endpoint}"
    
    print(f"\n🧪 Testing: {description}")
    print(f"   {method} {endpoint}")
    
    try:
        if method == "GET":
            response = requests.get(url)
        elif method == "POST":
            response = requests.post(url, json=data)
        elif method == "PUT":
            response = requests.put(url, json=data)
        elif method == "DELETE":
            response = requests.delete(url)
        
        print(f"   Status: {response.status_code}")
        
        if response.status_code < 400:
            print(f"   ✅ Success")
            if response.content:
                try:
                    result = response.json()
                    if isinstance(result, list):
                        print(f"   📊 Returned {len(result)} items")
                    elif isinstance(result, dict):
                        print(f"   📋 Returned: {list(result.keys())}")
                except:
                    print(f"   📄 Response length: {len(response.content)} bytes")
        else:
            print(f"   ❌ Error: {response.text}")
            
    except requests.exceptions.ConnectionError:
        print(f"   🔌 Connection Error: Server not running at {BASE_URL}")
        return False
    except Exception as e:
        print(f"   💥 Exception: {e}")
        return False
    
    return response.status_code < 400

def main():
    print("🚀 Testing Team Collaboration API Endpoints")
    print("=" * 50)
    
    # Test basic health check first
    if not test_endpoint("GET", "/health", description="Health Check"):
        print("\n❌ Server is not running. Please start the FastAPI server first:")
        print("   cd digame")
        print("   python -m uvicorn digame.app.main:app --reload")
        sys.exit(1)
    
    # Test team endpoints
    tests = [
        ("GET", "/api/teams", None, "List all teams"),
        ("GET", "/api/teams/1", None, "Get team by ID (may return 404 if no teams)"),
        ("GET", "/api/teams/1/members", None, "Get team members (may return 404)"),
        ("GET", "/api/teams/1/performance", None, "Get team performance metrics (may return 404)"),
        ("GET", "/api/teams/1/skill-gaps", None, "Get team skill gaps (may return 404)"),
        ("GET", "/api/teams/1/workflows", None, "Get team workflows (may return 404)"),
    ]
    
    success_count = 0
    total_tests = len(tests)
    
    for method, endpoint, data, description in tests:
        if test_endpoint(method, endpoint, data, description):
            success_count += 1
    
    print("\n" + "=" * 50)
    print(f"📊 Test Results: {success_count}/{total_tests} endpoints accessible")
    
    if success_count == total_tests:
        print("🎉 All team collaboration endpoints are working!")
    elif success_count > 0:
        print("⚠️  Some endpoints are working. This is normal if no teams exist yet.")
        print("   The 404 errors for specific team IDs are expected when no data exists.")
    else:
        print("❌ No endpoints are working. Check server configuration.")
    
    print("\n💡 Next steps:")
    print("   1. Start the frontend: cd digame/frontend && npm start")
    print("   2. Navigate to: http://localhost:3000/teams")
    print("   3. Create your first team to test full functionality")

if __name__ == "__main__":
    main()