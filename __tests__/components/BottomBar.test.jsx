/**
 * BottomBar 컴포넌트 테스트
 */
import { render, screen } from '@testing-library/react';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(() => '/'),
}));

// Mock AuthContext
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn(() => ({ role: 'consumer' })),
}));

import BottomBar from '@/components/BottomBar';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

describe('BottomBar', () => {
  beforeEach(() => {
    usePathname.mockReturnValue('/');
    useAuth.mockReturnValue({ role: 'consumer' });
  });

  test('일반 유저에게 홈, 찜, 구매내역, MY 탭 표시', () => {
    render(<BottomBar />);
    expect(screen.getByLabelText('홈')).toBeDefined();
    expect(screen.getByLabelText('찜')).toBeDefined();
    expect(screen.getByLabelText('구매내역')).toBeDefined();
    expect(screen.getByLabelText('MY')).toBeDefined();
  });

  test('현재 페이지에 aria-current="page" 설정', () => {
    render(<BottomBar />);
    const homeTab = screen.getByLabelText('홈');
    expect(homeTab.getAttribute('aria-current')).toBe('page');
  });

  test('다른 페이지에서는 aria-current 미설정', () => {
    render(<BottomBar />);
    const favTab = screen.getByLabelText('찜');
    expect(favTab.getAttribute('aria-current')).toBeNull();
  });

  test('admin 역할이면 대시보드, 회원관리, 설정 탭 표시', () => {
    useAuth.mockReturnValue({ role: 'admin' });
    render(<BottomBar />);
    expect(screen.getByLabelText('대시보드')).toBeDefined();
    expect(screen.getByLabelText('회원관리')).toBeDefined();
    expect(screen.getByLabelText('설정')).toBeDefined();
  });

  test('사장님 역할이면 홈, 상품 관리 등 탭 표시', () => {
    useAuth.mockReturnValue({ role: 'store_manager' });
    render(<BottomBar />);
    expect(screen.getByLabelText('홈')).toBeDefined();
    expect(screen.getByLabelText('상품 관리')).toBeDefined();
  });

  test('로그인 페이지에서는 렌더링하지 않음', () => {
    usePathname.mockReturnValue('/login');
    const { container } = render(<BottomBar />);
    expect(container.innerHTML).toBe('');
  });

  test('회원가입 페이지에서는 렌더링하지 않음', () => {
    usePathname.mockReturnValue('/signup');
    const { container } = render(<BottomBar />);
    expect(container.innerHTML).toBe('');
  });

  test('nav에 role="navigation"과 aria-label 존재', () => {
    render(<BottomBar />);
    const nav = screen.getByRole('navigation', { name: '하단 네비게이션' });
    expect(nav).toBeDefined();
  });

  test('SVG 아이콘에 aria-hidden="true" 설정', () => {
    render(<BottomBar />);
    const svgs = document.querySelectorAll('.bottombar svg');
    svgs.forEach(svg => {
      expect(svg.getAttribute('aria-hidden')).toBe('true');
    });
  });
});
