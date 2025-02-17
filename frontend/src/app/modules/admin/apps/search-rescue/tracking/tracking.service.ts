import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class TrackingService {
    constructor(private _httpClient: HttpClient) {}

    // Aquí irán los métodos para interactuar con el backend
} 