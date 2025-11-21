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
    created_at: string;
    completed_at: string | null;
}
