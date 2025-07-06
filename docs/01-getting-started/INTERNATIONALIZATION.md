# Internationalization (i18n) and Localization (l10n) Guide

This document outlines how to manage multi-language support in the Digame application, covering both the FastAPI backend and the Next.js/React frontend.

## Backend (FastAPI)

The backend uses `Babel` and `python-gettext` for internationalization.

### 1. Marking Strings for Translation

In Python code, use the `_()` function (imported from `digame.app.i18n`) for strings that need translation. Due to current limitations with Babel's ability to extract strings from functions with complex signatures like our `_(request, text)`, we use a two-step process for marking and translating:

```python
from digame.app.i18n import _, _extract # _extract is for marking, _ is for runtime

# Example in an endpoint
async def some_endpoint(request: Request):
    message_id = _extract("This is a translatable string.") # Mark for extraction
    translated_message = _(request, message_id) # Translate at runtime
    return {"detail": translated_message}
```

Ensure `_extract` (or any other marker function you choose) is added to the `keywords` list in `digame/babel.cfg`.

### 2. Extracting Translatable Strings

After adding or changing translatable strings:

1.  **Navigate to the `digame` directory**:
    ```bash
    cd path/to/your/project/digame
    ```
2.  **Run `pybabel extract`**:
    This command scans the specified source files (configured in `babel.cfg`) and creates/updates the `app/locales/messages.pot` template file.
    ```bash
    pybabel extract -F babel.cfg \
      --output-file=app/locales/messages.pot \
      --project="Digame" \
      --version="1.0" \
      --copyright-holder="Digame Team" \
      --msgid-bugs-address="support@example.com" \
      .
    ```
    *Note: `babel.cfg` has been configured to exclude certain directories like `app/routers/`, `app/services/`, etc., due to pre-existing syntax issues. If you make translatable changes in those areas, the syntax issues must be fixed first, or the `babel.cfg` updated to include them.*

### 3. Adding a New Language

Let's say you want to add French (`fr`):

1.  **Initialize the language catalog** (run from the `digame` directory):
    ```bash
    pybabel init -i app/locales/messages.pot -d app/locales -l fr
    ```
    This creates `app/locales/fr/LC_MESSAGES/messages.po`.

2.  **Translate the strings**: Edit the newly created `messages.po` file. For each `msgid`, provide the translation in `msgstr`.
    Example for French:
    ```po
    #: app/main.py:268
    msgid "Welcome to the Digame API"
    msgstr "Bienvenue à l'API Digame"
    ```

3.  **Update `SUPPORTED_LANGUAGES`**: Add the new language code to the `SUPPORTED_LANGUAGES` list in `digame/app/i18n.py`.

### 4. Updating Existing Translations

After extracting new strings (step 2):

1.  **Update existing `.po` files** (run from the `digame` directory):
    ```bash
    pybabel update -i app/locales/messages.pot -d app/locales --previous --no-fuzzy-matching
    ```
    This merges new strings into each language's `.po` file and marks changed strings as fuzzy if needed (though `--no-fuzzy-matching` disables this for exact matches). Review and update translations in each `.po` file.

### 5. Compiling Translations

After adding or updating translations in `.po` files:

1.  **Compile all catalogs** (run from the `digame` directory):
    ```bash
    pybabel compile -d app/locales --statistics
    ```
    This generates/updates the binary `.mo` files that are used by the application at runtime.

## Frontend (Next.js / `next-i18next`)

The frontend uses `next-i18next` (which uses `i18next` and `react-i18next`).

### 1. Configuration

*   `digame/frontend/next-i18next.config.js`: Main configuration for supported locales, default locale, etc.
*   `digame/frontend/next.config.js`: Includes the `i18n` config from `next-i18next.config.js`.
*   `digame/frontend/src/pages/_app.jsx`: Wrapped with `appWithTranslation`.
*   `digame/frontend/src/pages/_document.jsx`: Sets `lang` and `dir` attributes on the `<html>` tag.

### 2. Translation Files

Translations are stored in JSON files located at `digame/frontend/public/locales/{locale}/{namespace}.json`.
*   `{locale}`: Language code (e.g., `en`, `es`, `ar`).
*   `{namespace}`: Namespace for organizing translations (default is `common`). Example: `common.json`.

