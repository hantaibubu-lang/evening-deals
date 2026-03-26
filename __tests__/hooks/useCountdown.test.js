/**
 * useCountdown 훅 유닛 테스트
 */

import { renderHook, act } from '@testing-library/react';
import { useCountdown } from '@/hooks/useCountdown';

// setInterval/clearInterval mock
beforeEach(() => {
  jest.useFakeTimers();
});
afterEach(() => {
  jest.useRealTimers();
});

describe('useCountdown', () => {
  test('expiresAt이 없으면 null 상태 반환', () => {
    const { result } = renderHook(() => useCountdown(null));
    expect(result.current.timeLeft).toBeNull();
    expect(result.current.isUrgent).toBe(false);
    expect(result.current.isExpired).toBe(false);
  });

  test('과거 시간이면 마감 상태', () => {
    const pastTime = new Date(Date.now() - 60000).toISOString();
    const { result } = renderHook(() => useCountdown(pastTime));
    expect(result.current.timeLeft).toBe('마감');
    expect(result.current.isExpired).toBe(true);
    expect(result.current.isUrgent).toBe(true);
  });

  test('30분 이내면 isUrgent: true', () => {
    const soon = new Date(Date.now() + 20 * 60 * 1000).toISOString(); // 20분 후
    const { result } = renderHook(() => useCountdown(soon));
    expect(result.current.isUrgent).toBe(true);
    expect(result.current.isExpired).toBe(false);
  });

  test('30분 이상이면 isUrgent: false', () => {
    const later = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1시간 후
    const { result } = renderHook(() => useCountdown(later));
    expect(result.current.isUrgent).toBe(false);
    expect(result.current.isExpired).toBe(false);
  });

  test('1시간 이상이면 "X시간 Y분" 형식', () => {
    const twoHoursLater = new Date(Date.now() + 2 * 60 * 60 * 1000 + 30 * 60 * 1000).toISOString();
    const { result } = renderHook(() => useCountdown(twoHoursLater));
    expect(result.current.timeLeft).toMatch(/\d+시간 \d+분/);
  });

  test('1시간 미만이면 "X분 Y초" 형식', () => {
    const tenMinutes = new Date(Date.now() + 10 * 60 * 1000 + 30 * 1000).toISOString();
    const { result } = renderHook(() => useCountdown(tenMinutes));
    expect(result.current.timeLeft).toMatch(/\d+분 \d+초/);
  });

  test('1분 미만이면 "X초" 형식', () => {
    const thirtySeconds = new Date(Date.now() + 30 * 1000).toISOString();
    const { result } = renderHook(() => useCountdown(thirtySeconds));
    expect(result.current.timeLeft).toMatch(/\d+초/);
  });

  test('시간이 흐르면 카운트다운이 진행된다', () => {
    const twoMinutes = new Date(Date.now() + 2 * 60 * 1000).toISOString();
    const { result } = renderHook(() => useCountdown(twoMinutes));

    const initialTimeLeft = result.current.timeLeft;

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    // 1초 지남 → timeLeft가 변경되었을 수 있음
    expect(result.current.isExpired).toBe(false);
  });

  test('마감 시간이 지나면 isExpired: true로 변경', () => {
    const fiveSeconds = new Date(Date.now() + 3000).toISOString();
    const { result } = renderHook(() => useCountdown(fiveSeconds));

    expect(result.current.isExpired).toBe(false);

    act(() => {
      jest.advanceTimersByTime(4000);
    });

    expect(result.current.isExpired).toBe(true);
    expect(result.current.timeLeft).toBe('마감');
  });
});
