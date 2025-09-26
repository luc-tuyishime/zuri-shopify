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
    defaultSrc: [
      "'self'",
      "https://cdn.shopify.com",
      "https://shopify.com",
      "https://res.cloudinary.com",
      "https://video.cloudinary.com",
      "http://localhost:*"
    ],
    frameSrc: [ // Add this for captcha
      "'self'",
      "https://geo.captcha-delivery.com",
      "https://www.google.com",
      "https://www.gstatic.com"
    ],
    scriptSrc: [
      "'self'",
      "'unsafe-inline'",
      "https://static.klaviyo.com",
      "https://www.googletagmanager.com",
      "https://www.google-analytics.com", // Add for GA
      "https://cdn.shopify.com",
      "http://localhost:*"
    ],
    connectSrc: [
      "'self'",
      "https://monorail-edge.shopifysvc.com",
      "https://myzuri.com", // Remove duplicate prefix issues
      "https://myzurishop.myshopify.com",
      "https://a.klaviyo.com",
      "https://fast.a.klaviyo.com",
      "https://static.klaviyo.com",
      "https://static-forms.klaviyo.com",
      "https://www.google-analytics.com", // Add for GA tracking
      "https://analytics.google.com", // Add for GA4
      "https://www.googletagmanager.com", // Add for GTM
      "http://localhost:*",
      "ws://localhost:*",
      "ws://127.0.0.1:*",
      "ws://*.tryhydrogen.dev:*"
    ],
    styleSrc: [
      "'self'",
      "'unsafe-inline'",
      "https://cdn.shopify.com",
      "https://fonts.googleapis.com",
      "https://static.klaviyo.com", // Add Klaviyo styles
      "http://localhost:*"
    ],
    styleSrcElem: [ // Add this new section
      "'self'",
      "'unsafe-inline'",
      "https://cdn.shopify.com",
      "https://fonts.googleapis.com",
      "https://static.klaviyo.com", // Add Klaviyo styles
      "http://localhost:*"
    ],
    fontSrc: [
      "'self'",
      "https://fonts.gstatic.com"
    ],
    imgSrc: [
      "'self'",
      "data:",
      "https:",
      "https://www.google-analytics.com", // Add for GA tracking pixels
      "https://www.googletagmanager.com" // Add for GTM
    ],
    mediaSrc: [
      "'self'",
      "https://myzuri.com",
      "https://cdn.shopify.com",
      "https://myzurishop.myshopify.com",
      "https://res.cloudinary.com",
      "https://video.cloudinary.com"
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