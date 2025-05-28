import * as React from 'react';
import {Pagination} from '@shopify/hydrogen';
import {useLocale} from "~/hooks/useLocale.js";

/**
 * <PaginatedResourceSection > is a component that encapsulate how the previous and next behaviors throughout your application.
 * @param {Class<Pagination<NodesType>>['connection']>}
 */
export function PaginatedResourceSection({
                                           connection,
                                           children,
                                           resourcesClassName,
                                         }) {
  const [locale] = useLocale();
  return (
      <Pagination connection={connection}>
        {({nodes, isLoading, PreviousLink, NextLink}) => {
          const resourcesMarkup = nodes.map((node, index) =>
              children({node, index}),
          );

          return (
              <div>
                {/* Center the Previous Link */}
                <div className="flex justify-center mb-4">
                  <PreviousLink>
                    {isLoading ? 'Loading...' : <span>↑ Load previous</span>}
                  </PreviousLink>
                </div>

                {resourcesClassName ? (
                    <div className={resourcesClassName}>{resourcesMarkup}</div>
                ) : (
                    resourcesMarkup
                )}

                {/* Center the Next Link (Load more) */}
                <div className="flex justify-center mt-8">
                  <NextLink>
                    {isLoading ? (locale === 'fr' ? 'Chargement...' : 'Loading...') : (
                        <span>{locale === 'fr' ? 'Charger plus' : 'Load more'} ↓</span>
                    )}
                  </NextLink>
                </div>
              </div>
          );
        }}
      </Pagination>
  );
}