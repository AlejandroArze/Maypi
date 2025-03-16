export interface SearchOperation {
    id: string;
    name: string;
    status: 'active' | 'paused' | 'completed';
    startDate: Date;
    endDate?: Date;
    description?: string;
    teamMembers?: string[];
} 