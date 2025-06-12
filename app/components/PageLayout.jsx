import {Await, Link} from '@remix-run/react';
import {lazy, Suspense, useId, useState, useEffect} from 'react';
import {Aside} from '~/components/Aside';
import {Header} from '~/components/Header'; // Keep Header - it's critical above fold
import {
    SEARCH_ENDPOINT,
    SearchFormPredictive,
} from '~/components/SearchFormPredictive';
import {SearchResultsPredictive} from '~/components/SearchResultsPredictive';

const Footer = lazy(() => import('~/components/Footer').then(m => ({ default: m.Footer })));
const CartMain = lazy(() => import('~/components/CartMain').then(m => ({ default: m.CartMain })));

const useLazyComponent = (threshold = 0.1, rootMargin = '200px') => {
    const [shouldLoad, setShouldLoad] = useState(false);
    const [ref, setRef] = useState(null);

    useEffect(() => {
        if (!ref) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    setShouldLoad(true);
                    observer.disconnect();
                }
            },
            { threshold, rootMargin }
        );

        observer.observe(ref);
        return () => observer.disconnect();
    }, [ref, threshold, rootMargin]);

    return [setRef, shouldLoad];
};

// Lazy Footer Component with Intersection Observer
function LazyFooter({ footer, header, publicStoreDomain }) {
    const [elementRef, shouldLoad] = useLazyComponent(0.1, '300px');

    const FooterSkeleton = () => (
        <footer className="bg-gray-100 animate-pulse">
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="space-y-4">
                            <div className="h-6 bg-gray-300 rounded w-3/4"></div>
                            <div className="space-y-2">
                                <div className="h-4 bg-gray-300 rounded w-full"></div>
                                <div className="h-4 bg-gray-300 rounded w-5/6"></div>
                                <div className="h-4 bg-gray-300 rounded w-4/6"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </footer>
    );

    return (
        <div ref={elementRef}>
            {shouldLoad ? (
                <Suspense fallback={<FooterSkeleton />}>
                    <Footer
                        footer={footer}
                        header={header}
                        publicStoreDomain={publicStoreDomain}
                    />
                </Suspense>
            ) : (
                <FooterSkeleton />
            )}
        </div>
    );
}

// Lazy Cart Component (loads on interaction)
function LazyCartAside({cart}) {
    const [shouldLoad, setShouldLoad] = useState(false);

    // Load when cart aside is opened
    useEffect(() => {
        const handleAsideOpen = (e) => {
            if (e.detail?.type === 'cart') {
                setShouldLoad(true);
            }
        };

        document.addEventListener('aside:open', handleAsideOpen);
        return () => document.removeEventListener('aside:open', handleAsideOpen);
    }, []);

    const CartSkeleton = () => (
        <div className="animate-pulse space-y-4 p-4">
            <div className="h-6 bg-gray-300 rounded w-1/2"></div>
            {[...Array(3)].map((_, i) => (
                <div key={i} className="flex space-x-4">
                    <div className="h-16 w-16 bg-gray-300 rounded"></div>
                    <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                        <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                    </div>
                </div>
            ))}
        </div>
    );

    return (
        <Aside type="cart" heading="CART">
            <Suspense fallback={<CartSkeleton />}>
                <Await resolve={cart}>
                    {(cart) => {
                        if (!shouldLoad) {
                            // Trigger loading when cart data is available
                            setShouldLoad(true);
                        }

                        return shouldLoad ? (
                            <Suspense fallback={<CartSkeleton />}>
                                <CartMain cart={cart} layout="aside" />
                            </Suspense>
                        ) : (
                            <CartSkeleton />
                        );
                    }}
                </Await>
            </Suspense>
        </Aside>
    );
}

/**
 * @param {PageLayoutProps}
 */
export function PageLayout({
                               cart,
                               children = null,
                               footer,
                               header,
                               isLoggedIn,
                               publicStoreDomain,
                           }) {
    return (
        <Aside.Provider>
            <LazyCartAside cart={cart} />

            <SearchAside />

            <MobileMenuAside header={header} publicStoreDomain={publicStoreDomain} />

            {header && (
                <Header
                    header={header}
                    cart={cart}
                    isLoggedIn={isLoggedIn}
                    publicStoreDomain={publicStoreDomain}
                />
            )}

            <main>{children}</main>

            <LazyFooter
                footer={footer}
                header={header}
                publicStoreDomain={publicStoreDomain}
            />
        </Aside.Provider>
    );
}

// Keep SearchAside as-is since it's interactive and should load quickly
function SearchAside() {
    const queriesDatalistId = useId();
    return (
        <Aside type="search" heading="SEARCH">
            <div className="predictive-search">
                <br />
                <SearchFormPredictive>
                    {({fetchResults, goToSearch, inputRef}) => (
                        <>
                            <input
                                name="q"
                                onChange={fetchResults}
                                onFocus={fetchResults}
                                placeholder="Search"
                                ref={inputRef}
                                type="search"
                                list={queriesDatalistId}
                            />
                            &nbsp;
                            <button onClick={goToSearch}>Search</button>
                        </>
                    )}
                </SearchFormPredictive>

                <SearchResultsPredictive>
                    {({items, total, term, state, closeSearch}) => {
                        const {articles, collections, pages, products, queries} = items;

                        if (state === 'loading' && term.current) {
                            return <div>Loading...</div>;
                        }

                        if (!total) {
                            return <SearchResultsPredictive.Empty term={term} />;
                        }

                        return (
                            <>
                                <SearchResultsPredictive.Queries
                                    queries={queries}
                                    queriesDatalistId={queriesDatalistId}
                                />
                                <SearchResultsPredictive.Products
                                    products={products}
                                    closeSearch={closeSearch}
                                    term={term}
                                />
                                <SearchResultsPredictive.Collections
                                    collections={collections}
                                    closeSearch={closeSearch}
                                    term={term}
                                />
                                <SearchResultsPredictive.Pages
                                    pages={pages}
                                    closeSearch={closeSearch}
                                    term={term}
                                />
                                <SearchResultsPredictive.Articles
                                    articles={articles}
                                    closeSearch={closeSearch}
                                    term={term}
                                />
                                {term.current && total ? (
                                    <Link
                                        onClick={closeSearch}
                                        to={`${SEARCH_ENDPOINT}?q=${term.current}`}
                                    >
                                        <p>
                                            View all results for <q>{term.current}</q>
                                            &nbsp; →
                                        </p>
                                    </Link>
                                ) : null}
                            </>
                        );
                    }}
                </SearchResultsPredictive>
            </div>
        </Aside>
    );
}

// Keep MobileMenuAside as-is since it's interactive
function MobileMenuAside({header, publicStoreDomain}) {
    return (
        header.menu &&
        header.shop.primaryDomain?.url && (
            <Aside type="mobile" heading="MENU">
            </Aside>
        )
    );
}

/**
 * @typedef {Object} PageLayoutProps
 * @property {Promise<CartApiQueryFragment|null>} cart
 * @property {Promise<FooterQuery|null>} footer
 * @property {HeaderQuery} header
 * @property {Promise<boolean>} isLoggedIn
 * @property {string} publicStoreDomain
 * @property {React.ReactNode} [children]
 */

/** @typedef {import('storefrontapi.generated').CartApiQueryFragment} CartApiQueryFragment */
/** @typedef {import('storefrontapi.generated').FooterQuery} FooterQuery */
/** @typedef {import('storefrontapi.generated').HeaderQuery} HeaderQuery */