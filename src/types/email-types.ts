export interface EmailMessage {
    id?: string;
    to: string[];
    cc?: string[];
    bcc?: string[];
    from?: string;
    subject: string;
    body_html: string;
    body_text?: string;
    attachments?: EmailAttachment[];
    sent_at?: string;
    opened_at?: string;
    clicked?: boolean;
    thread_id?: string;
}

export interface EmailAttachment {
    filename: string;
    content_type: string;
    size_bytes: number;
    url?: string;
    data?: string; // Base64 encoded for sending
}

export interface EmailTemplate {
    id: string;
    name: string;
    subject: string;
    body: string;
    category: string | null;
    variables: string[]; // e.g., ['customer_name', 'invoice_number']
    active: boolean;
    created_at: string;
    updated_at: string;
}

export interface EmailCampaign {
    id: string;
    name: string;
    template_id: string | null;
    status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'cancelled';
    scheduled_date: string | null;
    sent_date: string | null;
    recipient_count: number;
    opened_count: number;
    clicked_count: number;
    bounced_count: number;
    created_at: string;
    template?: EmailTemplate;
}

export interface CampaignRecipient {
    id: string;
    campaign_id: string;
    customer_id: string;
    sent_at: string | null;
    opened_at: string | null;
    clicked_at: string | null;
    bounced: boolean;
}

export interface EmailTemplateVariable {
    key: string;
    label: string;
    example: string;
    description?: string;
}

// Available template variables for interpolation
export const EMAIL_VARIABLES: EmailTemplateVariable[] = [
    {
        key: 'customer_name',
        label: 'Customer Name',
        example: 'Paws & Claws Pet Store',
        description: 'The store name of the customer'
    },
    {
        key: 'customer_email',
        label: 'Customer Email',
        example: 'contact@pawsandclaws.com'
    },
    {
        key: 'contact_name',
        label: 'Contact Name',
        example: 'John Smith',
        description: 'Primary contact person name'
    },
    {
        key: 'invoice_number',
        label: 'Invoice Number',
        example: 'INV-2024-001'
    },
    {
        key: 'invoice_total',
        label: 'Invoice Total',
        example: '$1,250.00'
    },
    {
        key: 'invoice_due_date',
        label: 'Invoice Due Date',
        example: 'December 15, 2024'
    },
    {
        key: 'tracking_number',
        label: 'Tracking Number',
        example: '1Z999AA10123456789'
    },
    {
        key: 'shipment_carrier',
        label: 'Shipping Carrier',
        example: 'Purolator'
    },
    {
        key: 'estimated_delivery',
        label: 'Estimated Delivery',
        example: 'December 12, 2024'
    },
    {
        key: 'deal_title',
        label: 'Deal Title',
        example: 'Q4 Bulk Order - 500 units'
    },
    {
        key: 'deal_value',
        label: 'Deal Value',
        example: '$5,000.00'
    },
    {
        key: 'task_title',
        label: 'Task Title',
        example: 'Follow up on pricing inquiry'
    },
    {
        key: 'task_due_date',
        label: 'Task Due Date',
        example: 'Tomorrow at 2:00 PM'
    }
];
