"""Basic integration test to verify CI/CD test discovery"""

def test_basic_integration():
    """Basic integration test that should always pass"""
    assert True

def test_app_integration():
    """Test that we can import and initialize the app for integration testing"""
    try:
        from app.main import app
        assert app is not None
        assert app.title == "Digame API"
    except ImportError:
        assert False, "Could not import app for integration testing"