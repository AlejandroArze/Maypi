import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { PanicRequest } from './panic.interface';
import { environment } from 'environments/environment';

@Injectable({
    providedIn: 'root'
})
export class PanicService {
    private apiUrl = environment.baseUrl + '/panic';

    constructor(private _httpClient: HttpClient) {}

    // Método para generar datos de ejemplo con coordenadas variadas
    getPanicRequests(): Observable<PanicRequest[]> {
        const mockRequests: PanicRequest[] = [
            {
                id: '1',
                personCode: 'PANIC-2023-001',
                location: {
                    address: 'Plaza Principal, Cochabamba',
                    coordinates: {
                        latitude: -17.3756912,
                        longitude: -66.1572645
                    }
                },
                timestamp: new Date('2023-12-15T10:30:00'),
                status: 'urgent',
                details: 'Solicitud de emergencia urgente en plaza central'
            },
            {
                id: '2',
                personCode: 'PANIC-2023-002',
                location: {
                    address: 'Terminal de Buses, La Paz',
                    coordinates: {
                        latitude: -16.4897,
                        longitude: -68.1193
                    }
                },
                timestamp: new Date('2023-12-15T11:45:00'),
                status: 'pending',
                details: 'Solicitud de ayuda en terminal'
            },
            {
                id: '3',
                personCode: 'PANIC-2023-003',
                location: {
                    address: 'Mercado Central, Santa Cruz',
                    coordinates: {
                        latitude: -17.7833,
                        longitude: -63.1819
                    }
                },
                timestamp: new Date('2023-12-15T09:15:00'),
                status: 'resolved',
                details: 'Situación de emergencia resuelta en mercado'
            },
            {
                id: '4',
                personCode: 'PANIC-2023-004',
                location: {
                    address: 'Aeropuerto Internacional, Tarija',
                    coordinates: {
                        latitude: -21.5595,
                        longitude: -64.7092
                    }
                },
                timestamp: new Date('2023-12-15T12:00:00'),
                status: 'pending',
                details: 'Emergencia en área de aeropuerto'
            }
        ];

        return of(mockRequests);
    }

    // Método para actualizar el estado de una solicitud
    updatePanicRequestStatus(id: string, status: string): Observable<PanicRequest> {
        // Simulación de actualización de estado
        return of({
            id: id,
            personCode: 'PANIC-2023-001',
            location: {
                address: 'Plaza Principal, Cochabamba',
                coordinates: {
                    latitude: -17.3756912,
                    longitude: -66.1572645
                }
            },
            timestamp: new Date(),
            status: status as any,
            details: 'Estado actualizado'
        });
    }
} 