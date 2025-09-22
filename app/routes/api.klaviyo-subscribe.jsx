import { json } from '@shopify/remix-oxygen';

export async function loader() {
    return json({
        message: 'This endpoint only accepts POST requests for email subscriptions'
    }, { status: 405 });
}

export async function action({ request, context }) {
    if (request.method !== 'POST') {
        return json({ error: 'Method not allowed' }, { status: 405 });
    }

    try {
        const { email } = await request.json();

        if (!email) {
            return json({ error: 'Email is required' }, { status: 400 });
        }

        const klaviyoApiKey = context.env.KLAVIYO_API_KEY;

        if (!klaviyoApiKey) {
            return json({ error: 'Server configuration error' }, { status: 500 });
        }

        const response = await fetch('https://a.klaviyo.com/api/profiles/', {
            method: 'POST',
            headers: {
                'Authorization': `Klaviyo-API-Key ${klaviyoApiKey}`,
                'Content-Type': 'application/json',
                'revision': '2023-12-15'
            },
            body: JSON.stringify({
                data: {
                    type: 'profile',
                    attributes: {
                        email: email
                    }
                }
            })
        });

        if (response.ok || response.status === 409) {
            return json({ success: true });
        } else {
            const errorText = await response.text();
            return json({ error: 'Failed to subscribe' }, { status: 400 });
        }
    } catch (error) {
        return json({ error: 'Server error' }, { status: 500 });
    }
}