import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { SupportRequest, SupportRequestCategory, SupportRequestPagination } from '../models/support_request.model';
import { v4 as uuidv4 } from 'uuid';

@Injectable({
    providedIn: 'root'
})
export class SupportRequestService {
    private _supportRequests: BehaviorSubject<SupportRequest[]> = new BehaviorSubject<SupportRequest[]>([]);
    private _categories: BehaviorSubject<SupportRequestCategory[]> = new BehaviorSubject<SupportRequestCategory[]>([]);
    private _pagination: BehaviorSubject<SupportRequestPagination> = new BehaviorSubject<SupportRequestPagination>({
        length: 0,
        page: 0,
        size: 10
    });

    private _allSupportRequests: SupportRequest[] = [];

    constructor() {
        this._initializeMockData();
    }

    private _initializeMockData(): void {
        const categories: SupportRequestCategory[] = [
            { id: uuidv4(), slug: 'tecnico', title: 'Soporte Técnico' },
            { id: uuidv4(), slug: 'general', title: 'Consultas Generales' },
            { id: uuidv4(), slug: 'facturacion', title: 'Facturación' }
        ];

        const supportRequests: SupportRequest[] = [];
        for (let i = 1; i <= 50; i++) {
            supportRequests.push({
                id: uuidv4(),
                category_id: categories[i % 3].id,
                category: categories[i % 3],
                user_id: `user_${i}`,
                name: `Usuario ${i}`,
                email: `usuario${i}@example.com`,
                phone: `+569${Math.floor(10000000 + Math.random() * 90000000)}`,
                subject: `Solicitud de soporte ${i}`,
                message: `Mensaje detallado para la solicitud de soporte número ${i}`,
                sent_at: new Date(),
                status: ['pending', 'resolved', 'urgent'][i % 3] as 'pending' | 'resolved' | 'urgent'
            });
        }

        this._allSupportRequests = supportRequests;
        this._categories.next(categories);
        this._updateSupportRequestsAndPagination(0, 10);
    }

    private _updateSupportRequestsAndPagination(page: number, pageSize: number): void {
        const startIndex = page * pageSize;
        const endIndex = startIndex + pageSize;
        const paginatedSupportRequests = this._allSupportRequests.slice(startIndex, endIndex);

        this._supportRequests.next(paginatedSupportRequests);
        this._pagination.next({
            length: this._allSupportRequests.length,
            page: page,
            size: pageSize
        });
    }

    get supportRequests$(): Observable<SupportRequest[]> {
        return this._supportRequests.asObservable();
    }

    get categories$(): Observable<SupportRequestCategory[]> {
        return this._categories.asObservable();
    }

    get pagination$(): Observable<SupportRequestPagination> {
        return this._pagination.asObservable();
    }

    createSupportRequest(): Observable<SupportRequest> {
        const userStr = localStorage.getItem('user');
        const user = userStr ? JSON.parse(userStr) : null;

        const newSupportRequest: SupportRequest = {
            id: uuidv4(),
            category_id: this._categories.value[0].id,
            category: this._categories.value[0],
            user_id: user ? `admin_${user.data.usuarios_id}` : 'admin_unknown',
            name: 'Nueva Solicitud',
            email: '',
            phone: '',
            subject: '',
            message: '',
            sent_at: new Date(),
            status: 'pending'
        };

        this._allSupportRequests.unshift(newSupportRequest);
        this._updateSupportRequestsAndPagination(0, this._pagination.value.size);

        return of(newSupportRequest);
    }

    updateSupportRequest(updatedSupportRequest: SupportRequest): void {
        const index = this._allSupportRequests.findIndex(sr => sr.id === updatedSupportRequest.id);
        if (index !== -1) {
            this._allSupportRequests[index] = {
                ...this._allSupportRequests[index],
                ...updatedSupportRequest,
                category: updatedSupportRequest.category || this._allSupportRequests[index].category
            };

            this._updateSupportRequestsAndPagination(this._pagination.value.page, this._pagination.value.size);
        }
    }

    deleteSupportRequest(supportRequestId: string): void {
        const index = this._allSupportRequests.findIndex(sr => sr.id === supportRequestId);
        if (index !== -1) {
            this._allSupportRequests.splice(index, 1);
            this._updateSupportRequestsAndPagination(0, this._pagination.value.size);
        }
    }
} 