export interface PanicRequest {
    id: string;
    personCode: string;
    location: {
        address: string;
        coordinates: {
            latitude: number;
            longitude: number;
        }
    };
    timestamp: Date;
    status: 'urgent' | 'pending' | 'resolved';
    details?: string;
} 