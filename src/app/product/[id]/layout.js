import { supabaseAdmin } from '@/lib/supabase';

export async function generateMetadata({ params }) {
    const { id } = await params;
    try {
        const { data: product } = await supabaseAdmin
            .from('products')
            .select('name, description, discount_price, original_price, discount_rate, image_url, store:stores(name)')
            .eq('id', id)
            .single();

        if (!product) return { title: '상품 정보' };

        const title = `${product.name} ${product.discount_rate}% 할인`;
        const description = `${product.store?.name}에서 ${product.name}을 ${product.discount_price?.toLocaleString()}원에 만나보세요. (정가 ${product.original_price?.toLocaleString()}원)`;

        return {
            title,
            description,
            openGraph: {
                title: `${title} | 저녁떨이`,
                description,
                images: product.image_url ? [{ url: product.image_url, alt: product.name }] : [],
                type: 'website',
            },
            twitter: {
                card: 'summary_large_image',
                title,
                description,
                images: product.image_url ? [product.image_url] : [],
            },
        };
    } catch {
        return { title: '상품 정보 | 저녁떨이' };
    }
}

export default function ProductLayout({ children }) {
    return children;
}
