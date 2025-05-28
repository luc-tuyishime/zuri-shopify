export const translations = {
    fr: {
        navigation: {
            shopNow: 'Acheter Maintenant',
            bestSellers: 'Nos Meilleures Ventes',
            aboutUs: 'À Propos',
        },
        homepage: {
            ourBestSellers: 'NOS MEILLEURES VENTES',
            howToChoose: 'COMMENT CHOISIR LA PERRUQUE PARFAITE POUR VOUS',
            whyCustomersLove: 'Pourquoi les Clients Adorent',
            readAllReviews: 'LIRE TOUS LES AVIS',
            heroTitle: 'Un titre pertinent irait ici',
            heroButton: 'UNE ACTION',
            discoverConfidence: 'Découvrez la confiance avec nos perruques premium, conçues pour le style, le confort et un look naturel. Que vous recherchiez une transformation audacieuse ou une élégance quotidienne, notre collection diversifiée offre le parfait match pour vous. Découvrez des designs légers et respirants, conçus pour être portés toute la journée.',
            customerTestimonials: 'Découvrez ce que nos clients disent de nos produits',
            readAllReviewsBtn: 'LIRE TOUS LES AVIS',
        },
        wigGuide: {
            step1: '1. Porter la perruque',
            step2: '2. Ajuster le bandeau',
            step3: '3. Couper la dentelle',
            step4: '4. Look fini!',
        },
        footer: {
            companyDescription: 'Nous sommes dirigés et fondés par une femme noire, qui envisage que les femmes soient reconnues pour leurs designs réfléchis grâce à des perruques sur mesure créées avec une plateforme technologique.',
            beBold: 'Soyez Audacieuse.',
            copyright: '©2024 tous droits réservés. Zuri Rwanda Ltd',
            explore: 'EXPLORER',
            home: 'Accueil',
            about: 'À Propos',
            bestSellers: 'Meilleures Ventes',
            wigs: 'Perruques',
            wigCare: 'Entretien des Perruques',
            hairCare: 'Soins Capillaires',
            community: 'Communauté',
            shops: 'Boutiques',
            contact: 'Contact',
            follow: 'SUIVEZ-NOUS',
            legal: 'JURIDIQUE',
            terms: 'Conditions',
            privacy: 'Confidentialité'
        }

    },
    en: {
        navigation: {
            shopNow: 'Shop Now',
            bestSellers: 'Our Best Sellers',
            aboutUs: 'About Us',
        },
        homepage: {
            ourBestSellers: 'OUR BEST SELLERS',
            howToChoose: 'HOW TO CHOOSE THE PERFECT WIG FOR YOU',
            whyCustomersLove: 'Why Customers Love',
            readAllReviews: 'READ ALL REVIEWS',
            heroTitle: 'A relevant title would go here',
            heroButton: 'AN ACTION',
            discoverConfidence: 'Discover confidence with our premium wigs, designed for style, comfort, and a natural look. Whether you\'re seeking a bold transformation or everyday elegance, our diverse collection offers the perfect match for you. Experience lightweight, breathable designs crafted for all-day wear.',
            customerTestimonials: 'Check out what our customers are saying about our products',
            readAllReviewsBtn: 'READ ALL REVIEWS',
        },
        wigGuide: {
            step1: '1. Wear the wig',
            step2: '2. Adjust the band',
            step3: '3. Cut the lace',
            step4: '4. Finished look!',
        },
        footer: {
            companyDescription: 'We are led and founded by a Black woman, who envisions women being recognized for their thoughtful designs through custom-made wigs created with a tech platform.',
            beBold: 'Be Bold.',
            copyright: '©2024 all right reserved. Zuri Rwanda Ltd',
            explore: 'EXPLORE',
            home: 'Home',
            about: 'About',
            bestSellers: 'Best sellers',
            wigs: 'Wigs',
            wigCare: 'Wig care',
            hairCare: 'Hair care',
            community: 'Community',
            shops: 'Shops',
            contact: 'Contact',
            follow: 'FOLLOW',
            legal: 'LEGAL',
            terms: 'Terms',
            privacy: 'Privacy'
        }
    }
};

export function useTranslation(locale = 'fr') {
    return translations[locale] || translations.fr;
}

// Simplified locale functions - no URL checking
export function getLocale() {
    if (typeof window !== 'undefined') {
        const savedLocale = localStorage.getItem('zuri-locale');
        if (savedLocale && ['fr', 'en'].includes(savedLocale)) {
            return savedLocale;
        }
    }
    return 'fr'; // Default to French
}

export function setLocale(locale) {
    if (typeof window !== 'undefined') {
        localStorage.setItem('zuri-locale', locale);
    }
}