import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const q = searchParams.get('q')?.trim();

        if (!q || q.length < 1 || q.length > 100) {
            return NextResponse.json({ suggestions: [] });
        }

        // ilike 특수문자 이스케이프 (%, _, \)
        const safeQ = q.replace(/[\\%_]/g, ch => `\\${ch}`);

        // 상품명 + 매장명에서 매칭되는 항목 검색
        const [productsRes, storesRes] = await Promise.all([
            supabase
                .from('products')
                .select('name')
                .eq('status', 'active')
                .ilike('name', `%${safeQ}%`)
                .limit(5),
            supabase
                .from('stores')
                .select('name')
                .ilike('name', `%${safeQ}%`)
                .limit(3),
        ]);

        const productNames = (productsRes.data || []).map(p => ({
            text: p.name,
            type: 'product',
        }));

        const storeNames = (storesRes.data || []).map(s => ({
            text: s.name,
            type: 'store',
        }));

        // 중복 제거
        const seen = new Set();
        const suggestions = [...productNames, ...storeNames].filter(item => {
            if (seen.has(item.text)) return false;
            seen.add(item.text);
            return true;
        }).slice(0, 8);

        return NextResponse.json({ suggestions });
    } catch (e) {
        console.error('Autocomplete error:', e);
        return NextResponse.json({ suggestions: [] });
    }
}
