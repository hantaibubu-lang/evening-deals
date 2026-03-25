'use client';
import { useState, useRef } from 'react';
import Image from 'next/image';
import { fetchWithAuth } from '@/utils/apiAuth';

export default function ImageUploader({ folder = 'products', maxFiles = 5, onUpload, existingImages = [] }) {
    const [images, setImages] = useState(existingImages);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);

    const handleFileSelect = async (e) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        const remaining = maxFiles - images.length;
        if (remaining <= 0) return;

        const filesToUpload = files.slice(0, remaining);
        setUploading(true);

        const newImages = [];
        for (const file of filesToUpload) {
            // 클라이언트 사이드 검증
            if (file.size > 5 * 1024 * 1024) {
                alert(`${file.name}: 5MB 이하 파일만 업로드 가능합니다.`);
                continue;
            }
            if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) {
                alert(`${file.name}: JPG, PNG, WebP, GIF 파일만 가능합니다.`);
                continue;
            }

            try {
                const formData = new FormData();
                formData.append('file', file);
                formData.append('folder', folder);

                const res = await fetchWithAuth('/api/upload', {
                    method: 'POST',
                    body: formData,
                });

                if (res.ok) {
                    const data = await res.json();
                    newImages.push({ url: data.url, path: data.path });
                } else {
                    const err = await res.json();
                    alert(err.error || '업로드 실패');
                }
            } catch (err) {
                console.error('Upload error:', err);
                alert('이미지 업로드 중 오류가 발생했습니다.');
            }
        }

        if (newImages.length > 0) {
            const updated = [...images, ...newImages];
            setImages(updated);
            onUpload?.(updated);
        }

        setUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleRemove = (index) => {
        const updated = images.filter((_, i) => i !== index);
        setImages(updated);
        onUpload?.(updated);
    };

    return (
        <div>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {images.map((img, i) => (
                    <div key={i} style={{ position: 'relative', width: '80px', height: '80px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #eee' }}>
                        <Image
                            src={img.url}
                            alt={`업로드 이미지 ${i + 1}`}
                            fill
                            sizes="80px"
                            style={{ objectFit: 'cover' }}
                        />
                        <button
                            type="button"
                            onClick={() => handleRemove(i)}
                            style={{
                                position: 'absolute', top: '2px', right: '2px',
                                width: '20px', height: '20px', borderRadius: '50%',
                                backgroundColor: 'rgba(0,0,0,0.6)', color: '#fff',
                                border: 'none', fontSize: '12px', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                lineHeight: 1,
                            }}
                        >
                            ✕
                        </button>
                    </div>
                ))}

                {images.length < maxFiles && (
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        style={{
                            width: '80px', height: '80px', borderRadius: '8px',
                            border: '2px dashed #ddd', backgroundColor: '#f9f9f9',
                            display: 'flex', flexDirection: 'column',
                            alignItems: 'center', justifyContent: 'center',
                            color: '#999', cursor: uploading ? 'wait' : 'pointer',
                            opacity: uploading ? 0.5 : 1,
                        }}
                    >
                        {uploading ? (
                            <span style={{ fontSize: '0.8rem' }}>업로드중...</span>
                        ) : (
                            <>
                                <span style={{ fontSize: '1.5rem', marginBottom: '2px' }}>📷</span>
                                <span style={{ fontSize: '0.75rem' }}>{images.length}/{maxFiles}</span>
                            </>
                        )}
                    </button>
                )}
            </div>

            <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                multiple={maxFiles > 1}
                onChange={handleFileSelect}
                style={{ display: 'none' }}
            />
        </div>
    );
}
