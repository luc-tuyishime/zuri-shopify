import {createContext, useContext, useEffect, useState} from 'react';

/**
 * A side bar component with Overlay
 * @example
 * ```jsx
 * <Aside type="search" heading="SEARCH">
 *  <input type="search" />
 *  ...
 * </Aside>
 * ```
 * @param {{
 *   children?: React.ReactNode;
 *   type: AsideType;
 *   heading: React.ReactNode;
 * }}
 */
export function Aside({children, heading, type}) {
  const {type: activeType, close} = useAside();
  const expanded = type === activeType;

  // ✅ Check if this is a cart aside
  const isCart = type === 'cart';

  useEffect(() => {
    const abortController = new AbortController();

    if (expanded) {
      document.addEventListener(
          'keydown',
          function handler(event) {
            if (event.key === 'Escape') {
              close();
            }
          },
          {signal: abortController.signal},
      );
    }
    return () => abortController.abort();
  }, [close, expanded]);

  return (
      <div
          aria-modal
          className={`overlay ${expanded ? 'expanded' : ''} ${isCart ? 'cart-overlay' : ''}`}
          role="dialog"
      >
        <button className="close-outside" onClick={close} />
        <aside className={isCart ? 'cart-aside' : ''}>
          {/* ✅ Only show header for non-cart asides */}
          {!isCart && (
              <header>
                <h3>{heading}</h3>
                <button className="close reset" onClick={close} aria-label="Close">
                  &times;
                </button>
              </header>
          )}
          <main className={isCart ? 'cart-main' : ''}>{children}</main>
        </aside>

        {/* ✅ Add CSS for full-width cart */}
        <style dangerouslySetInnerHTML={{
          __html: `
          /* Full-width cart styles */
          .overlay.cart-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            z-index: 1000;
            background: rgba(0, 0, 0, 0.5);
          }

          .overlay.cart-overlay.expanded {
            opacity: 1;
            visibility: visible;
          }

          .overlay.cart-overlay aside.cart-aside {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: white;
            transform: translateY(100%);
            transition: transform 0.3s ease-in-out;
            overflow: hidden;
          }

          .overlay.cart-overlay.expanded aside.cart-aside {
            transform: translateY(0);
          }

          .overlay.cart-overlay main.cart-main {
            height: 100%;
            overflow: hidden;
          }

          /* Ensure normal asides still work */
          .overlay:not(.cart-overlay) {
            /* Your existing overlay styles */
          }

          .overlay:not(.cart-overlay) aside {
            /* Your existing aside styles */
          }

          /* Override any conflicting styles for cart */
          .cart-aside header {
            display: none !important;
          }
        `
        }} />
      </div>
  );
}

const AsideContext = createContext(null);

Aside.Provider = function AsideProvider({children}) {
  const [type, setType] = useState('closed');

  return (
      <AsideContext.Provider
          value={{
            type,
            open: setType,
            close: () => setType('closed'),
          }}
      >
        {children}
      </AsideContext.Provider>
  );
};

export function useAside() {
  const aside = useContext(AsideContext);
  if (!aside) {
    throw new Error('useAside must be used within an AsideProvider');
  }
  return aside;
}

/** @typedef {'search' | 'cart' | 'mobile' | 'closed'} AsideType */
/**
 * @typedef {{
 *   type: AsideType;
 *   open: (mode: AsideType) => void;
 *   close: () => void;
 * }} AsideContextValue
 */

/** @typedef {import('react').ReactNode} ReactNode */