Example for `en/common.json`:
```json
{
  "myKey": "My translated text in English",
  "anotherKey": "Another piece of text"
}
```

### 3. Marking Strings for Translation (in Components)

Use the `useTranslation` hook from `next-i18next`:

```jsx
import { useTranslation } from 'next-i18next';

function MyComponent() {
  const { t, i18n } = useTranslation('common'); // Specify namespace if not 'common'

  return (
    <div>
      <h1>{t('myKey', 'Default text if key not found')}</h1>
      <p>{t('anotherKey')}</p>
    </div>
  );
}
```

For components that need to be compatible with SSR and static generation, you might need to use `serverSideTranslations` in `getStaticProps` or `getServerSideProps` in your page components.

### 4. Adding/Updating Translations

1.  Identify the string you want to translate.
2.  Choose an appropriate key (e.g., `welcomeMessageHomepage`).
3.  Add this key and its translation to each language's JSON file(s) (e.g., `public/locales/en/common.json`, `public/locales/es/common.json`, etc.).

Example - adding `myNewFeatureTitle`:
In `public/locales/en/common.json`:
```json
{
  // ... existing keys ...
  "myNewFeatureTitle": "My New Awesome Feature"
}
```
In `public/locales/es/common.json`:
```json
{
  // ... existing keys ...
  "myNewFeatureTitle": "Mi Nueva Característica Impresionante"
}
```

### 5. Adding a New Language

1.  **Update `next-i18next.config.js`**: Add the new language code to the `locales` array.
    ```javascript
    // digame/frontend/next-i18next.config.js
    module.exports = {
      i18n: {
        defaultLocale: 'en',
        locales: ['en', 'es', 'ar', 'fr'], // Added 'fr'
      },
      // ... other settings
    };
    ```
2.  **Create new locale directory**: Create a new directory under `digame/frontend/public/locales/` for the new language (e.g., `fr`).
3.  **Add translation files**: Copy an existing namespace file (e.g., `common.json`) into the new language directory and translate its content.
    Example: `digame/frontend/public/locales/fr/common.json`.

## RTL (Right-To-Left) Support

RTL support is primarily a frontend concern.

### 1. HTML `dir` Attribute

The `digame/frontend/src/pages/_document.jsx` file dynamically sets `dir="rtl"` or `dir="ltr"` on the `<html>` tag based on the currently detected language (e.g., 'ar' is RTL).

### 2. CSS Styling for RTL

*   **Logical Properties**: Prefer CSS logical properties over directional ones:
    *   `margin-inline-start` instead of `margin-left`
    *   `padding-inline-end` instead of `padding-right`
    *   `border-start-start-radius` instead of `border-top-left-radius`
    *   `text-align: start` instead of `text-align: left`
*   **Flexbox/Grid**: These layout systems are generally good with RTL if you avoid hardcoding directions. The browser often handles flipping automatically when `dir="rtl"` is set.
*   **MUI**: Material-UI (MUI) v5+ (which uses Emotion) has good built-in RTL support. It typically adapts components automatically when `dir="rtl"` is on a parent element. Ensure your theme is correctly configured if you have a custom theme. For older MUI versions or specific needs, JSS users might need `jss-rtl`.
*   **Directional Icons/Images**: Icons or images that imply directionality (e.g., arrows) may need to be flipped in RTL languages. This can be done with CSS:
    ```css
    [dir="rtl"] .my-directional-icon {
      transform: scaleX(-1);
    }
    ```
*   **Testing**: Thoroughly test the UI in an RTL language (e.g., Arabic) to catch layout issues.

## General Workflow

1.  **Develop**: Add new user-facing strings in the code, marking them for translation as described above.
2.  **Extract (Backend)**: Run `pybabel extract` to update the `.pot` template.
3.  **Update Translations**:
    *   Backend: Run `pybabel update` and then edit `.po` files.
    *   Frontend: Manually add/update keys in JSON files.
4.  **Compile (Backend)**: Run `pybabel compile`.
5.  **Test**: Verify translations appear correctly in all supported languages and check RTL layouts.
```
