export interface EmergencyRequest {
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
    status: 'pending' | 'in-progress' | 'resolved' | 'cancelled';
    emergencyType: 'missing' | 'help' | 'medical' | 'danger';
    details?: string;
}

export interface EmergencyContact {
    id: string;
    name: string;
    relationship: string;
    phoneNumber: string;
    email?: string;
    priority: number;
} 