import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';

function getServiceAccount() {
    const key = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    if (!key) throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY 환경변수가 설정되지 않았습니다.');
    const parsed = JSON.parse(key);
    // private_key의 \\n을 실제 개행으로 변환
    parsed.private_key = parsed.private_key.replace(/\\n/g, '\n');
    return parsed;
}

function getAdminApp() {
    if (getApps().length > 0) return getApps()[0];
    return initializeApp({ credential: cert(getServiceAccount()) });
}

export function getAdminMessaging() {
    return getMessaging(getAdminApp());
}
