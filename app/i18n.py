import gettext
import os
from typing import Callable, Optional

from fastapi import Request
from fastapi.templating import Jinja2Templates

# Define the path to your locale directory
LOCALE_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'locales')

# Supported languages - could be loaded from config
SUPPORTED_LANGUAGES = ['en', 'es', 'ar']
DEFAULT_LANGUAGE = 'en'

# Thread-local storage for the current translator (optional, but can be useful)
# import threading
# _thread_locals = threading.local()

# Global cache for gettext translations
_translations_cache = {}

def get_translation_for_locale(locale: str) -> gettext.NullTranslations:
    """
    Loads and returns the gettext translations for a given locale.
    Caches translations to avoid reloading them on every request.
    """
    if locale in _translations_cache:
        return _translations_cache[locale]

    try:
        translation = gettext.translation(
            'messages',  # Domain, matches the .mo file name (messages.mo)
            localedir=LOCALE_DIR,
            languages=[locale]
        )
        _translations_cache[locale] = translation
        return translation
    except FileNotFoundError:
        # Fallback to NullTranslations if .mo file is not found for the locale
        # This will return the original msgid
        if DEFAULT_LANGUAGE not in _translations_cache:
            # Ensure default language (usually English) is tried if primary fails
            # Typically, English won't have a .mo file and will use NullTranslations
            _translations_cache[DEFAULT_LANGUAGE] = gettext.NullTranslations()
        _translations_cache[locale] = _translations_cache[DEFAULT_LANGUAGE]
        return _translations_cache[locale]


def get_locale_from_request(request: Request) -> str:
    """
    Determines the best locale from the request.
    Checks query parameter 'lang', then 'Accept-Language' header.
    """
    # 1. Check for 'lang' query parameter
    lang_query_param = request.query_params.get('lang')
    if lang_query_param and lang_query_param in SUPPORTED_LANGUAGES:
        return lang_query_param

    # 2. Check Accept-Language header
    accept_language = request.headers.get('accept-language')
    if accept_language:
        # Example: "fr-CH, fr;q=0.9, en;q=0.8, de;q=0.7, *;q=0.5"
        languages = [lang.split(';')[0].split('-')[0] for lang in accept_language.split(',')]
        for lang_code in languages:
            if lang_code in SUPPORTED_LANGUAGES:
                return lang_code
            # Check for generic language match if specific like 'en-US' was sent
            generic_lang_code = lang_code.split('-')[0]
            if generic_lang_code in SUPPORTED_LANGUAGES:
                return generic_lang_code


    return DEFAULT_LANGUAGE


class LocaleMiddleware:
    def __init__(self, app):
        self.app = app
    
    async def __call__(self, scope, receive, send):
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return
        
        # Create a request object to extract locale information
        from starlette.requests import Request
        request = Request(scope, receive)
        
        locale = get_locale_from_request(request)
        scope["state"] = getattr(scope, "state", {})
        scope["state"]["locale"] = locale
        
        # Store the translator function in scope state for easy access in endpoints
        translator = get_translation_for_locale(locale)
        scope["state"]["gettext"] = translator.gettext
        scope["state"]["ngettext"] = translator.ngettext
        
        await self.app(scope, receive, send)
        locale = get_locale_from_request(request)
        request.state.locale = locale

        # Store the translator function in request state for easy access in endpoints
        # This translator will use the determined locale for the current request
        translator = get_translation_for_locale(locale)
        request.state.gettext = translator.gettext
        request.state.ngettext = translator.ngettext
        # For pgettext, you might need a more complex setup if using it extensively,
        # or handle it directly with gettext.translation().dpgettext if needed.

        response = await call_next(request)
        return response

# Helper function to be used in your application code (e.g., routers)
def _(request: Request, text: str) -> str:
    """
    Translate text using the translator stored in request.state.
    """
    if hasattr(request.state, 'gettext'):
        return request.state.gettext(text)
    # Fallback if middleware hasn't run or gettext not set (should not happen in normal flow)
    return get_translation_for_locale(DEFAULT_LANGUAGE).gettext(text)

