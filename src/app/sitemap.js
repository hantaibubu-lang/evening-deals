export default function sitemap() {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://evening-deals.vercel.app';
    const now = new Date().toISOString();

    return [
        { url: baseUrl, lastModified: now, changeFrequency: 'daily', priority: 1 },
        { url: `${baseUrl}/search`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
        { url: `${baseUrl}/login`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
        { url: `${baseUrl}/signup`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    ];
}
