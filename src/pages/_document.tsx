import Document, { Html, Head, Main, NextScript, DocumentContext } from 'next/document';

interface MyDocumentProps {
  nonce: string;
}

class MyDocument extends Document<MyDocumentProps> {
  static async getInitialProps(ctx: DocumentContext) {
    const initialProps = await Document.getInitialProps(ctx);
    // Get nonce from response header (set by Express)
    let nonce = '';
    if (ctx.res && ctx.res.getHeader) {
      nonce = String(ctx.res.getHeader('x-nonce') || '');
    }
    return { ...initialProps, nonce };
  }

  render() {
    const nonce = this.props.nonce;
    return (
      <Html>
        <Head>
          {/* Pass the nonce to all inline styles/scripts if needed */}
          <meta httpEquiv="Content-Security-Policy" content={`default-src 'self'; script-src 'self' 'nonce-${nonce}'; style-src 'self' 'unsafe-inline'; img-src * blob: data:; connect-src *; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none';`} />
          <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
          <meta httpEquiv="Referrer-Policy" content="strict-origin-when-cross-origin" />
          <meta httpEquiv="X-Frame-Options" content="DENY" />
        </Head>
        <body>
          <Main />
          <NextScript nonce={nonce} />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
