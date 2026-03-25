import { supabaseAdmin } from '@/lib/supabase';

export default async function sitemap() {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://evening-deals.vercel.app';
    const now = new Date().toISOString();

    const staticRoutes = [
        { url: baseUrl, lastModified: now, changeFrequency: 'daily', priority: 1 },
        { url: `${baseUrl}/search`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
        { url: `${baseUrl}/login`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
        { url: `${baseUrl}/signup`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
        { url: `${baseUrl}/terms`, lastModified: '2026-03-26', changeFrequency: 'yearly', priority: 0.3 },
        { url: `${baseUrl}/privacy`, lastModified: '2026-03-26', changeFrequency: 'yearly', priority: 0.3 },
        { url: `${baseUrl}/refund-policy`, lastModified: '2026-03-26', changeFrequency: 'yearly', priority: 0.3 },
    ];

    try {
        const [{ data: stores }, { data: products }] = await Promise.all([
            supabaseAdmin.from('stores').select('id, updated_at').eq('is_active', true),
            supabaseAdmin.from('products').select('id, updated_at').eq('status', 'active'),
        ]);

        const storeRoutes = (stores || []).map(s => ({
            url: `${baseUrl}/store/${s.id}`,
            lastModified: s.updated_at || now,
            changeFrequency: 'daily',
            priority: 0.8,
        }));

        const productRoutes = (products || []).map(p => ({
            url: `${baseUrl}/product/${p.id}`,
            lastModified: p.updated_at || now,
            changeFrequency: 'hourly',
            priority: 0.7,
        }));

        return [...staticRoutes, ...storeRoutes, ...productRoutes];
    } catch {
        return staticRoutes;
    }
}
