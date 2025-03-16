export interface TrackingLocation {
    id: string;
    timestamp: Date;
    latitude: number;
    longitude: number;
    trackingCode: string;
    description?: string;
    accuracy?: number;
} 