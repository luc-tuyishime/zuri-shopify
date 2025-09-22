import { useState } from 'react';
import {useLocale} from "~/hooks/useLocale.js";

export function EmailCapture() {
    const [locale] = useLocale();
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch('/api/klaviyo-subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            const responseData = await response.json();

            if (response.ok) {
                setStatus('success');
                setEmail('');
            } else {
                setStatus('error');
            }
        } catch (error) {
            console.log('Fetch error:', error);
            setStatus('error');
        }

        setLoading(false);
    };
    return (
        <div className="email-capture-container">
            <h1 className="newsletter-title">{locale === 'fr' ? 'Abonnez-vous à notre newsletter' : 'Subscribe to our newsletter'}</h1>
            <form onSubmit={handleSubmit} className="email-capture-form">
                <div className="form-group">
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={locale === 'fr' ? 'Entrez votre email' : 'Enter your email'}
                        required
                        disabled={loading}
                        className="email-input"
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="subscribe-btn"
                    >
                        {loading ? (locale === 'fr' ? 'Inscription...' : 'Subscribing...') : (locale === 'fr' ? 'S\'ABONNER' : 'SUBSCRIBE')}
                    </button>
                </div>

                {status === 'success' && (
                    <p className="success-message">
                        {locale === 'fr' ? 'Merci pour votre inscription!' : 'Thank you for subscribing!'}
                    </p>
                )}
                {status === 'error' && (
                    <p className="error-message">
                        {locale === 'fr' ? 'Une erreur s\'est produite. Veuillez réessayer.' : 'Something went wrong. Please try again.'}
                    </p>
                )}
            </form>

            <style jsx>{`
        .newsletter-title {
          text-align: center;
          font-size: 2.5rem;
          font-weight: 600;
          color: #4a3728;
          margin-bottom: 1.5rem;
          letter-spacing: -0.5px;
          line-height: 1.2;
        }

        .email-capture-container {
          max-width: 500px;
          margin: 0 auto;
          padding: 2rem;
          //background: linear-gradient(135deg, #f5f1eb 0%, #ede6dc 100%);
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(139, 91, 58, 0.1);
        }

        .email-capture-form {
          width: 100%;
        }

        .form-group {
          display: flex;
          gap: 0;
          border-radius: 8px;
          overflow: hidden;
          border: 2px solid #8b5b3a;
          background: white;
        }

        .email-input {
          flex: 1;
          padding: 16px 20px;
          border: none;
          outline: none;
          font-size: 16px;
          font-family: inherit;
          color: #4a3728;
          background: transparent;
        }

        .email-input::placeholder {
          color: #a0896b;
          font-weight: 400;
        }

        .email-input:focus {
          outline: none;
        }

        .email-input:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .subscribe-btn {
          padding: 16px 32px;
          background: #8b5b3a;
          color: white;
          border: none;
          font-weight: 600;
          font-size: 14px;
          letter-spacing: 0.5px;
          cursor: pointer;
          transition: all 0.3s ease;
          text-transform: uppercase;
          font-family: inherit;
          min-width: 140px;
        }

        .subscribe-btn:hover:not(:disabled) {
          background: #6d4429;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(139, 91, 58, 0.3);
        }

        .subscribe-btn:active {
          transform: translateY(0);
        }

        .subscribe-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }

        .success-message {
          margin-top: 16px;
          padding: 12px 16px;
          background: rgba(139, 91, 58, 0.1);
          border: 1px solid #8b5b3a;
          border-radius: 6px;
          color: #6d4429;
          font-size: 14px;
          text-align: center;
          font-weight: 500;
        }

        .error-message {
          margin-top: 16px;
          padding: 12px 16px;
          background: rgba(220, 53, 69, 0.1);
          border: 1px solid #dc3545;
          border-radius: 6px;
          color: #dc3545;
          font-size: 14px;
          text-align: center;
          font-weight: 500;
        }

        /* Responsive design */
        @media (max-width: 768px) {
          .newsletter-title {
            font-size: 2rem;
            margin-bottom: 1rem;
          }

          .email-capture-container {
            padding: 1.5rem;
            margin: 1rem;
          }

          .form-group {
            flex-direction: column;
          }

          .subscribe-btn {
            padding: 16px;
            border-radius: 0 0 6px 6px;
          }

          .email-input {
            border-radius: 6px 6px 0 0;
          }
        }

        /* Animation for loading state */
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }

        .subscribe-btn:disabled {
          animation: pulse 1.5s infinite;
        }
      `}</style>
        </div>
    );
}