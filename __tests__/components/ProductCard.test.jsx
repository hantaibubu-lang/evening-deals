/**
 * ProductCard 컴포넌트 테스트
 */
import { render, screen, fireEvent } from '@testing-library/react';

// Mock hooks
jest.mock('@/hooks/useFavorite', () => ({
  useFavorite: jest.fn(() => ({ isFavorited: false, toggle: jest.fn() })),
}));

jest.mock('@/hooks/useCountdown', () => ({
  useCountdown: jest.fn(() => ({
    timeLeft: '2:30:00',
    isUrgent: false,
    isExpired: false,
  })),
}));

import ProductCard from '@/components/ProductCard';
import { useFavorite } from '@/hooks/useFavorite';
import { useCountdown } from '@/hooks/useCountdown';

const mockProduct = {
  id: 'test-1',
  name: '테스트 떡볶이',
  originalPrice: 10000,
  discountPrice: 5000,
  discountRate: 50,
  imageUrl: '/test-image.jpg',
  distance: '1.2',
  quantity: 3,
  expires_at: new Date(Date.now() + 3600000).toISOString(),
};

describe('ProductCard', () => {
  beforeEach(() => {
    useFavorite.mockReturnValue({ isFavorited: false, toggle: jest.fn() });
    useCountdown.mockReturnValue({ timeLeft: '2:30:00', isUrgent: false, isExpired: false });
  });

  test('상품명이 포함된 aria-label로 렌더링', () => {
    render(<ProductCard product={mockProduct} />);
    const link = screen.getByRole('link');
    expect(link.getAttribute('aria-label')).toContain('테스트 떡볶이');
    expect(link.getAttribute('aria-label')).toContain('50% 할인');
    expect(link.getAttribute('aria-label')).toContain('5,000원');
  });

  test('상품 링크가 올바른 href를 갖는다', () => {
    render(<ProductCard product={mockProduct} />);
    const link = screen.getByRole('link');
    expect(link.getAttribute('href')).toBe('/product/test-1');
  });

  test('할인율 배지 표시', () => {
    render(<ProductCard product={mockProduct} />);
    expect(screen.getByText('50%')).toBeDefined();
  });

  test('원래 가격에 취소선 표시', () => {
    render(<ProductCard product={mockProduct} />);
    expect(screen.getByText('10,000원')).toBeDefined();
  });

  test('할인 가격 표시', () => {
    render(<ProductCard product={mockProduct} />);
    expect(screen.getByText('5,000원')).toBeDefined();
  });

  test('남은 수량 표시', () => {
    render(<ProductCard product={mockProduct} />);
    expect(screen.getByText('남은수량 3개')).toBeDefined();
  });

  test('찜 버튼에 적절한 aria-label', () => {
    render(<ProductCard product={mockProduct} />);
    const favBtn = screen.getByLabelText('찜하기');
    expect(favBtn).toBeDefined();
  });

  test('찜 상태이면 "찜 해제" aria-label', () => {
    useFavorite.mockReturnValue({ isFavorited: true, toggle: jest.fn() });
    render(<ProductCard product={mockProduct} />);
    const favBtn = screen.getByLabelText('찜 해제');
    expect(favBtn).toBeDefined();
  });

  test('찜 버튼 클릭 시 toggle 호출', () => {
    const mockToggle = jest.fn((e) => e.preventDefault());
    useFavorite.mockReturnValue({ isFavorited: false, toggle: mockToggle });
    render(<ProductCard product={mockProduct} />);
    const favBtn = screen.getByLabelText('찜하기');
    fireEvent.click(favBtn);
    expect(mockToggle).toHaveBeenCalled();
  });

  test('마감 임박이면 타이머 표시', () => {
    render(<ProductCard product={mockProduct} />);
    expect(screen.getByText(/2:30:00/)).toBeDefined();
  });

  test('마감된 상품이면 "마감" 표시', () => {
    useCountdown.mockReturnValue({ timeLeft: '0:00:00', isUrgent: true, isExpired: true });
    render(<ProductCard product={mockProduct} />);
    expect(screen.getByText(/마감/)).toBeDefined();
  });

  test('이미지에 alt 텍스트 포함', () => {
    render(<ProductCard product={mockProduct} />);
    const img = screen.getByAltText('테스트 떡볶이 상품 이미지');
    expect(img).toBeDefined();
  });

  test('영업 종료 오버레이 표시', () => {
    render(<ProductCard product={{ ...mockProduct, isClosed: true }} />);
    expect(screen.getByText(/영업 종료/)).toBeDefined();
  });

  test('AD 배지 표시 (스폰서 상품)', () => {
    render(<ProductCard product={{ ...mockProduct, isSponsored: true }} />);
    expect(screen.getByText('AD')).toBeDefined();
  });
});
