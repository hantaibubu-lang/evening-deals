/**
 * Toast 컴포넌트 테스트
 */
import { render, screen, act, fireEvent } from '@testing-library/react';
import { ToastProvider, useToast } from '@/components/Toast';

// Toast를 트리거하는 헬퍼 컴포넌트
function ToastTrigger({ message, type }) {
  const { showToast } = useToast();
  return (
    <button onClick={() => showToast(message, type)}>
      Show Toast
    </button>
  );
}

describe('Toast', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('토스트 컨테이너에 aria-live="polite" 설정', () => {
    render(
      <ToastProvider>
        <div>test</div>
      </ToastProvider>
    );
    const container = document.querySelector('[role="status"]');
    expect(container).not.toBeNull();
    expect(container.getAttribute('aria-live')).toBe('polite');
  });

  test('showToast 호출 시 메시지 표시', () => {
    render(
      <ToastProvider>
        <ToastTrigger message="테스트 메시지" type="success" />
      </ToastProvider>
    );

    fireEvent.click(screen.getByText('Show Toast'));
    expect(screen.getByText('테스트 메시지')).toBeDefined();
  });

  test('에러 타입 토스트에 role="alert" 설정', () => {
    render(
      <ToastProvider>
        <ToastTrigger message="에러 발생!" type="error" />
      </ToastProvider>
    );

    fireEvent.click(screen.getByText('Show Toast'));
    const alertEl = document.querySelector('[role="alert"]');
    expect(alertEl).not.toBeNull();
  });

  test('닫기 버튼에 aria-label 존재', () => {
    render(
      <ToastProvider>
        <ToastTrigger message="닫기 테스트" type="success" />
      </ToastProvider>
    );

    fireEvent.click(screen.getByText('Show Toast'));
    const closeBtn = screen.getByLabelText('알림 닫기');
    expect(closeBtn).toBeDefined();
  });

  test('닫기 버튼 클릭 시 토스트 제거', () => {
    render(
      <ToastProvider>
        <ToastTrigger message="제거 테스트" type="success" />
      </ToastProvider>
    );

    fireEvent.click(screen.getByText('Show Toast'));
    expect(screen.getByText('제거 테스트')).toBeDefined();

    const closeBtn = screen.getByLabelText('알림 닫기');
    fireEvent.click(closeBtn);
    expect(screen.queryByText('제거 테스트')).toBeNull();
  });

  test('3초 후 자동으로 사라진다', () => {
    render(
      <ToastProvider>
        <ToastTrigger message="자동 제거" type="info" />
      </ToastProvider>
    );

    fireEvent.click(screen.getByText('Show Toast'));
    expect(screen.getByText('자동 제거')).toBeDefined();

    act(() => { jest.advanceTimersByTime(3000); });
    expect(screen.queryByText('자동 제거')).toBeNull();
  });
});
