'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AdminDashboardPage() {
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const router = useRouter();

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const res = await fetch('/api/admin/dashboard');
            if (!res.ok) throw new Error('데이터를 불러오는데 실패했습니다.');
            const data = await res.json();
            setDashboardData(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (productId, currentStatus) => {
        const newStatus = currentStatus === 'available' ? 'sold_out' : 'available';

        try {
            const res = await fetch(`/api/products/${productId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            if (!res.ok) throw new Error('상태 변경 실패');
            fetchDashboardData();
        } catch (err) {
            alert('상태 변경에 실패했습니다.');
        }
    };

    const handleDelete = async (productId) => {
        if (!confirm('정말로 이 상품을 삭제하시겠습니까?')) return;

        try {
            const res = await fetch(`/api/products/${productId}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('삭제 실패');
            fetchDashboardData();
        } catch (err) {
            alert('상품 삭제에 실패했습니다.');
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center h-full">
            <div className="animate-pulse flex flex-col items-center">
                <div className="h-8 w-8 bg-brand-red rounded-full mb-4"></div>
                <div className="text-gray-500">대시보드 로딩 중...</div>
            </div>
        </div>
    );

    if (error) return <div className="p-4 text-center text-red-500">{error}</div>;

    const { store, stats, products } = dashboardData;

    return (
        <div className="bg-bg-light min-h-screen pb-20">
            {/* Header */}
            <header className="sticky top-0 bg-white shadow-sm z-10 px-4 py-3 flex justify-between items-center">
                <h1 className="text-xl font-bold text-gray-900">사장님 대시보드</h1>
                <Link href="/mypage" className="text-gray-500">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </Link>
            </header>

            <div className="p-4 space-y-6">
                {/* 상단 프로필 및 빠른 액션 */}
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex justify-between items-center">
                    <div>
                        <h2 className="text-lg font-bold text-gray-800">{store?.name || '내 마트'}</h2>
                        <p className="text-sm text-gray-500">상품 관리 및 통계를 확인하세요.</p>
                    </div>
                    <Link href="/admin/product/new" className="bg-brand-red text-white text-sm font-medium px-4 py-2 rounded-lg shadow-sm hover:bg-red-600 transition-colors">
                        + 상품 등록
                    </Link>
                </div>

                {/* 통계 요약 뷰 */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-center items-center">
                        <span className="text-gray-500 text-xs mb-1">판매 중인 상품</span>
                        <span className="text-2xl font-bold text-brand-red">{stats?.activeProducts}건</span>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-center items-center">
                        <span className="text-gray-500 text-xs mb-1">누적 주문/예약</span>
                        <span className="text-2xl font-bold text-gray-800">{stats?.totalOrders}건</span>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-center items-center">
                        <span className="text-gray-500 text-xs mb-1">우리동네 단골</span>
                        <span className="text-2xl font-bold text-orange-500">{stats?.favoritesCount}명</span>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-center items-center">
                        <span className="text-gray-500 text-xs mb-1">전체 누적 상품</span>
                        <span className="text-2xl font-bold text-gray-800">{stats?.totalProducts}건</span>
                    </div>
                </div>

                {/* 상품 관리 목록 */}
                <div>
                    <h3 className="text-base font-bold text-gray-900 mb-3 flex items-center">
                        <svg className="w-5 h-5 mr-1 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                        내 상품 관리
                    </h3>

                    {products?.length === 0 ? (
                        <div className="bg-white rounded-xl p-8 text-center text-gray-500 shadow-sm border border-gray-100">
                            아직 등록된 상품이 없습니다.
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <ul className="divide-y divide-gray-100">
                                {products?.map((product) => (
                                    <li key={product.id} className="p-4 hover:bg-gray-50 transition-colors">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${product.status === 'available' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                                        {product.status === 'available' ? '판매중' : '품절/종료'}
                                                    </span>
                                                    <span className="text-xs text-gray-400">재고 {product.quantity}개</span>
                                                </div>
                                                <h4 className="text-sm font-bold text-gray-900 leading-tight">{product.name}</h4>
                                                <div className="mt-1">
                                                    <span className="text-brand-red font-bold text-sm">{product.discount_price?.toLocaleString()}원</span>
                                                    <span className="text-gray-400 line-through text-xs ml-1">{product.original_price?.toLocaleString()}원</span>
                                                </div>
                                            </div>

                                            {product.image_url && (
                                                <div className="relative w-16 h-16 ml-3 flex-shrink-0">
                                                    <img src={product.image_url} alt={product.name} className="w-full h-full object-cover rounded-lg border border-gray-100" />
                                                </div>
                                            )}
                                        </div>

                                        {/* 액션 버튼 그룹 */}
                                        <div className="flex gap-2 mt-3 pt-3 border-t border-gray-50">
                                            <button
                                                onClick={() => handleStatusChange(product.id, product.status)}
                                                className={`flex-1 py-1.5 rounded-md text-xs font-medium border transition-colors ${product.status === 'available'
                                                    ? 'border-gray-200 text-gray-700 hover:bg-gray-50'
                                                    : 'border-green-200 text-green-700 bg-green-50 hover:bg-green-100'
                                                    }`}
                                            >
                                                {product.status === 'available' ? '품절 처리' : '판매 재개'}
                                            </button>
                                            <button
                                                onClick={() => alert(`상품 ID ${product.id} 수정 페이지 이동 (추가 구현 필요)`)}
                                                className="flex-1 py-1.5 rounded-md text-xs font-medium border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
                                            >
                                                수정
                                            </button>
                                            <button
                                                onClick={() => handleDelete(product.id)}
                                                className="flex-1 py-1.5 rounded-md text-xs font-medium border border-red-100 text-red-500 hover:bg-red-50 transition-colors"
                                            >
                                                삭제
                                            </button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
