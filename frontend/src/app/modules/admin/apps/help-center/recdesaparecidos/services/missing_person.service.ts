import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { MissingPerson, MissingPersonCategory, MissingPersonPagination } from '../models/missing_person.model';
import { v4 as uuidv4 } from 'uuid';

@Injectable({
    providedIn: 'root'
})
export class MissingPersonService {
    private _missingPersons: BehaviorSubject<MissingPerson[]> = new BehaviorSubject<MissingPerson[]>([]);
    private _categories: BehaviorSubject<MissingPersonCategory[]> = new BehaviorSubject<MissingPersonCategory[]>([]);
    private _pagination: BehaviorSubject<MissingPersonPagination> = new BehaviorSubject<MissingPersonPagination>({
        length: 0,
        page: 0,
        size: 10
    });

    private _allMissingPersons: MissingPerson[] = [];

    constructor() {
        this._initializeMockData();
    }

    // Método para obtener coordenadas de ejemplo
    private _getCoordinatesForLocation(location: string): { latitude: number, longitude: number } {
        // Coordenadas de ejemplo para diferentes ciudades de Chile
        const locationCoordinates: { [key: string]: { latitude: number, longitude: number } } = {
            'Santiago': { latitude: -33.4489, longitude: -70.6693 },
            'Valparaíso': { latitude: -33.0472, longitude: -71.6127 },
            'Concepción': { latitude: -36.8260, longitude: -73.0419 },
            'Viña del Mar': { latitude: -33.0245, longitude: -71.5518 },
            'Ciudad 1': { latitude: -33.4724, longitude: -70.6470 },
            'Ciudad 2': { latitude: -36.8260, longitude: -73.0419 },
            'Ciudad 3': { latitude: -33.0472, longitude: -71.6127 }
        };

        // Buscar coincidencias parciales
        const matchedLocation = Object.keys(locationCoordinates).find(key => 
            location.toLowerCase().includes(key.toLowerCase())
        );

        return matchedLocation 
            ? locationCoordinates[matchedLocation] 
            : { latitude: -33.4489, longitude: -70.6693 }; // Coordenadas por defecto de Santiago
    }

    private _initializeMockData(): void {
        const categories: MissingPersonCategory[] = [
            { id: uuidv4(), slug: 'ninos', title: 'Niños' },
            { id: uuidv4(), slug: 'jovenes', title: 'Jóvenes' },
            { id: uuidv4(), slug: 'adultos', title: 'Adultos' }
        ];

        const missingPersons: MissingPerson[] = [];
        for (let i = 1; i <= 50; i++) {
            const location = `Ubicación ${i}, Ciudad ${i % 3 + 1}`;
            const { latitude, longitude } = this._getCoordinatesForLocation(location);

            missingPersons.push({
                id: uuidv4(),
                category_id: categories[i % 3].id,
                category: categories[i % 3],
                name: `Persona Desaparecida ${i}`,
                email: `persona${i}@example.com`,
                phone: `+569${Math.floor(10000000 + Math.random() * 90000000)}`,
                location: location,
                latitude: latitude,
                longitude: longitude,
                date: new Date(),
                description: `Descripción detallada de la persona desaparecida número ${i}`,
                consent: true,
                profile_image: '',
                event_image: '',
                status: ['pending', 'found', 'urgent'][i % 3] as 'pending' | 'found' | 'urgent'
            });
        }

        this._allMissingPersons = missingPersons;
        this._categories.next(categories);
        this._updateMissingPersonsAndPagination(0, 10);
    }

    private _updateMissingPersonsAndPagination(page: number, pageSize: number): void {
        const startIndex = page * pageSize;
        const endIndex = startIndex + pageSize;
        const paginatedMissingPersons = this._allMissingPersons.slice(startIndex, endIndex);

        this._missingPersons.next(paginatedMissingPersons);
        this._pagination.next({
            length: this._allMissingPersons.length,
            page: page,
            size: pageSize
        });
    }

    get missingPersons$(): Observable<MissingPerson[]> {
        return this._missingPersons.asObservable();
    }

    get categories$(): Observable<MissingPersonCategory[]> {
        return this._categories.asObservable();
    }

    get pagination$(): Observable<MissingPersonPagination> {
        return this._pagination.asObservable();
    }

    createMissingPerson(): Observable<MissingPerson> {
        const userStr = localStorage.getItem('user');
        const user = userStr ? JSON.parse(userStr) : null;

        const newMissingPerson: MissingPerson = {
            id: uuidv4(),
            category_id: this._categories.value[0].id,
            category: this._categories.value[0],
            name: 'Nuevo Reporte',
            email: '',
            phone: '',
            location: '',
            date: new Date(),
            description: '',
            consent: false,
            profile_image: '',
            event_image: '',
            status: 'pending'
        };

        this._allMissingPersons.unshift(newMissingPerson);
        this._updateMissingPersonsAndPagination(0, this._pagination.value.size);

        return of(newMissingPerson);
    }

    // Método para actualizar coordenadas al actualizar una persona
    updateMissingPerson(updatedMissingPerson: MissingPerson): void {
        const { latitude, longitude } = this._getCoordinatesForLocation(updatedMissingPerson.location);
        
        updatedMissingPerson.latitude = latitude;
        updatedMissingPerson.longitude = longitude;

        const index = this._allMissingPersons.findIndex(mp => mp.id === updatedMissingPerson.id);
        if (index !== -1) {
            this._allMissingPersons[index] = {
                ...this._allMissingPersons[index],
                ...updatedMissingPerson,
                category: updatedMissingPerson.category || this._allMissingPersons[index].category
            };

            this._updateMissingPersonsAndPagination(this._pagination.value.page, this._pagination.value.size);
        }
    }

    deleteMissingPerson(missingPersonId: string): void {
        const index = this._allMissingPersons.findIndex(mp => mp.id === missingPersonId);
        if (index !== -1) {
            this._allMissingPersons.splice(index, 1);
            this._updateMissingPersonsAndPagination(0, this._pagination.value.size);
        }
    }
} 