"""Basic test to verify CI/CD test discovery"""

def test_basic_functionality():
    """Basic test that should always pass"""
    assert True

def test_import_app():
    """Test that we can import the app module"""
    try:
        import app
        assert True
    except ImportError:
        assert False, "Could not import app module"