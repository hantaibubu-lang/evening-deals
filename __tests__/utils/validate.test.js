/**
 * validate.js 유닛 테스트
 * XSS 방지, 이메일 검증, UUID 검증, 정수 검증 등
 */

import {
  sanitizeString,
  isValidEmail,
  isValidUUID,
  isPositiveInt,
  safeParseInt,
  isValidLength,
  isOneOf,
  isValidHttpUrl,
  isValidRating,
  validateRequired,
} from '@/utils/validate';

// ── sanitizeString ──────────────────────────────────────
describe('sanitizeString', () => {
  test('HTML 특수문자를 이스케이프한다', () => {
    expect(sanitizeString('<script>alert("xss")</script>')).toBe(
      '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;'
    );
  });

  test('& 문자를 이스케이프한다', () => {
    expect(sanitizeString('a & b')).toBe('a &amp; b');
  });

  test('작은따옴표를 이스케이프한다', () => {
    expect(sanitizeString("it's")).toBe("it&#x27;s");
  });

  test('일반 문자열은 그대로 반환한다', () => {
    expect(sanitizeString('hello world')).toBe('hello world');
  });

  test('빈 문자열을 처리한다', () => {
    expect(sanitizeString('')).toBe('');
  });

  test('문자열이 아닌 입력에 빈 문자열 반환', () => {
    expect(sanitizeString(null)).toBe('');
    expect(sanitizeString(undefined)).toBe('');
    expect(sanitizeString(123)).toBe('');
    expect(sanitizeString({})).toBe('');
  });

  test('한글 문자열을 그대로 반환한다', () => {
    expect(sanitizeString('김해시 장유동')).toBe('김해시 장유동');
  });
});

// ── isValidEmail ────────────────────────────────────────
describe('isValidEmail', () => {
  test('유효한 이메일을 허용한다', () => {
    expect(isValidEmail('user@example.com')).toBe(true);
    expect(isValidEmail('test.name+tag@domain.co.kr')).toBe(true);
  });

  test('잘못된 이메일을 거부한다', () => {
    expect(isValidEmail('')).toBe(false);
    expect(isValidEmail('not-an-email')).toBe(false);
    expect(isValidEmail('@domain.com')).toBe(false);
    expect(isValidEmail('user@')).toBe(false);
    expect(isValidEmail('user @domain.com')).toBe(false);
  });

  test('254자 초과 이메일을 거부한다', () => {
    const longEmail = 'a'.repeat(250) + '@b.com';
    expect(isValidEmail(longEmail)).toBe(false);
  });

  test('문자열이 아닌 입력을 거부한다', () => {
    expect(isValidEmail(null)).toBe(false);
    expect(isValidEmail(123)).toBe(false);
    expect(isValidEmail(undefined)).toBe(false);
  });
});

// ── isValidUUID ─────────────────────────────────────────
describe('isValidUUID', () => {
  test('유효한 UUID v4를 허용한다', () => {
    expect(isValidUUID('550e8400-e29b-41d4-a716-446655440000')).toBe(true);
    expect(isValidUUID('6ba7b810-9dad-11d1-80b4-00c04fd430c8')).toBe(true);
  });

  test('잘못된 UUID를 거부한다', () => {
    expect(isValidUUID('')).toBe(false);
    expect(isValidUUID('not-a-uuid')).toBe(false);
    expect(isValidUUID('550e8400-e29b-41d4-a716')).toBe(false);
    expect(isValidUUID('550e8400e29b41d4a716446655440000')).toBe(false);
  });

  test('대소문자를 구분하지 않는다', () => {
    expect(isValidUUID('550E8400-E29B-41D4-A716-446655440000')).toBe(true);
  });

  test('문자열이 아닌 입력을 거부한다', () => {
    expect(isValidUUID(null)).toBe(false);
    expect(isValidUUID(123)).toBe(false);
  });
});

// ── isPositiveInt ───────────────────────────────────────
describe('isPositiveInt', () => {
  test('양의 정수를 허용한다', () => {
    expect(isPositiveInt(1)).toBe(true);
    expect(isPositiveInt(100)).toBe(true);
    expect(isPositiveInt('5')).toBe(true);
  });

  test('0, 음수, 소수를 거부한다', () => {
    expect(isPositiveInt(0)).toBe(false);
    expect(isPositiveInt(-1)).toBe(false);
    expect(isPositiveInt(1.5)).toBe(false);
  });

  test('NaN과 비숫자를 거부한다', () => {
    expect(isPositiveInt(NaN)).toBe(false);
    expect(isPositiveInt('abc')).toBe(false);
    expect(isPositiveInt(null)).toBe(false);
  });
});

