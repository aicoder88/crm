export interface Customer {
    id: string;
    created_at: string;
    updated_at: string;
    store_name: string;
    email: string | null;
    phone: string | null;
    owner_manager_name: string | null;
    type: 'B2B' | 'B2C' | 'Affiliate';
    status: 'Qualified' | 'Interested' | 'Not Qualified' | 'Not Interested' | 'Dog Store';
    notes: string | null;
    province: string | null;
    city: string | null;
    street: string | null;
    postal_code: string | null;
    location_lat: number | null;
    location_lng: number | null;
    website: string | null;
    stripe_customer_id: string | null;
    tags?: Tag[];
    social_media?: CustomerSocialMedia[];
    contacts?: CustomerContact[];
}

export type ShipmentStatus =
    | 'pending'
    | 'label_created'
    | 'picked_up'
    | 'in_transit'
    | 'out_for_delivery'
    | 'delivered'
    | 'exception'
    | 'cancelled'
    | 'returned';

export interface Tag {
    id: string;
    name: string;
    color: string;
    created_at: string;
}

export interface CustomerSocialMedia {
    id: string;
    customer_id: string;
    platform: 'facebook' | 'instagram' | 'tiktok' | 'youtube';
    url: string;
    created_at: string;
}

export interface CustomerContact {
    id: string;
    customer_id: string;
    name: string;
    role: string | null;
    email: string | null;
    phone: string | null;
    is_primary: boolean;
    created_at: string;
}

export interface TimelineEvent {
    id: string;
    customer_id: string;
    type: 'call' | 'email' | 'note' | 'invoice' | 'shipment' | 'deal';
    created_at: string;
    user_id: string | null;
    call_duration_minutes: number | null;
    call_outcome: string | null;
    call_follow_up_date: string | null;
    email_subject: string | null;
    email_opened: boolean | null;
    email_thread_id: string | null;
    email_message_id: string | null;
    email_sent_to: string | null;
    email_sent_from: string | null;
    email_attachment_count: number | null;
    email_clicked: boolean | null;
    deal_stage: string | null;
    deal_value: number | null;
    note_category: string | null;
    data: any;
}

export interface Call {
    id: string;
    customer_id: string;
    date: string;
    duration_minutes: number | null;
    notes: string | null;
    outcome: string | null;
    follow_up_date: string | null;
    created_at: string;
}

export interface Task {
    id: string;
    customer_id: string | null;
    type: 'call' | 'email' | 'follow_up' | 'other';
    title: string;
    due_date: string;
    priority: 'low' | 'medium' | 'high';
    status: 'pending' | 'completed' | 'cancelled';
    notes: string | null;
    reminder_time: string | null;
    reminder_sent: boolean;
    created_at: string;
    completed_at: string | null;
}

export interface DealStage {
    id: string;
    name: string;
    order_index: number;
    win_probability: number;
    created_at: string;
}

export interface Deal {
    id: string;
    customer_id: string;
    title: string;
    value: number | null;
    stage: string;
    probability: number | null;
    expected_close_date: string | null;
    notes: string | null;
    created_at: string;
    updated_at: string;
    closed_at: string | null;
    customer?: {
        store_name: string;
    };
}

export interface Product {
    id: string;
    sku: string;
    name: string;
    description: string | null;
    unit_price: number;
    currency: string;
    active: boolean;
    stripe_price_id: string | null;
    created_at: string;
    updated_at: string;
}

export interface Invoice {
    id: string;
    customer_id: string;
    invoice_number: string;
    order_number: string | null;
    stripe_invoice_id: string | null;
    subtotal: number;
    tax: number;
    shipping: number;
    discount: number;
    total: number;
    amount: number; // Legacy field for backward compatibility
    currency: string;
    status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
    due_date: string | null;
    sent_date: string | null;
    paid_date: string | null;
    pdf_url: string | null;
    notes: string | null;
    created_at: string;
    customer?: {
        store_name: string;
        email: string | null;
    };
    items?: InvoiceItem[];
    shipments?: Shipment[];
}

export interface InvoiceItem {
    id: string;
    invoice_id: string;
    product_sku: string | null;
    description: string | null;
    quantity: number;
    unit_price: number;
    total: number;
    created_at: string;
    product?: Product;
}

export interface Shipment {
    id: string;
    customer_id: string;
    invoice_id: string | null;
    order_number: string | null;
    carrier: string;
    tracking_number: string | null;
    status: ShipmentStatus;
    shipped_date: string | null;
    delivered_date: string | null;
    estimated_delivery_date: string | null;
    actual_weight: number | null;
    billed_weight: number | null;
    shipping_cost: number | null;
    label_url: string | null;
    package_count: number;
    dimensions_length: number | null;
    dimensions_width: number | null;
    dimensions_height: number | null;
    service_level: string | null;
    notes: string | null;
    created_at: string;
    customer?: {
        store_name: string;
        city: string | null;
        province: string | null;
    };
    invoice?: {
        invoice_number: string;
    };
    events?: ShipmentEvent[];
}

export interface ShipmentEvent {
    id: string;
    shipment_id: string;
    status: string;
    message: string | null;
    location: string | null;
    timestamp: string;
}

export interface ShippingRate {
    carrier: string;
    service_level: string;
    cost: number;
    estimated_days: number;
    currency: string;
}
