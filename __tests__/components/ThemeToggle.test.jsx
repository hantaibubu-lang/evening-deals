/**
 * ThemeToggle 컴포넌트 테스트
 */
import { render, screen, fireEvent } from '@testing-library/react';
import ThemeToggle from '@/components/ThemeToggle';

// localStorage mock
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => { store[key] = String(value); },
    removeItem: (key) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// matchMedia mock
Object.defineProperty(window, 'matchMedia', {
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  })),
});

describe('ThemeToggle', () => {
  beforeEach(() => {
    localStorageMock.clear();
    document.documentElement.removeAttribute('data-theme');
  });

  test('기본 테마는 light', () => {
    render(<ThemeToggle />);
    const button = screen.getByRole('button');
    expect(button.getAttribute('aria-label')).toBe('다크 모드로 전환');
    expect(button.getAttribute('aria-pressed')).toBe('false');
  });

  test('클릭 시 dark 모드로 전환', () => {
    render(<ThemeToggle />);
    const button = screen.getByRole('button');
    fireEvent.click(button);
    expect(button.getAttribute('aria-label')).toBe('라이트 모드로 전환');
    expect(button.getAttribute('aria-pressed')).toBe('true');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  test('다크 모드에서 다시 클릭하면 라이트로 복귀', () => {
    render(<ThemeToggle />);
    const button = screen.getByRole('button');
    fireEvent.click(button); // → dark
    fireEvent.click(button); // → light
    expect(button.getAttribute('aria-pressed')).toBe('false');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });

  test('localStorage에 테마 저장', () => {
    render(<ThemeToggle />);
    const button = screen.getByRole('button');
    fireEvent.click(button);
    expect(localStorageMock.getItem('theme')).toBe('dark');
  });

  test('localStorage에 저장된 dark 테마로 초기화', () => {
    localStorageMock.setItem('theme', 'dark');
    render(<ThemeToggle />);
    const button = screen.getByRole('button');
    expect(button.getAttribute('aria-pressed')).toBe('true');
  });
});
