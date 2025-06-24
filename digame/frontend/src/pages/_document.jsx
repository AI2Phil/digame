import Document, { Html, Head, Main, NextScript } from 'next/document';
import i18nextConfig from '../../next-i18next.config'; // Path to your i18n config

class MyDocument extends Document {
  static async getInitialProps(ctx) {
    const initialProps = await Document.getInitialProps(ctx);
    return { ...initialProps, locale: ctx.locale || i18nextConfig.i18n.defaultLocale };
  }

  render() {
    const currentLocale = this.props.locale;
    // Determine language direction. Add more RTL languages as needed.
    const  isRTL = ['ar', 'he', 'fa', 'ur'].includes(currentLocale);
    const direction = isRTL ? 'rtl' : 'ltr';

    return (
      <Html lang={currentLocale} dir={direction}>
        <Head>
          {/* Add any custom <Head> tags here, e.g., fonts, meta tags */}
          {/* Example: MUI theme and emotion styles (if not handled by _app.js) */}
          {/* {this.props.emotionStyleTags} */}
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
