export interface FaqCategory {
    id: string;
    slug: string;
    title: string;
}

export interface Faq {
    id: string;
    category_id: string;
    category?: FaqCategory;
    slug: string;
    title: string;
    question: string;
    answer: string;
    author_id?: string;
}

export interface FaqPagination {
    length: number;
    page: number;
    size: number;
} 