/**
 * Rate Limiter — Redis 우선, 폴백: 인메모리 Token Bucket
 *
 * Redis 사용 시 (권장):
 *   UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
 *   UPSTASH_REDIS_REST_TOKEN=xxx
 *
 * 위 환경변수 없으면 자동으로 인메모리 방식으로 동작
 */

const REDIS_URL   = process.env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;
const useRedis    = Boolean(REDIS_URL && REDIS_TOKEN);

// ─── Redis (Upstash REST API) ──────────────────────────────

async function redisCommand(...args) {
    const res = await fetch(`${REDIS_URL}/${args.map(encodeURIComponent).join('/')}`, {
        headers: { Authorization: `Bearer ${REDIS_TOKEN}` },
        cache: 'no-store',
    });
    if (!res.ok) throw new Error(`Redis error: ${res.status}`);
    const json = await res.json();
    return json.result;
}

async function rateLimitRedis(key, limit, windowMs) {
    const windowSec = Math.ceil(windowMs / 1000);
    try {
        const count = await redisCommand('INCR', key);
        if (count === 1) {
            // 첫 요청 — 만료 시간 설정
            await redisCommand('EXPIRE', key, String(windowSec));
        }
        const ttl = await redisCommand('TTL', key);
        const resetAt = Date.now() + ttl * 1000;

        if (count > limit) {
            return { success: false, remaining: 0, resetAt };
        }
        return { success: true, remaining: limit - count, resetAt };
    } catch (e) {
        // Redis 장애 시 요청 허용 (fail-open)
        console.error('Redis rate limit error, failing open:', e.message);
        return { success: true, remaining: limit, resetAt: Date.now() + windowMs };
    }
}

// ─── 인메모리 Token Bucket (폴백) ─────────────────────────

const buckets = new Map();
const CLEANUP_INTERVAL = 60 * 1000;
let lastCleanup = Date.now();

function cleanup() {
    const now = Date.now();
    if (now - lastCleanup < CLEANUP_INTERVAL) return;
    lastCleanup = now;
    for (const [key, bucket] of buckets) {
        if (now - bucket.lastRefill > bucket.windowMs * 2) buckets.delete(key);
    }
}

function rateLimitMemory(key, limit, windowMs) {
    cleanup();
    const now = Date.now();
    let bucket = buckets.get(key);

    if (!bucket || now - bucket.lastRefill >= windowMs) {
        bucket = { tokens: limit, lastRefill: now, windowMs };
        buckets.set(key, bucket);
    }

    if (bucket.tokens > 0) {
        bucket.tokens--;
        return { success: true,  remaining: bucket.tokens, resetAt: bucket.lastRefill + windowMs };
    }
    return { success: false, remaining: 0, resetAt: bucket.lastRefill + windowMs };
}

// ─── 공통 인터페이스 ──────────────────────────────────────

export async function rateLimit(key, { limit = 60, windowMs = 60000 } = {}) {
    return useRedis
        ? rateLimitRedis(key, limit, windowMs)
        : rateLimitMemory(key, limit, windowMs);
}

export function getClientIp(request) {
    return (
        request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
        request.headers.get('x-real-ip') ||
        'unknown'
    );
}

/**
 * Rate limit 미들웨어 헬퍼 - API route에서 사용
 * @returns {Promise<Response|null>} 429 Response 또는 null (통과)
 */
export async function checkRateLimit(request, { limit = 60, windowMs = 60000, keyPrefix = '' } = {}) {
    const ip  = getClientIp(request);
    const key = keyPrefix ? `rl:${keyPrefix}:${ip}` : `rl:${ip}`;
    const result = await rateLimit(key, { limit, windowMs });

    if (!result.success) {
        return new Response(
            JSON.stringify({ error: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.' }),
            {
                status: 429,
                headers: {
                    'Content-Type': 'application/json',
                    'Retry-After':          String(Math.ceil((result.resetAt - Date.now()) / 1000)),
                    'X-RateLimit-Limit':    String(limit),
                    'X-RateLimit-Remaining': '0',
                    'X-RateLimit-Reset':    String(result.resetAt),
                },
            }
        );
    }
    return null;
}
