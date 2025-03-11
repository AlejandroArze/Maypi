export interface SupportRequestCategory {
    id: string;
    slug: string;
    title: string;
}

export interface SupportRequest {
    id: string;
    category_id: string;
    category?: SupportRequestCategory;
    user_id?: string;
    name: string;
    email: string;
    phone?: string;
    subject: string;
    message: string;
    sent_at: Date;
    status: 'pending' | 'resolved' | 'urgent';
}

export interface SupportRequestPagination {
    length: number;
    page: number;
    size: number;
} 