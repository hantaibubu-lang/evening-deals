'use client';
import { useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function DbViewer() {
    const [selectedTable, setSelectedTable] = useState('products');
    const [tableData, setTableData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const tables = ['products', 'stores', 'users', 'orders', 'favorites'];

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from(selectedTable)
                .select('*')
                .limit(10);
                
            if (error) throw error;
            setTableData(data || []);
        } catch (error) {
            console.error('DB Fetch Error:', error);
            alert('데이터를 조회할 수 없습니다. 권한을 확인하세요.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="page-content" style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
            <header style={{ display: 'flex', alignItems: 'center', padding: '16px', backgroundColor: '#fff', borderBottom: '1px solid #eee' }}>
                <Link href="/admin/dashboard" style={{ fontSize: '1.2rem', textDecoration: 'none', marginRight: '16px' }}>←</Link>
                <h1 style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>데이터베이스 조회</h1>
            </header>

            <div style={{ padding: '20px' }}>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                    <select 
                        value={selectedTable} 
                        onChange={(e) => setSelectedTable(e.target.value)}
                        style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ddd', flex: 1 }}
                    >
                        {tables.map(t => <option key={t} value={t}>{t} 테이블</option>)}
                    </select>
                    <button onClick={fetchData} style={{ padding: '10px 16px', backgroundColor: 'var(--primary)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold' }}>
                        조회 (최근 10건)
                    </button>
                </div>

                <div style={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #ddd', overflowX: 'auto', padding: '16px' }}>
                    {isLoading ? (
                        <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>데이터 로딩 중...</div>
                    ) : tableData.length > 0 ? (
                        <pre style={{ fontSize: '0.8rem', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                            {JSON.stringify(tableData, null, 2)}
                        </pre>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>조회 버튼을 눌러주세요.</div>
                    )}
                </div>
            </div>
        </main>
    );
}
