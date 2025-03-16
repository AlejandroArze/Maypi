import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { TrackingLocation } from '../models/tracking-location.model';
import { SearchOperation } from '../models/search-operation.model';

@Injectable({
    providedIn: 'root'
})
export class TrackingService {
    constructor(private http: HttpClient) {}

    // Método para obtener ubicaciones de ejemplo
    getMockLocations(): Observable<TrackingLocation[]> {
        const mockLocations: TrackingLocation[] = [
            {
                id: '1', 
                trackingCode: 'SR-001',
                latitude: -17.375751,
                longitude: -66.1580363,
                timestamp: new Date(),
                description: 'Ubicación de búsqueda en zona montañosa'
            },
            {
                id: '2',
                timestamp: new Date('2024-02-15T10:30:00'),
                latitude: -34.6037,
                longitude: -58.3816,
                trackingCode: 'RES-001',
                description: 'Punto de inicio de búsqueda'
            },
            {
                id: '3',
                timestamp: new Date('2024-02-15T10:45:00'),
                latitude: -34.6050,
                longitude: -58.3830,
                trackingCode: 'RES-001',
                description: 'Movimiento hacia el área de búsqueda'
            },
            {
                id: '4',
                timestamp: new Date('2024-02-15T11:00:00'),
                latitude: -34.6075,
                longitude: -58.3850,
                trackingCode: 'RES-001',
                description: 'Exploración inicial del terreno'
            },
            {
                id: '5',
                timestamp: new Date('2024-02-15T11:15:00'),
                latitude: -34.6100,
                longitude: -58.3875,
                trackingCode: 'RES-002',
                description: 'Equipo secundario en posición'
            },
            {
                id: '6',
                timestamp: new Date('2024-02-15T11:30:00'),
                latitude: -34.6125,
                longitude: -58.3900,
                trackingCode: 'RES-002',
                description: 'Rastreo de zona específica'
            },
            {
                id: '7',
                trackingCode: 'SR-002',
                latitude: -34.6037,
                longitude: -58.3816,
                timestamp: new Date(),
                description: 'Operación en Buenos Aires'
            },
            {   
                id: '8',
                trackingCode: 'SR-003',
                latitude: -33.4489,
                longitude: -70.6693,
                timestamp: new Date(),
                description: 'Seguimiento en Santiago de Chile'
            }
        ];

        return of(mockLocations);
    }

    // Método para obtener ubicaciones reales (futuro)
    getTrackingLocations(trackingCode?: string, startDate?: Date, endDate?: Date): Observable<TrackingLocation[]> {
        // En el futuro, este método hará una llamada a la API real
        return this.getMockLocations();
    }

    // Método para obtener operaciones activas
    getActiveOperations(): Observable<SearchOperation[]> {
        const mockOperations: SearchOperation[] = [
            {
                id: 'OPS-001',
                name: 'Búsqueda en Zona Norte',
                status: 'active',
                startDate: new Date('2024-02-15'),
                description: 'Operación de búsqueda en área urbana',
                teamMembers: ['Equipo A', 'Equipo B']
            },
            {
                id: 'OPS-002',
                name: 'Rescate en Zona Rural',
                status: 'paused',
                startDate: new Date('2024-02-14'),
                description: 'Operación de rescate en terreno difícil',
                teamMembers: ['Equipo C']
            }
        ];

        return of(mockOperations);
    }

    // Método para actualizar el estado de una operación
    updateOperationStatus(operationId: string, newStatus: string): Observable<SearchOperation> {
        // Simulación de actualización de estado
        return of({
            id: operationId,
            name: 'Operación de Ejemplo',
            status: newStatus as 'active' | 'paused' | 'completed',
            startDate: new Date()
        });
    }
} 