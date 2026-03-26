import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
    const start = Date.now();
    const checks = { database: 'fail', timestamp: new Date().toISOString() };

    try {
        // DB 연결 확인 (간단한 쿼리)
        const { error } = await supabaseAdmin
            .from('stores')
            .select('id')
            .limit(1);

        checks.database = error ? 'fail' : 'ok';
    } catch {
        checks.database = 'fail';
    }

    checks.latencyMs = Date.now() - start;

    const healthy = checks.database === 'ok';

    return Response.json(
        { status: healthy ? 'healthy' : 'degraded', ...checks },
        { status: healthy ? 200 : 503 }
    );
}
