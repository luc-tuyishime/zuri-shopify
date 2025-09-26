import { useEffect } from "react";
import { useNonce } from "@shopify/hydrogen";

export function KlaviyoProvider({ companyId, children }) {
    const nonce = useNonce();

    useEffect(() => {
        if (!companyId || window.klaviyo) return;

        const script = document.createElement("script");
        script.async = true;
        script.src = `https://static.klaviyo.com/onsite/js/klaviyo.js?company_id=${companyId}`;
        script.nonce = nonce; // Add nonce to the script
        document.head.appendChild(script);

        script.onload = () => {
            console.log('Klaviyo script loaded with company ID:', companyId);
        };

        script.onerror = () => {
            console.error('Failed to load Klaviyo script');
        };
    }, [companyId, nonce]);

    return children;
}