import pytest
from fastapi.testclient import TestClient
from ..main import app # Assuming app is importable from main

# It's good practice to ensure that the test environment can find the .mo files.
# Usually, this is handled if the tests are run from a context where LOCALE_DIR is correct.
# For this test, we assume that the .mo files generated in step 4 are accessible.

client = TestClient(app)

def test_root_path_default_english():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    # Assuming "Welcome to the Digame API (EN)" is the translation for 'en'
    # and 'en' is the default if no header is sent or header is not recognized.
    assert data["message"] == "Welcome to the Digame API (EN)"

def test_root_path_accept_language_en():
    response = client.get("/", headers={"Accept-Language": "en-US,en;q=0.9"})
    assert response.status_code == 200
    data = response.json()
    assert data["message"] == "Welcome to the Digame API (EN)"

def test_root_path_accept_language_es():
    response = client.get("/", headers={"Accept-Language": "es-ES,es;q=0.9"})
    assert response.status_code == 200
    data = response.json()
    assert data["message"] == "Bienvenido a la API de Digame (ES)"

def test_root_path_accept_language_ar():
    response = client.get("/", headers={"Accept-Language": "ar-AE,ar;q=0.9"})
    assert response.status_code == 200
    data = response.json()
    assert data["message"] == "أهلاً بكم في واجهة برمجة تطبيقات Digame (AR)"

def test_root_path_query_param_es():
    response = client.get("/?lang=es", headers={"Accept-Language": "en-US,en;q=0.9"}) # Header says EN, param says ES
    assert response.status_code == 200
    data = response.json()
    # Query parameter should override the header
    assert data["message"] == "Bienvenido a la API de Digame (ES)"

def test_root_path_query_param_ar_no_header():
    response = client.get("/?lang=ar")
    assert response.status_code == 200
    data = response.json()
    assert data["message"] == "أهلاً بكم في واجهة برمجة تطبيقات Digame (AR)"

def test_root_path_unsupported_language_fallback_to_default():
    response = client.get("/", headers={"Accept-Language": "fr-FR,fr;q=0.9"})
    assert response.status_code == 200
    data = response.json()
    # Should fallback to 'en' (default)
    assert data["message"] == "Welcome to the Digame API (EN)"

def test_root_path_unsupported_query_param_fallback_to_default():
    response = client.get("/?lang=fr", headers={"Accept-Language": "es-ES,es;q=0.9"}) # Header ES, param FR (unsupported)
    assert response.status_code == 200
    data = response.json()
    # Query param is unsupported, so it should use header (es)
    # Actually, my i18n.py logic for get_locale_from_request is:
    # 1. Query param (if valid)
    # 2. Header (if valid)
    # 3. Default
    # So, if lang=fr (invalid), it falls through to Accept-Language: es.
    assert data["message"] == "Bienvenido a la API de Digame (ES)"

def test_root_path_unsupported_query_param_and_header_fallback_to_default():
    response = client.get("/?lang=fr", headers={"Accept-Language": "de-DE,de;q=0.9"})
    assert response.status_code == 200
    data = response.json()
    # Query param and header both unsupported, should fallback to 'en' (default)
    assert data["message"] == "Welcome to the Digame API (EN)"

# To run these tests:
# Ensure pytest and fastapi[all] (including uvicorn, python-multipart) are installed.
# From the root of the 'digame' project (i.e., /app/digame), run:
# PYTHONPATH=. pytest app/tests/test_i18n.py
# The PYTHONPATH=. is important so that `from ..main import app` works.
# Alternatively, structure your project as a package and install it in editable mode.
