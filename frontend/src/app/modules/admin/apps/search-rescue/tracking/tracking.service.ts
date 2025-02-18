import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from 'environments/environment';

export interface SearchOperation {
    id: string;
    missingPersonName: string;
    startDate: string;
    status: 'active' | 'paused' | 'completed';
    location: {
        name: string;
        coordinates: {
            lat: number;
            lng: number;
        }
    };
    teamMembers: {
        id: string;
        name: string;
        role: string;
        status: 'available' | 'deployed' | 'resting';
        lastUpdate: string;
        currentLocation?: {
            lat: number;
            lng: number;
        }
    }[];
    updates: {
        timestamp: string;
        message: string;
        type: 'info' | 'alert' | 'success';
        author: string;
    }[];
    resources: {
        type: string;
        quantity: number;
        status: 'available' | 'deployed' | 'needed';
    }[];
    weatherConditions: {
        temperature: number;
        conditions: string;
        visibility: string;
    };
}

@Injectable({
    providedIn: 'root'
})
export class TrackingService {
    private baseUrl = `${environment.baseUrl}/search-rescue/tracking`;

    constructor(private _httpClient: HttpClient) {}

    // Obtener todas las operaciones activas
    getActiveOperations(): Observable<SearchOperation[]> {
        // Simulación de datos - Reemplazar con llamada real al API
        return of([
            {
                id: 'OP-001',
                missingPersonName: 'Ana Martínez',
                startDate: '2024-03-20T08:00:00',
                status: 'active',
                location: {
                    name: 'Parque Nacional Tunari, Sector Norte',
                    coordinates: {
                        lat: -17.2834,
                        lng: -66.1377
                    }
                },
                teamMembers: [
                    {
                        id: 'TM-001',
                        name: 'Carlos López',
                        role: 'Líder de Búsqueda',
                        status: 'deployed',
                        lastUpdate: '2024-03-20T10:30:00',
                        currentLocation: {
                            lat: -17.2840,
                            lng: -66.1380
                        }
                    },
                    {
                        id: 'TM-002',
                        name: 'Laura Sánchez',
                        role: 'Rescatista',
                        status: 'deployed',
                        lastUpdate: '2024-03-20T10:25:00',
                        currentLocation: {
                            lat: -17.2838,
                            lng: -66.1375
                        }
                    }
                ],
                updates: [
                    {
                        timestamp: '2024-03-20T09:00:00',
                        message: 'Inicio de operación de búsqueda',
                        type: 'info',
                        author: 'Carlos López'
                    },
                    {
                        timestamp: '2024-03-20T10:15:00',
                        message: 'Se encontraron huellas recientes en sector norte',
                        type: 'alert',
                        author: 'Laura Sánchez'
                    }
                ],
                resources: [
                    {
                        type: 'Drones',
                        quantity: 2,
                        status: 'deployed'
                    },
                    {
                        type: 'Vehículos 4x4',
                        quantity: 3,
                        status: 'available'
                    },
                    {
                        type: 'Equipos de Primeros Auxilios',
                        quantity: 4,
                        status: 'deployed'
                    }
                ],
                weatherConditions: {
                    temperature: 18,
                    conditions: 'Parcialmente nublado',
                    visibility: 'Buena'
                }
            }
        ]);
    }

    // Obtener detalles de una operación específica
    getOperationDetails(id: string): Observable<SearchOperation> {
        return this._httpClient.get<SearchOperation>(`${this.baseUrl}/operations/${id}`);
    }

    // Actualizar estado de una operación
    updateOperationStatus(id: string, status: string): Observable<any> {
        return this._httpClient.patch(`${this.baseUrl}/operations/${id}/status`, { status });
    }

    // Agregar actualización a una operación
    addOperationUpdate(id: string, update: any): Observable<any> {
        return this._httpClient.post(`${this.baseUrl}/operations/${id}/updates`, update);
    }

    // Actualizar ubicación de un miembro del equipo
    updateTeamMemberLocation(operationId: string, memberId: string, location: any): Observable<any> {
        return this._httpClient.patch(
            `${this.baseUrl}/operations/${operationId}/team-members/${memberId}/location`, 
            location
        );
    }
} 