# You can also define ngettext_lazy, pgettext_lazy etc. if needed for models or other non-request contexts

# If you use Jinja2 templates and want to make _ available in them:
# This should be done where you initialize Jinja2Templates
# templates = Jinja2Templates(directory="templates")
# templates.env.globals['_'] = lambda text: _(current_request_object_if_available, text)
# This requires passing the request or locale-specific gettext function to the template context.

if __name__ == '__main__':
    # Basic test (requires dummy .mo files to be generated)
    # To test this standalone:
    # 1. mkdir -p digame/app/locales/en/LC_MESSAGES
    # 2. mkdir -p digame/app/locales/es/LC_MESSAGES
    # 3. Create dummy digame/app/locales/messages.pot:
    #    msgid "Hello"
    #    msgstr ""
    # 4. pybabel init -i digame/app/locales/messages.pot -d digame/app/locales -l en
    # 5. pybabel init -i digame/app/locales/messages.pot -d digame/app/locales -l es
    # 6. Edit es.po: msgstr "Hola" for "Hello"
    # 7. pybabel compile -d digame/app/locales

    # English (default, should use NullTranslations if no en.mo, or actual if present)
    translator_en = get_translation_for_locale('en')
    print(f"en: Hello -> {translator_en.gettext('Hello')}")

    # Spanish
    translator_es = get_translation_for_locale('es')
    print(f"es: Hello -> {translator_es.gettext('Hello')}") # Should be "Hola" if es.mo is set up

    # Arabic (will fallback to NullTranslations without ar.mo)
    translator_ar = get_translation_for_locale('ar')
    print(f"ar: Hello -> {translator_ar.gettext('Hello')}")

    # Test non-supported language
    translator_fr = get_translation_for_locale('fr') # Should fallback to default
    print(f"fr (fallback): Hello -> {translator_fr.gettext('Hello')}")

    class MockRequest:
        def __init__(self, headers, query_params=None):
            self.headers = headers
            self.query_params = query_params if query_params else {}
            self.state = type('state', (), {})() # Mock state object

    req_es_header = MockRequest(headers={'accept-language': 'es-ES,es;q=0.9,en;q=0.8'})
    print(f"Locale from es header: {get_locale_from_request(req_es_header)}")

    req_en_param = MockRequest(headers={}, query_params={'lang': 'en'})
    print(f"Locale from en param: {get_locale_from_request(req_en_param)}")

    req_ar_code = MockRequest(headers={'accept-language': 'ar-AE,ar;q=0.9'})
    print(f"Locale from ar header: {get_locale_from_request(req_ar_code)}")

    req_default = MockRequest(headers={'accept-language': 'fr-FR;q=0.9'})
    print(f"Locale from fr header (default): {get_locale_from_request(req_default)}")

    # Simulate middleware usage
    async def dummy_call_next(request):
        return "response"

    middleware = LocaleMiddleware()

    # Test with a request that should pick 'es'
    test_req_es = MockRequest(headers={'accept-language': 'es,en-US;q=0.7'})
    # await middleware(test_req_es, dummy_call_next) # Not easily awaitable outside async context
    # print(f"Request locale (es): {test_req_es.state.locale}")
    # print(f"Translated 'Hello' (es): {test_req_es.state.gettext('Hello')}")

    # Test with a request that should pick 'en' via query param
    # test_req_en_param = MockRequest(headers={}, query_params={'lang': 'en'})
    # await middleware(test_req_en_param, dummy_call_next)
    # print(f"Request locale (en param): {test_req_en_param.state.locale}")
    # print(f"Translated 'Hello' (en param): {test_req_en_param.state.gettext('Hello')}")

    print("To fully test, run with FastAPI and actual .mo files.")