// ── safeParseInt ────────────────────────────────────────
describe('safeParseInt', () => {
  test('유효한 정수를 파싱한다', () => {
    expect(safeParseInt('42')).toBe(42);
    expect(safeParseInt('0')).toBe(0);
    expect(safeParseInt('100', 0, 200)).toBe(100);
  });

  test('범위를 벗어나면 null 반환', () => {
    expect(safeParseInt('5', 10, 20)).toBe(null);
    expect(safeParseInt('25', 10, 20)).toBe(null);
  });

  test('유효하지 않은 값은 null 반환', () => {
    expect(safeParseInt('abc')).toBe(null);
    expect(safeParseInt('')).toBe(null);
    expect(safeParseInt(undefined)).toBe(null);
  });
});

// ── isValidLength ───────────────────────────────────────
describe('isValidLength', () => {
  test('유효한 길이를 허용한다', () => {
    expect(isValidLength('hello', 1, 10)).toBe(true);
    expect(isValidLength('a', 1, 1)).toBe(true);
  });

  test('범위 밖 길이를 거부한다', () => {
    expect(isValidLength('', 1, 10)).toBe(false);
    expect(isValidLength('hello world', 1, 5)).toBe(false);
  });

  test('공백만 있는 문자열은 trim 후 검증', () => {
    expect(isValidLength('   ', 1, 10)).toBe(false);
  });

  test('문자열이 아닌 입력을 거부한다', () => {
    expect(isValidLength(123, 1, 10)).toBe(false);
    expect(isValidLength(null, 1, 10)).toBe(false);
  });
});

// ── isOneOf ─────────────────────────────────────────────
describe('isOneOf', () => {
  test('허용된 값을 통과시킨다', () => {
    expect(isOneOf('active', ['active', 'inactive', 'pending'])).toBe(true);
  });

  test('허용되지 않은 값을 거부한다', () => {
    expect(isOneOf('deleted', ['active', 'inactive'])).toBe(false);
  });
});

// ── isValidHttpUrl ──────────────────────────────────────
describe('isValidHttpUrl', () => {
  test('유효한 HTTP/HTTPS URL을 허용한다', () => {
    expect(isValidHttpUrl('https://example.com')).toBe(true);
    expect(isValidHttpUrl('http://localhost:3000')).toBe(true);
    expect(isValidHttpUrl('https://api.supabase.co/storage/v1')).toBe(true);
  });

  test('잘못된 URL을 거부한다', () => {
    expect(isValidHttpUrl('')).toBe(false);
    expect(isValidHttpUrl('not-a-url')).toBe(false);
    expect(isValidHttpUrl('ftp://files.example.com')).toBe(false);
    expect(isValidHttpUrl('javascript:alert(1)')).toBe(false);
  });

  test('문자열이 아닌 입력을 거부한다', () => {
    expect(isValidHttpUrl(null)).toBe(false);
    expect(isValidHttpUrl(123)).toBe(false);
  });
});

// ── isValidRating ───────────────────────────────────────
describe('isValidRating', () => {
  test('1~5 정수를 허용한다', () => {
    for (let i = 1; i <= 5; i++) {
      expect(isValidRating(i)).toBe(true);
    }
  });

  test('범위 밖 값을 거부한다', () => {
    expect(isValidRating(0)).toBe(false);
    expect(isValidRating(6)).toBe(false);
    expect(isValidRating(-1)).toBe(false);
    expect(isValidRating(3.5)).toBe(false);
  });

  test('문자열 숫자도 허용한다', () => {
    expect(isValidRating('3')).toBe(true);
    expect(isValidRating('5')).toBe(true);
  });
});

// ── validateRequired ────────────────────────────────────
describe('validateRequired', () => {
  test('모든 필수 필드가 있으면 valid', () => {
    const body = { name: '떡볶이', price: 3000, quantity: 5 };
    expect(validateRequired(body, ['name', 'price', 'quantity'])).toEqual({ valid: true });
  });

  test('누락된 필드가 있으면 invalid + missing 반환', () => {
    const body = { name: '떡볶이' };
    const result = validateRequired(body, ['name', 'price']);
    expect(result.valid).toBe(false);
    expect(result.missing).toBe('price');
  });

  test('빈 문자열도 누락으로 처리', () => {
    const body = { name: '' };
    expect(validateRequired(body, ['name']).valid).toBe(false);
  });

  test('null/undefined도 누락으로 처리', () => {
    const body = { name: null, price: undefined };
    expect(validateRequired(body, ['name']).valid).toBe(false);
    expect(validateRequired(body, ['price']).valid).toBe(false);
  });
});
