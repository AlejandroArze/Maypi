import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class PanicService {
    constructor(private _httpClient: HttpClient) {}

    // Método para obtener las solicitudes de pánico
    getPanicRequests(): Observable<any[]> {
        // Implementar la llamada al API
        return this._httpClient.get<any[]>('/api/panic-requests');
    }

    // Método para actualizar el estado de una solicitud
    updatePanicRequest(id: string, status: string): Observable<any> {
        return this._httpClient.put(`/api/panic-requests/${id}`, { status });
    }
} 