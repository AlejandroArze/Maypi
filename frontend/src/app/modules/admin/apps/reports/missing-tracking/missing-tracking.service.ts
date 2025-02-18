import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from 'environments/environment';

export interface MissingCase {
    id: string;
    name: string;
    age: number;
    lastSeen: string;
    location: string;
    status: 'active' | 'found' | 'investigating';
    lastUpdate: string;
    description: string;
    imageUrl?: string;
    contactInfo: string;
}

@Injectable({
    providedIn: 'root'
})
export class MissingTrackingService {
    private baseUrl = `${environment.baseUrl}/missing-tracking`;

    constructor(private _httpClient: HttpClient) {}

    // Obtener todos los casos
    getCases(): Observable<MissingCase[]> {
        // Simulación de datos - Reemplazar con llamada real al API
        return of([
            {
                id: 'CASE-001',
                name: 'Juan Pérez',
                age: 25,
                lastSeen: '2024-03-15',
                location: 'Plaza Principal, Cochabamba',
                status: 'active',
                lastUpdate: '2024-03-20',
                description: 'Última vez visto con jeans azules y camisa blanca',
                imageUrl: 'assets/images/avatars/male-01.jpg',
                contactInfo: '+591 70000001'
            },
            {
                id: 'CASE-002',
                name: 'María García',
                age: 17,
                lastSeen: '2024-03-18',
                location: 'Zona Norte, Cochabamba',
                status: 'investigating',
                lastUpdate: '2024-03-21',
                description: 'Estudiante de secundaria, uniforme escolar',
                imageUrl: 'assets/images/avatars/female-01.jpg',
                contactInfo: '+591 70000002'
            },
            {
                id: 'CASE-003',
                name: 'Carlos Rodríguez',
                age: 32,
                lastSeen: '2024-03-10',
                location: 'Zona Sud, Cochabamba',
                status: 'found',
                lastUpdate: '2024-03-22',
                description: 'Encontrado sano y salvo',
                imageUrl: 'assets/images/avatars/male-02.jpg',
                contactInfo: '+591 70000003'
            }
        ]);
    }

    // Obtener un caso específico
    getCase(id: string): Observable<MissingCase> {
        return this._httpClient.get<MissingCase>(`${this.baseUrl}/${id}`);
    }

    // Actualizar estado de un caso
    updateCaseStatus(id: string, status: string): Observable<any> {
        return this._httpClient.patch(`${this.baseUrl}/${id}/status`, { status });
    }

    // Agregar actualización a un caso
    addUpdate(id: string, update: any): Observable<any> {
        return this._httpClient.post(`${this.baseUrl}/${id}/updates`, update);
    }
} 