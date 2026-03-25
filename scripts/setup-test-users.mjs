import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.error('환경 변수가 누락되었습니다. .env.local 파일을 확인해 주세요.');
    process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

const testUsers = [
    {
        email: 'admin@eveningdeals.com',
        password: 'admin1234!',
        name: '개발자 (관리자)',
        role: 'admin'
    },
    {
        email: 'manager@eveningdeals.com',
        password: 'manager1234!',
        name: '사장님 (매니저)',
        role: 'store_manager'
    },
    {
        email: 'user@eveningdeals.com',
        password: 'user1234!',
        name: '일반 회원',
        role: 'consumer'
    }
];

async function setupUsers() {
    console.log('🚀 테스트 계정 설정을 시작합니다...');

    for (const testUser of testUsers) {
        console.log(`\n--- [${testUser.name}] 설정 중... ---`);

        // 1. Auth에서 사용자 확인
        const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();
        if (listError) {
            console.error('사용자 목록 조회 실패:', listError.message);
            continue;
        }

        let authUser = users.find(u => u.email === testUser.email);

        if (!authUser) {
            console.log(`Auth에 ${testUser.email} 계정이 없습니다. 생성을 시도합니다.`);
            const { data: { user }, error: createError } = await supabaseAdmin.auth.admin.createUser({
                email: testUser.email,
                password: testUser.password,
                email_confirm: true,
                user_metadata: { name: testUser.name, role: testUser.role }
            });

            if (createError) {
                console.error('계정 생성 실패:', createError.message);
                continue;
            }
            authUser = user;
            console.log('Auth 계정 생성 완료.');
        } else {
            console.log(`Auth에 ${testUser.email} 계정이 이미 존재합니다. 비밀번호를 업데이트합니다.`);
            const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(authUser.id, {
                password: testUser.password
            });
            if (updateError) {
                console.error('비밀번호 업데이트 실패:', updateError.message);
            }
        }

        // 2. public.users 테이블에 프로필 동기화
        console.log('public.users 테이블 프로필 동기화 중...');
        const { error: upsertError } = await supabaseAdmin
            .from('users')
            .upsert({
                id: authUser.id,
                email: testUser.email,
                name: testUser.name,
                role: testUser.role
            }, { onConflict: 'email' });

        if (upsertError) {
            console.error('프로필 동기화 실패:', upsertError.message);
        } else {
            console.log('프로필 동기화 완료.');
        }
    }

    console.log('\n✅ 모든 테스트 계정 설정이 완료되었습니다.');
}

setupUsers();
