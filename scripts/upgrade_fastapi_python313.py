#!/usr/bin/env python3
"""
FastAPI/Python 3.13 compatibility upgrade script.
This script upgrades dependencies and tests the compatibility fix.
"""

import subprocess
import sys
import os
from pathlib import Path

def run_command(cmd, description):
    """Run a command and handle errors."""
    print(f"\n🔧 {description}")
    print(f"Running: {cmd}")
    
    try:
        result = subprocess.run(cmd, shell=True, check=True, capture_output=True, text=True)
        print(f"✅ Success: {description}")
        if result.stdout:
            print(f"Output: {result.stdout}")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed: {description}")
        print(f"Error: {e.stderr}")
        return False

def main():
    """Main upgrade process."""
    print("🚀 Starting FastAPI/Python 3.13 compatibility upgrade...")
    
    # Change to project root
    project_root = Path(__file__).parent.parent
    os.chdir(project_root)
    
    # Step 1: Backup current requirements
    print("\n📋 Step 1: Backing up current requirements...")
    if os.path.exists("requirements.txt"):
        run_command("cp requirements.txt requirements.txt.backup", "Backup requirements.txt")
    
    # Step 2: Install updated dependencies
    print("\n📦 Step 2: Installing updated dependencies...")
    success = run_command("pip install -r requirements.txt", "Install updated dependencies")
    
    if not success:
        print("\n⚠️  Dependency installation failed. Trying individual packages...")
        
        # Try installing key packages individually
        key_packages = [
            "fastapi==0.104.1",
            "uvicorn[standard]==0.24.0", 
            "pydantic==2.5.0",
            "SQLAlchemy==2.0.23"
        ]
        
        for package in key_packages:
            run_command(f"pip install {package}", f"Install {package}")
    
    # Step 3: Test basic imports
    print("\n🧪 Step 3: Testing basic imports...")
    
    test_imports = [
        "import fastapi",
        "import pydantic", 
        "import sqlalchemy",
        "from fastapi import FastAPI",
        "from pydantic import BaseModel"
    ]
    
    for import_stmt in test_imports:
        try:
            exec(import_stmt)
            print(f"✅ {import_stmt}")
        except Exception as e:
            print(f"❌ {import_stmt}: {e}")
    
    # Step 4: Test FastAPI app creation
    print("\n🌐 Step 4: Testing FastAPI app creation...")
    
    try:
        from fastapi import FastAPI
        from pydantic import BaseModel
        
        app = FastAPI()
        
        class TestModel(BaseModel):
            name: str
            value: int
        
        @app.get("/test")
        def test_endpoint():
            return {"status": "ok", "message": "FastAPI working with Python 3.13"}
        
        print("✅ FastAPI app creation successful")
        
    except Exception as e:
        print(f"❌ FastAPI app creation failed: {e}")
    
    # Step 5: Test Pydantic models
    print("\n📝 Step 5: Testing Pydantic models...")
    
    try:
        from pydantic import BaseModel, Field
        
        class TestPydanticModel(BaseModel):
            name: str = Field(..., description="Test name")
            count: int = Field(default=0)
            
            model_config = {"from_attributes": True}
        
        # Test model creation
        test_instance = TestPydanticModel(name="test", count=5)
        print(f"✅ Pydantic model creation successful: {test_instance}")
        
        # Test dict conversion
        model_dict = test_instance.model_dump()
        print(f"✅ Pydantic dict conversion successful: {model_dict}")
        
    except Exception as e:
        print(f"❌ Pydantic model test failed: {e}")
    
    # Step 6: Summary
    print("\n📊 Upgrade Summary:")
    print("=" * 50)
    
    # Check Python version
    python_version = f"{sys.version_info.major}.{sys.version_info.minor}.{sys.version_info.micro}"
    print(f"Python Version: {python_version}")
    
    # Check package versions
    try:
        import fastapi
        print(f"FastAPI Version: {fastapi.__version__}")
    except:
        print("FastAPI: Not available")
    
    try:
        import pydantic
        print(f"Pydantic Version: {pydantic.VERSION}")
    except:
        print("Pydantic: Not available")
    
    try:
        import sqlalchemy
        print(f"SQLAlchemy Version: {sqlalchemy.__version__}")
    except:
        print("SQLAlchemy: Not available")
    
    print("\n🎉 FastAPI/Python 3.13 compatibility upgrade completed!")
    print("\nNext steps:")
    print("1. Test your dashboard services")
    print("2. Run your test suite")
    print("3. Check for any remaining compatibility issues")

if __name__ == "__main__":
    main()