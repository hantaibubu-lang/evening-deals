'use client';
import { createContext, useContext, useState } from 'react';

const ToastContext = createContext();

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const showToast = (message, type = 'success', duration = 3000) => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, duration);
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            {/* Toast Container */}
            <div style={{ position: 'fixed', bottom: '24px', left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', gap: '8px', zIndex: 9999, width: '90%', maxWidth: '400px', pointerEvents: 'none' }}>
                {toasts.map(t => (
                    <div key={t.id} style={{
                        padding: '16px', borderRadius: '12px', fontSize: '0.95rem', fontWeight: 'bold', color: '#fff',
                        backgroundColor: t.type === 'error' ? '#FF4757' : t.type === 'warning' ? '#F1C40F' : t.type === 'info' ? '#3498DB' : '#222',
                        boxShadow: '0 8px 16px rgba(0,0,0,0.15)',
                        animation: 'slideUp 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        pointerEvents: 'auto'
                    }}>
                        <span>{t.message}</span>
                        <button onClick={() => setToasts(prev => prev.filter(toast => toast.id !== t.id))} style={{ background: 'none', border: 'none', color: '#fff', opacity: 0.6, fontSize: '1.2rem', cursor: 'pointer', padding: '0 4px', lineHeight: 1 }}>&times;</button>
                    </div>
                ))}
            </div>
            <style jsx global>{`
                @keyframes slideUp {
                    from { transform: translateY(40px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
            `}</style>
        </ToastContext.Provider>
    );
}

export function useToast() {
    return useContext(ToastContext);
}
