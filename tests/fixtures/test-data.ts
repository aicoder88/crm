// Test data fixtures for consistent testing

export const testCustomers = [
    {
        store_name: 'Paws & Claws Pet Store',
        email: 'orders@pawsandclaws.com',
        phone: '(416) 555-0123',
        city: 'Toronto',
        province: 'ON',
        postal_code: 'M5V 2T6',
        status: 'Qualified',
        type: 'B2B'
    },
    {
        store_name: 'Happy Tails Boutique',
        email: 'info@happytails.ca',
        phone: '(604) 555-0456',
        city: 'Vancouver',
        province: 'BC',
        postal_code: 'V6B 1A1',
        status: 'Interested',
        type: 'B2B'
    },
    {
        store_name: 'Fluffy Friends Shop',
        email: 'sales@fluffyfriends.ca',
        phone: '(514) 555-0789',
        city: 'Montreal',
        province: 'QC',
        postal_code: 'H3A 1A1',
        status: 'Qualified',
        type: 'B2B'
    }
];

export const testProducts = [
    {
        sku: 'CAT-001',
        name: 'Premium Cat Food - Salmon',
        description: 'High-quality salmon-based cat food',
        unit_price: 25.99,
        active: true
    },
    {
        sku: 'DOG-001',
        name: 'Dog Chew Toy',
        description: 'Durable rubber chew toy for dogs',
        unit_price: 12.50,
        active: true
    },
    {
        sku: 'BIRD-001',
        name: 'Bird Seed Mix',
        description: 'Premium mixed bird seed',
        unit_price: 18.75,
        active: true
    }
];

export const testDeals = [
    {
        title: 'Sample Order - Paws & Claws',
        value: 1500.00,
        stage: 'Sample Sent',
        probability: 40,
        expected_close_date: '2024-12-31',
        notes: 'Sent product samples, waiting for feedback'
    },
    {
        title: 'Bulk Order - Happy Tails',
        value: 3200.00,
        stage: 'Negotiating Terms',
        probability: 80,
        expected_close_date: '2024-11-30',
        notes: 'Negotiating volume discount pricing'
    }
];

export const testInvoices = [
    {
        customer_id: '', // Will be filled with actual customer ID
        items: [
            {
                product_sku: 'CAT-001',
                description: 'Premium Cat Food - Salmon',
                quantity: 10,
                unit_price: 25.99,
                total: 259.90
            },
            {
                product_sku: 'DOG-001',
                description: 'Dog Chew Toy',
                quantity: 5,
                unit_price: 12.50,
                total: 62.50
            }
        ],
        subtotal: 322.40,
        tax: 41.91,
        total: 364.31,
        due_date: '2024-12-31',
        notes: 'Thank you for your business!'
    }
];

export const testEmailTemplates = [
    {
        name: 'Welcome New Customer',
        subject: 'Welcome to Purrify, {{customer_name}}!',
        body: `
            <h1>Welcome {{customer_name}}!</h1>
            <p>Thank you for joining our community of pet retailers. We're excited to work with you!</p>
            <p>Your account has been set up and you can now:</p>
            <ul>
                <li>Browse our product catalog</li>
                <li>Place orders online</li>
                <li>Track shipments</li>
                <li>Access your invoices</li>
            </ul>
            <p>If you have any questions, don't hesitate to reach out.</p>
            <p>Best regards,<br>The Purrify Team</p>
        `,
        category: 'onboarding',
        variables: ['customer_name']
    },
    {
        name: 'Order Follow-up',
        subject: 'How was your recent order?',
        body: `
            <p>Hi {{contact_name}},</p>
            <p>We wanted to follow up on your recent order ({{order_number}}) and make sure everything arrived in perfect condition.</p>
            <p>Your feedback is important to us. If you have any concerns or suggestions, please let us know.</p>
            <p>We look forward to serving you again soon!</p>
            <p>Best regards,<br>{{sender_name}}</p>
        `,
        category: 'follow-up',
        variables: ['contact_name', 'order_number', 'sender_name']
    }
];

export const testUsers = {
    valid: {
        email: process.env.TEST_EMAIL || 'test@purrify.ca',
        password: process.env.TEST_PASSWORD || 'TestPassword123!'
    },
    invalid: {
        email: 'invalid@example.com',
        password: 'wrongpassword'
    }
};

// Helper functions for test data
export function generateRandomCustomer() {
    const timestamp = Date.now();
    return {
        store_name: `Test Pet Store ${timestamp}`,
        email: `test${timestamp}@example.com`,
        phone: '(416) 555-0123',
        city: 'Toronto',
        province: 'ON',
        postal_code: 'M5V 2T6',
        status: 'Qualified',
        type: 'B2B'
    };
}

export function generateRandomDeal(customerId: string) {
    const timestamp = Date.now();
    return {
        title: `Test Deal ${timestamp}`,
        customer_id: customerId,
        value: Math.floor(Math.random() * 5000) + 500,
        stage: 'Reply/Interest',
        probability: 25,
        expected_close_date: '2024-12-31',
        notes: `Generated test deal ${timestamp}`
    };
}

export function generateRandomProduct() {
    const timestamp = Date.now();
    return {
        sku: `TEST-${timestamp}`,
        name: `Test Product ${timestamp}`,
        description: `Test product description ${timestamp}`,
        unit_price: Math.floor(Math.random() * 100) + 10,
        active: true
    };
}