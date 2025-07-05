#!/usr/bin/env python3
"""
API Key Testing Script for Digame Platform
Tests connectivity to external AI services (OpenAI, etc.)
"""

import os
import sys
import json
import asyncio
import aiohttp
from typing import Dict, Any, Optional

# Add the app directory to the Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from app.services.ai_integration_service import AIIntegrationService
from app.services.admin_config_service import AdminConfigService
from app.schemas.admin_config_schemas import ServiceName
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
# from app.models.base import Base  # Not needed for this test script

class APIKeyTester:
    def __init__(self):
        self.results = {}
        self.ai_service = AIIntegrationService()
        
    async def test_openai_api_key(self, api_key: Optional[str]) -> Dict[str, Any]:
        """Test OpenAI API key connectivity"""
        print("Testing OpenAI API key...")
        
        if not api_key:
            return {
                "service": "OpenAI",
                "status": "FAILED",
                "error": "No API key provided",
                "details": "API key is empty or None"
            }
        
        # Mask the API key for logging
        masked_key = api_key[:8] + "*" * (len(api_key) - 12) + api_key[-4:] if len(api_key) > 12 else "*" * len(api_key)
        print(f"  Using API key: {masked_key}")
        
        try:
            # Test with a simple completion request
            payload = {
                "model": "gpt-3.5-turbo",
                "messages": [
                    {"role": "user", "content": "Say 'API test successful' if you can read this."}
                ],
                "max_tokens": 10,
                "temperature": 0
            }
            
            response = await self.ai_service.make_request(
                api_key=api_key,
                base_url="https://api.openai.com/v1",
                endpoint="chat/completions",
                payload=payload
            )
            
            if response and "choices" in response:
                content = response["choices"][0]["message"]["content"]
                return {
                    "service": "OpenAI",
                    "status": "SUCCESS",
                    "response": content,
                    "model": response.get("model", "unknown"),
                    "usage": response.get("usage", {})
                }
            else:
                return {
                    "service": "OpenAI",
                    "status": "FAILED",
                    "error": "Unexpected response format",
                    "response": response
                }
                
        except Exception as e:
            return {
                "service": "OpenAI",
                "status": "FAILED",
                "error": str(e),
                "error_type": type(e).__name__
            }
    
    async def test_database_api_keys(self) -> Dict[str, Any]:
        """Test API keys stored in the database"""
        print("Testing API keys from database...")
        
        try:
            # This would require a database connection
            # For now, return a placeholder
            return {
                "database_keys": "NOT_IMPLEMENTED",
                "message": "Database API key testing requires database setup"
            }
        except Exception as e:
            return {
                "database_keys": "ERROR",
                "error": str(e)
            }
    
    def test_environment_variables(self) -> Dict[str, Any]:
        """Test environment variables for API configuration"""
        print("Checking environment variables...")
        
        env_vars = {
            "OPENAI_API_KEY": os.getenv("OPENAI_API_KEY"),
            "OPENAI_API_BASE_URL": os.getenv("OPENAI_API_BASE_URL", "https://api.openai.com/v1"),
            "OPENAI_MODEL_NAME": os.getenv("OPENAI_MODEL_NAME", "gpt-3.5-turbo"),
            "AI_MODEL_API_KEY": os.getenv("AI_MODEL_API_KEY"),
            "DATABASE_URL": os.getenv("DATABASE_URL"),
        }
        
        results = {}
        for key, value in env_vars.items():
            if value:
                if "key" in key.lower() or "secret" in key.lower():
                    # Mask sensitive values
                    masked = value[:4] + "*" * (len(value) - 8) + value[-4:] if len(value) > 8 else "*" * len(value)
                    results[key] = f"SET ({masked})"
                else:
                    results[key] = value
            else:
                results[key] = "NOT_SET"
        
        return results
    
    async def run_all_tests(self, openai_key: Optional[str] = None) -> Dict[str, Any]:
        """Run all API key tests"""
        print("=" * 60)
        print("DIGAME PLATFORM - API KEY TESTING")
        print("=" * 60)
        
        # Test environment variables
        env_results = self.test_environment_variables()
        
        # Test OpenAI API key
        test_key = openai_key or os.getenv("OPENAI_API_KEY") or os.getenv("AI_MODEL_API_KEY")
        openai_results = await self.test_openai_api_key(test_key)
        
        # Test database keys
        db_results = await self.test_database_api_keys()
        
        results = {
            "timestamp": asyncio.get_event_loop().time(),
            "environment_variables": env_results,
            "openai_test": openai_results,
            "database_test": db_results
        }
        
        return results
    
    def print_results(self, results: Dict[str, Any]):
        """Print formatted test results"""
        print("\n" + "=" * 60)
        print("TEST RESULTS")
        print("=" * 60)
        
        # Environment Variables
        print("\n1. ENVIRONMENT VARIABLES:")
        for key, value in results["environment_variables"].items():
            status = "✓" if value != "NOT_SET" else "✗"
            print(f"   {status} {key}: {value}")
        
        # OpenAI Test
        print("\n2. OPENAI API TEST:")
        openai = results["openai_test"]
        status_symbol = "✓" if openai["status"] == "SUCCESS" else "✗"
        print(f"   {status_symbol} Status: {openai['status']}")
        
        if openai["status"] == "SUCCESS":
            print(f"   ✓ Response: {openai.get('response', 'N/A')}")
            print(f"   ✓ Model: {openai.get('model', 'N/A')}")
            if 'usage' in openai:
                print(f"   ✓ Tokens used: {openai['usage']}")
        else:
            print(f"   ✗ Error: {openai.get('error', 'Unknown error')}")
        
        # Database Test
        print("\n3. DATABASE API KEYS:")
        db = results["database_test"]
        print(f"   Status: {db.get('database_keys', 'UNKNOWN')}")
        if 'message' in db:
            print(f"   Note: {db['message']}")
        
        print("\n" + "=" * 60)

async def main():
    """Main function to run API key tests"""
    import argparse
    
    parser = argparse.ArgumentParser(description="Test API keys for Digame platform")
    parser.add_argument("--openai-key", help="OpenAI API key to test")
    parser.add_argument("--output", help="Output file for results (JSON)")
    args = parser.parse_args()
    
    tester = APIKeyTester()
    results = await tester.run_all_tests(args.openai_key)
    
    # Print results to console
    tester.print_results(results)
    
    # Save to file if requested
    if args.output:
        with open(args.output, 'w') as f:
            json.dump(results, f, indent=2)
        print(f"\nResults saved to: {args.output}")
    
    # Return exit code based on OpenAI test
    if results["openai_test"]["status"] == "SUCCESS":
        print("\n✓ API key tests completed successfully!")
        return 0
    else:
        print("\n✗ API key tests failed!")
        return 1

if __name__ == "__main__":
    exit_code = asyncio.run(main())
    sys.exit(exit_code)