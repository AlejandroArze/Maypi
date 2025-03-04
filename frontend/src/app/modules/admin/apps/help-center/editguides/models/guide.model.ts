export interface GuideCategory {
    id: string;
    slug: string;
    title: string;
}

export interface Guide {
    id: string;
    category_id: string;
    category?: GuideCategory;
    author_id?: string;
    slug: string;
    title: string;
    subtitle: string;
    content: string;
}

export interface GuidePagination {
    length: number;
    page: number;
    size: number;
} 