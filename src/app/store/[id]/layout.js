import { supabaseAdmin } from '@/lib/supabase';

export async function generateMetadata({ params }) {
    const { id } = await params;
    try {
        const { data: store } = await supabaseAdmin
            .from('stores')
            .select('name, address, description')
            .eq('id', id)
            .single();

        if (!store) return { title: '가게 정보' };

        return {
            title: `${store.name} - 마감 할인 상품`,
            description: store.description || `${store.name}의 오늘의 마감 할인 상품을 확인하세요. ${store.address}`,
            openGraph: {
                title: `${store.name} | 저녁떨이`,
                description: `${store.name}의 마감 세일 상품을 최대 70% 할인가에 만나보세요.`,
                type: 'website',
            },
        };
    } catch {
        return { title: '가게 정보 | 저녁떨이' };
    }
}

export default function StoreLayout({ children }) {
    return children;
}
