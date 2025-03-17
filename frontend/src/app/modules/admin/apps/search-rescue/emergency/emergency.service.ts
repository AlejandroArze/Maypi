import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { EmergencyRequest } from './emergency.interface';
import { environment } from 'environments/environment';

@Injectable({
    providedIn: 'root'
})
export class EmergencyService {
    private apiUrl = environment.baseUrl + '/emergency';

    constructor(private _httpClient: HttpClient) {}

    // Método para generar datos de ejemplo con coordenadas variadas
    getEmergencyRequests(): Observable<EmergencyRequest[]> {
        const mockRequests: EmergencyRequest[] = [
            {
                id: '1',
                personCode: 'MAYPI-2023-001',
                location: {
                    address: 'Plaza Principal, Cochabamba',
                    coordinates: {
                        latitude: -17.3756912,
                        longitude: -66.1572645
                    }
                },
                timestamp: new Date('2023-12-15T10:30:00'),
                status: 'pending',
                emergencyType: 'missing',
                details: 'Persona desaparecida en plaza central'
            },
            {
                id: '2',
                personCode: 'MAYPI-2023-002',
                location: {
                    address: 'Terminal de Buses, La Paz',
                    coordinates: {
                        latitude: -16.4897,
                        longitude: -68.1193
                    }
                },
                timestamp: new Date('2023-12-15T11:45:00'),
                status: 'in-progress',
                emergencyType: 'help',
                details: 'Solicitud de ubicación en terminal'
            },
            {
                id: '3',
                personCode: 'MAYPI-2023-003',
                location: {
                    address: 'Mercado Central, Santa Cruz',
                    coordinates: {
                        latitude: -17.7833,
                        longitude: -63.1819
                    }
                },
                timestamp: new Date('2023-12-15T09:15:00'),
                status: 'resolved',
                emergencyType: 'danger',
                details: 'Situación de riesgo resuelta en mercado'
            },
            {
                id: '4',
                personCode: 'MAYPI-2023-004',
                location: {
                    address: 'Aeropuerto Internacional, Tarija',
                    coordinates: {
                        latitude: -21.5595,
                        longitude: -64.7092
                    }
                },
                timestamp: new Date('2023-12-15T12:00:00'),
                status: 'pending',
                emergencyType: 'medical',
                details: 'Emergencia médica en área de aeropuerto'
            }
        ];

        return of(mockRequests);
    }

    // Obtener detalles de una solicitud específica
    getEmergencyRequestById(id: string): Observable<EmergencyRequest> {
        return this._httpClient.get<EmergencyRequest>(`${this.apiUrl}/requests/${id}`);
    }

    // Actualizar estado de una solicitud
    updateEmergencyRequestStatus(id: string, status: string): Observable<EmergencyRequest> {
        // Simulación de actualización de estado
        return of({
            id: id,
            personCode: 'MAYPI-2023-001',
            location: {
                address: 'Plaza Principal, Cochabamba',
                coordinates: {
                    latitude: -17.3756912,
                    longitude: -66.1572645
                }
            },
            timestamp: new Date(),
            status: status as any,
            emergencyType: 'missing',
            details: 'Estado actualizado'
        });
    }
} 