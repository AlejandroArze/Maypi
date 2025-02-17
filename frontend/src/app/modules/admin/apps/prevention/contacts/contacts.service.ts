import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'environments/environment';

@Injectable({
    providedIn: 'root'
})
export class ContactsService {
    private baseUrl = `${environment.baseUrl}/contacts`;

    constructor(private _httpClient: HttpClient) {}

    getContacts(): Observable<any[]> {
        return this._httpClient.get<any[]>(this.baseUrl);
    }

    addContact(contact: any): Observable<any> {
        return this._httpClient.post<any>(this.baseUrl, contact);
    }

    updateContact(id: string, contact: any): Observable<any> {
        return this._httpClient.put<any>(`${this.baseUrl}/${id}`, contact);
    }

    deleteContact(id: string): Observable<void> {
        return this._httpClient.delete<void>(`${this.baseUrl}/${id}`);
    }
} 