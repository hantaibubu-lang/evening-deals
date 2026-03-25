// JSON-LD 구조화 데이터 컴포넌트들

export function OrganizationJsonLd() {
    const data = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: '저녁떨이',
        url: process.env.NEXT_PUBLIC_BASE_URL || 'https://evening-deals.vercel.app',
        logo: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://evening-deals.vercel.app'}/icons/icon-512.svg`,
        description: '김해 지역 마감 세일 할인 정보 플랫폼',
        contactPoint: {
            '@type': 'ContactPoint',
            email: 'hantaibubu@gmail.com',
            contactType: 'customer service',
            availableLanguage: 'Korean',
        },
        sameAs: [],
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
        />
    );
}

export function WebsiteJsonLd() {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://evening-deals.vercel.app';
    const data = {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: '저녁떨이',
        url: baseUrl,
        potentialAction: {
            '@type': 'SearchAction',
            target: `${baseUrl}/search?q={search_term_string}`,
            'query-input': 'required name=search_term_string',
        },
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
        />
    );
}

export function ProductJsonLd({ product }) {
    if (!product) return null;

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://evening-deals.vercel.app';
    const data = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name,
        description: product.description,
        image: product.image_url || undefined,
        url: `${baseUrl}/product/${product.id}`,
        brand: {
            '@type': 'Organization',
            name: product.store?.name || '저녁떨이',
        },
        offers: {
            '@type': 'Offer',
            price: product.discount_price,
            priceCurrency: 'KRW',
            availability: product.status === 'active'
                ? 'https://schema.org/InStock'
                : 'https://schema.org/SoldOut',
            seller: {
                '@type': 'LocalBusiness',
                name: product.store?.name,
            },
            priceValidUntil: product.expires_at || undefined,
        },
    };

    if (product.rating && product.review_count > 0) {
        data.aggregateRating = {
            '@type': 'AggregateRating',
            ratingValue: product.rating,
            reviewCount: product.review_count,
        };
    }

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
        />
    );
}

export function LocalBusinessJsonLd({ store }) {
    if (!store) return null;

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://evening-deals.vercel.app';
    const data = {
        '@context': 'https://schema.org',
        '@type': 'LocalBusiness',
        name: store.name,
        description: store.description || `${store.name}의 마감 할인 상품`,
        url: `${baseUrl}/store/${store.id}`,
        address: store.address ? {
            '@type': 'PostalAddress',
            streetAddress: store.address,
            addressLocality: '김해시',
            addressRegion: '경상남도',
            addressCountry: 'KR',
        } : undefined,
        telephone: store.phone_number || undefined,
    };

    if (store.rating && store.review_count > 0) {
        data.aggregateRating = {
            '@type': 'AggregateRating',
            ratingValue: store.rating,
            reviewCount: store.review_count,
        };
    }

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
        />
    );
}
