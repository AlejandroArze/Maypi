import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
    providedIn: 'root'
})
export class PossibleMissingService {
    constructor(private _httpClient: HttpClient) {}

    // Aquí irán los métodos para manejar la información de posibles desaparecidos
} 