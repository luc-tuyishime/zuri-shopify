import {RemixServer} from '@remix-run/react';
import {isbot} from 'isbot';
import {renderToReadableStream} from 'react-dom/server';
import {createContentSecurityPolicy} from '@shopify/hydrogen';

export default async function handleRequest(
    request,
    responseStatusCode,
    responseHeaders,
    remixContext,
    context,
) {

  // REMOVE THIS MANUAL CSP HEADER:
  // responseHeaders.set('Content-Security-Policy', "...");

  const {nonce, header, NonceProvider} = createContentSecurityPolicy({
    shop: {
      checkoutDomain: context.env.PUBLIC_CHECKOUT_DOMAIN,
      storeDomain: context.env.PUBLIC_STORE_DOMAIN,
    },
    // Add Cloudinary to defaultSrc
    defaultSrc: [
      "'self'",
      "https://cdn.shopify.com",
      "https://shopify.com",
      "https://res.cloudinary.com",        // ✅ Add Cloudinary
      "https://video.cloudinary.com",      // ✅ Add Cloudinary video
      "http://localhost:*"
    ],
    // Add mediaSrc for videos
    mediaSrc: [
      "'self'",
      "https://cdn.shopify.com",
      "https://res.cloudinary.com",        // ✅ Add Cloudinary
      "https://video.cloudinary.com"       // ✅ Add Cloudinary video
    ],
    styleSrc: [
      "'self'",
      "'unsafe-inline'",
      "https://cdn.shopify.com",
      "https://fonts.googleapis.com",
      "http://localhost:*"
    ],
    fontSrc: [
      "'self'",
      "https://fonts.gstatic.com"
    ],
    // Add other required sources
    connectSrc: [
      "'self'",
      "https://monorail-edge.shopifysvc.com",
      "https://myzuri.com",
      "https://myzurishop.myshopify.com",
      "http://localhost:*",
      "ws://localhost:*",
      "ws://127.0.0.1:*",
      "ws://*.tryhydrogen.dev:*"
    ],
    imgSrc: [
      "'self'",
      "data:",
      "https:"
    ]
  });

  const body = await renderToReadableStream(
      <NonceProvider>
        <RemixServer context={remixContext} url={request.url} nonce={nonce} />
      </NonceProvider>,
      {
        nonce,
        signal: request.signal,
        onError(error) {
          console.error(error);
          responseStatusCode = 500;
        },
      },
  );

  if (isbot(request.headers.get('user-agent'))) {
    await body.allReady;
  }

  responseHeaders.set('Content-Type', 'text/html');
  responseHeaders.set('Content-Security-Policy', header);

  return new Response(body, {
    headers: responseHeaders,
    status: responseStatusCode,
  });
}