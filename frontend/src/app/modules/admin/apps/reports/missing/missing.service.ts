import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'environments/environment';

@Injectable({
    providedIn: 'root'
})
export class MissingService {
    private baseUrl = `${environment.baseUrl}/missing`;

    constructor(private _httpClient: HttpClient) {}

    reportMissing(data: any): Observable<any> {
        return this._httpClient.post<any>(this.baseUrl, data);
    }

    // Otros métodos que podrían ser necesarios
    getMissingReports(): Observable<any[]> {
        return this._httpClient.get<any[]>(this.baseUrl);
    }

    getMissingReport(id: string): Observable<any> {
        return this._httpClient.get<any>(`${this.baseUrl}/${id}`);
    }

    updateMissingReport(id: string, data: any): Observable<any> {
        return this._httpClient.put<any>(`${this.baseUrl}/${id}`, data);
    }

    deleteMissingReport(id: string): Observable<void> {
        return this._httpClient.delete<void>(`${this.baseUrl}/${id}`);
    }
} 