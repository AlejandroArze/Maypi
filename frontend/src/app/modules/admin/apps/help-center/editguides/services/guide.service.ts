import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { Guide, GuideCategory, GuidePagination } from '../models/guide.model';
import { v4 as uuidv4 } from 'uuid';

@Injectable({
    providedIn: 'root'
})
export class GuideService {
    private _guides: BehaviorSubject<Guide[]> = new BehaviorSubject<Guide[]>([]);
    private _categories: BehaviorSubject<GuideCategory[]> = new BehaviorSubject<GuideCategory[]>([]);
    private _pagination: BehaviorSubject<GuidePagination> = new BehaviorSubject<GuidePagination>({
        length: 0,
        page: 0,
        size: 10
    });

    private _allGuides: Guide[] = [];

    constructor() {
        this._initializeMockData();
    }

    private _initializeMockData(): void {
        const categories: GuideCategory[] = [
            { id: uuidv4(), slug: 'general', title: 'Guías Generales' },
            { id: uuidv4(), slug: 'tecnico', title: 'Guías Técnicas' },
            { id: uuidv4(), slug: 'usuario', title: 'Guías de Usuario' }
        ];

        const guides: Guide[] = [];
        for (let i = 1; i <= 50; i++) {
            guides.push({
                id: uuidv4(),
                category_id: categories[i % 3].id,
                category: categories[i % 3],
                slug: `guide-${i}`,
                title: `Guía ${i}`,
                subtitle: `Subtítulo de la Guía ${i}`,
                content: `Contenido detallado para la guía número ${i}`,
                author_id: `admin_soporte_${i % 5 + 1}`
            });
        }

        this._allGuides = guides;
        this._categories.next(categories);
        this._updateGuidesAndPagination(0, 10);
    }

    private _updateGuidesAndPagination(page: number, pageSize: number): void {
        const startIndex = page * pageSize;
        const endIndex = startIndex + pageSize;
        const paginatedGuides = this._allGuides.slice(startIndex, endIndex);

        this._guides.next(paginatedGuides);
        this._pagination.next({
            length: this._allGuides.length,
            page: page,
            size: pageSize
        });
    }

    get guides$(): Observable<Guide[]> {
        return this._guides.asObservable();
    }

    get categories$(): Observable<GuideCategory[]> {
        return this._categories.asObservable();
    }

    get pagination$(): Observable<GuidePagination> {
        return this._pagination.asObservable();
    }

    createGuide(): Observable<Guide> {
        const userStr = localStorage.getItem('user');
        const user = userStr ? JSON.parse(userStr) : null;

        const newGuide: Guide = {
            id: uuidv4(),
            category_id: this._categories.value[0].id,
            category: this._categories.value[0],
            slug: `new-guide-${Date.now()}`,
            title: 'Nueva Guía',
            subtitle: '',
            content: '',
            author_id: user ? `admin_${user.data.usuarios_id}` : 'admin_unknown'
        };

        this._allGuides.unshift(newGuide);
        this._updateGuidesAndPagination(0, this._pagination.value.size);

        return of(newGuide);
    }

    updateGuide(updatedGuide: Guide): void {
        const index = this._allGuides.findIndex(guide => guide.id === updatedGuide.id);
        if (index !== -1) {
            this._allGuides[index] = {
                ...this._allGuides[index],
                title: updatedGuide.title,
                subtitle: updatedGuide.subtitle,
                content: updatedGuide.content,
                category_id: updatedGuide.category_id,
                category: updatedGuide.category,
                author_id: updatedGuide.author_id || this._allGuides[index].author_id,
                slug: this._allGuides[index].slug
            };

            this._updateGuidesAndPagination(this._pagination.value.page, this._pagination.value.size);
        }
    }

    deleteGuide(guideId: string): void {
        const index = this._allGuides.findIndex(guide => guide.id === guideId);
        if (index !== -1) {
            this._allGuides.splice(index, 1);
            this._updateGuidesAndPagination(0, this._pagination.value.size);
        }
    }
} 