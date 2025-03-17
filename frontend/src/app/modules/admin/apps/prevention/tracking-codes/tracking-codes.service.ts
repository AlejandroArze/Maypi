import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'environments/environment';

@Injectable({
    providedIn: 'root'
})
export class TrackingCodesService {
    private baseUrl = `${environment.baseUrl}/tracking-codes`;

    constructor(private _httpClient: HttpClient) {}

    getTrackingCodes(): Observable<any[]> {
        return this._httpClient.get<any[]>(this.baseUrl);
    }

    addTrackingCode(trackingCode: any): Observable<any> {
        return this._httpClient.post<any>(this.baseUrl, trackingCode);
    }

    updateTrackingCode(id: string, trackingCode: any): Observable<any> {
        return this._httpClient.put<any>(`${this.baseUrl}/${id}`, trackingCode);
    }

    deleteTrackingCode(id: string): Observable<void> {
        return this._httpClient.delete<void>(`${this.baseUrl}/${id}`);
    }
} 