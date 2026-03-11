import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function createAdmin() {
    console.log('Creating admin user...');
    const { data, error } = await supabase
        .from('users')
        .insert([
            {
                email: 'admin@eveningdeals.com',
                name: 'Admin User',
                role: 'manager'
            }
        ])
        .select();

    if (error) {
        if (error.code === '23505') { // Unique constraint violation (already exists)
            console.log('Admin already exists. Continuing...');
            const { data: existingUser } = await supabase.from('users').select('id').eq('email', 'admin@eveningdeals.com').single();
            await createStore(existingUser.id);
        } else {
            console.error('Error creating admin:', error);
        }
    } else {
        console.log('Admin created successfully:', data);
        await createStore(data[0].id);
    }
}

async function createStore(adminId) {
    console.log('Creating store for admin:', adminId);
    const { data: storeData, error: storeError } = await supabase
        .from('stores')
        .insert([
            {
                owner_id: adminId,
                name: '이븐데일 마트 (본점)',
                address: '경상남도 김해시 지내동',
                category: 'mart'
            }
        ])
        .select();

    if (storeError) {
        if (storeError.code === '23505') {
            console.log('Store already exists for this owner.');
        } else {
            console.error('Error creating store:', storeError);
        }
    } else {
        console.log('Store created successfully:', storeData);
    }
}

createAdmin();
