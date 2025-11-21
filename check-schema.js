const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://obqapfrjrbvniizlzhbz.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'sb_secret_wUNFcsTuea5W7nkVKxaEiw_H4NutsyT';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTables() {
    console.log('Checking for existing tables...');

    const tablesToCheck = ['tags', 'customer_contacts', 'customer_tags', 'customer_social_media'];
    const results = {};

    for (const table of tablesToCheck) {
        const column = table === 'customer_tags' ? 'customer_id' : 'id';
        const { error } = await supabase.from(table).select(column).limit(1);
        if (error) {
            console.log(`Table '${table}': NOT FOUND (or error: ${error.message})`);
            results[table] = false;
        } else {
            console.log(`Table '${table}': FOUND`);
            results[table] = true;
        }
    }

    // Also check if customers table has 'tags' column (array) or if it's been removed
    // We can't easily check columns via JS client without inspecting a row's structure if it returns data, 
    // or we just assume based on the plan. 
    // But let's check if we can fetch a customer and see the 'tags' field.
    const { data: customers, error: custError } = await supabase.from('customers').select('*').limit(1);
    if (customers && customers.length > 0) {
        const customer = customers[0];
        console.log('Customer sample keys:', Object.keys(customer));
        if ('tags' in customer) {
            console.log(`Column 'tags' in 'customers': FOUND (Value type: ${typeof customer.tags})`);
        } else {
            console.log(`Column 'tags' in 'customers': NOT FOUND`);
        }
    } else {
        console.log('Could not fetch customers to check columns.');
    }
}

checkTables();
