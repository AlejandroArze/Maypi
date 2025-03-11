export interface MissingPersonCategory {
    id: string;
    slug: string;
    title: string;
}

export interface MissingPerson {
    id?: string;
    category_id?: string;
    category?: MissingPersonCategory;
    name?: string;
    email?: string;
    phone?: string;
    location?: string;
    latitude?: number;
    longitude?: number;
    date?: string | Date;
    description?: string;
    consent?: boolean;
    profile_image?: string;
    event_image?: string;
    status?: 'pending' | 'found' | 'urgent';
}

export interface MissingPersonPagination {
    length: number;
    page: number;
    size: number;
} 