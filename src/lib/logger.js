/**
 * 중앙화 로거 - API 요청/보안 이벤트 구조화 로깅
 * Vercel 로그 (stdout)에 JSON 형식으로 출력되어 검색/필터 가능
 */

const LOG_LEVELS = { debug: 0, info: 1, warn: 2, error: 3 };
const MIN_LEVEL = process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug');

// 의심 활동 추적 (인메모리, 서버 재시작 시 초기화)
const suspiciousTracker = new Map();
const SUSPICIOUS_WINDOW_MS = 5 * 60 * 1000; // 5분
const SUSPICIOUS_THRESHOLD = 10; // 5분 내 10회 이상 실패 시 경고

function shouldLog(level) {
    return LOG_LEVELS[level] >= LOG_LEVELS[MIN_LEVEL];
}

function formatLog(level, message, context = {}) {
    return JSON.stringify({
        ts: new Date().toISOString(),
        level,
        msg: message,
        ...context,
    });
}

export const logger = {
    debug: (msg, ctx) => shouldLog('debug') && console.log(formatLog('debug', msg, ctx)),
    info:  (msg, ctx) => shouldLog('info')  && console.log(formatLog('info',  msg, ctx)),
    warn:  (msg, ctx) => shouldLog('warn')  && console.warn(formatLog('warn',  msg, ctx)),
    error: (msg, ctx) => shouldLog('error') && console.error(formatLog('error', msg, ctx)),
};

/**
 * API 요청 로그
 * @param {Request} request
 * @param {number} status - HTTP 응답 코드
 * @param {number} durationMs - 처리 시간(ms)
 * @param {Object} extra - 추가 컨텍스트 (userId 등)
 */
export function logRequest(request, status, durationMs, extra = {}) {
    const ip = getIp(request);
    const url = new URL(request.url);
    const level = status >= 500 ? 'error' : status >= 400 ? 'warn' : 'info';

    logger[level]('api_request', {
        method: request.method,
        path: url.pathname,
        status,
        ip,
        ms: durationMs,
        ua: request.headers.get('user-agent')?.slice(0, 100),
        ...extra,
    });
}

/**
 * 보안 이벤트 로그 + 의심 활동 감지
 * @param {'auth_fail'|'forbidden'|'rate_limit'|'validation_fail'|'suspicious'} type
 * @param {Request} request
 * @param {Object} extra
 */
export function logSecurityEvent(type, request, extra = {}) {
    const ip = getIp(request);
    const url = new URL(request.url);

    logger.warn('security_event', {
        type,
        ip,
        path: url.pathname,
        method: request.method,
        ...extra,
    });

    // 의심 활동 카운팅 (auth_fail, forbidden, rate_limit)
    if (['auth_fail', 'forbidden', 'rate_limit'].includes(type)) {
        trackSuspicious(ip, url.pathname);
    }
}

/**
 * 중요 비즈니스 이벤트 로그 (주문 생성, 상품 등록 등)
 */
export function logEvent(event, context = {}) {
    logger.info(event, context);
}

// ─── 내부 헬퍼 ────────────────────────────────────────────

function getIp(request) {
    return (
        request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
        request.headers.get('x-real-ip') ||
        'unknown'
    );
}

function trackSuspicious(ip, path) {
    const now = Date.now();
    const key = ip;
    let record = suspiciousTracker.get(key);

    if (!record || now - record.windowStart > SUSPICIOUS_WINDOW_MS) {
        record = { windowStart: now, count: 0, paths: [] };
        suspiciousTracker.set(key, record);
    }

    record.count++;
    if (!record.paths.includes(path)) record.paths.push(path);

    if (record.count === SUSPICIOUS_THRESHOLD) {
        logger.error('suspicious_activity_detected', {
            ip,
            failures: record.count,
            window_min: SUSPICIOUS_WINDOW_MS / 60000,
            paths: record.paths,
        });
    }

    // 오래된 기록 정리
    if (suspiciousTracker.size > 5000) {
        for (const [k, v] of suspiciousTracker) {
            if (now - v.windowStart > SUSPICIOUS_WINDOW_MS * 2) {
                suspiciousTracker.delete(k);
            }
        }
    }
}
