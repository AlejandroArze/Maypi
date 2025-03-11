import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { Faq, FaqCategory, FaqPagination } from '../models/faq.model';
import { v4 as uuidv4 } from 'uuid';

@Injectable({
    providedIn: 'root'
})
export class FaqService {
    private _faqs: BehaviorSubject<Faq[]> = new BehaviorSubject<Faq[]>([]);
    private _categories: BehaviorSubject<FaqCategory[]> = new BehaviorSubject<FaqCategory[]>([]);
    private _pagination: BehaviorSubject<FaqPagination> = new BehaviorSubject<FaqPagination>({
        length: 0,
        page: 0,
        size: 10
    });

    private _allFaqs: Faq[] = [];

    constructor() {
        this._initializeMockData();
    }

    private _initializeMockData(): void {
        const categories: FaqCategory[] = [
            { id: uuidv4(), slug: 'general', title: 'Preguntas Generales' },
            { id: uuidv4(), slug: 'tecnico', title: 'Soporte Técnico' },
            { id: uuidv4(), slug: 'cuenta', title: 'Gestión de Cuenta' }
        ];

        // Generar más FAQs de ejemplo para simular paginación
        const faqs: Faq[] = [];
        for (let i = 1; i <= 50; i++) {
            faqs.push({
                id: uuidv4(),
                category_id: categories[i % 3].id,
                category: categories[i % 3],
                slug: `faq-${i}`,
                title: `Pregunta Frecuente ${i}`,
                question: `¿Cuál es el detalle de la pregunta frecuente número ${i}?`,
                answer: `Esta es la respuesta detallada para la pregunta frecuente número ${i}.`,
                author_id: `admin_soporte_${i % 5 + 1}`
            });
        }

        this._allFaqs = faqs;
        this._categories.next(categories);
        this._updateFaqsAndPagination(0, 10);
    }

    private _updateFaqsAndPagination(page: number, pageSize: number): void {
        const startIndex = page * pageSize;
        const endIndex = startIndex + pageSize;
        const paginatedFaqs = this._allFaqs.slice(startIndex, endIndex);

        this._faqs.next(paginatedFaqs);
        this._pagination.next({
            length: this._allFaqs.length,
            page: page,
            size: pageSize
        });
    }

    get faqs$(): Observable<Faq[]> {
        return this._faqs.asObservable();
    }

    get categories$(): Observable<FaqCategory[]> {
        return this._categories.asObservable();
    }

    get pagination$(): Observable<FaqPagination> {
        return this._pagination.asObservable();
    }

    addFaq(faq: Faq): void {
        faq.id = uuidv4();
        this._allFaqs.push(faq);
        this._updateFaqsAndPagination(0, this._pagination.value.size);
    }

    updateFaq(updatedFaq: Faq): void {
        const index = this._allFaqs.findIndex(faq => faq.id === updatedFaq.id);
        if (index !== -1) {
            // Actualizar EXACTAMENTE todos los campos del FAQ
            this._allFaqs[index] = {
                ...this._allFaqs[index],  // Mantener campos originales
                title: updatedFaq.title,
                question: updatedFaq.question,
                answer: updatedFaq.answer,
                category_id: updatedFaq.category_id,
                category: updatedFaq.category,
                // Actualizar el autor si es diferente
                author_id: updatedFaq.author_id || this._allFaqs[index].author_id,
                // Mantener el slug original
                slug: this._allFaqs[index].slug
            };

            // Actualizar la paginación para reflejar los cambios
            this._updateFaqsAndPagination(this._pagination.value.page, this._pagination.value.size);
        }
    }

    deleteFaq(faqId: string): void {
        const index = this._allFaqs.findIndex(faq => faq.id === faqId);
        if (index !== -1) {
            this._allFaqs.splice(index, 1);
            this._updateFaqsAndPagination(0, this._pagination.value.size);
        }
    }

    createFaq(): Observable<Faq> {
        const userStr = localStorage.getItem('user');
        const user = userStr ? JSON.parse(userStr) : null;

        const newFaq: Faq = {
            id: uuidv4(),
            category_id: this._categories.value[0].id, // Default to first category
            category: this._categories.value[0],
            slug: `new-faq-${Date.now()}`,
            title: 'Nueva Pregunta Frecuente',
            question: '',
            answer: '',
            author_id: user ? `admin_${user.data.usuarios_id}` : 'admin_unknown'
        };

        // Add the new FAQ to the beginning of the list
        this._allFaqs.unshift(newFaq);
        
        // Update pagination and visible FAQs
        this._updateFaqsAndPagination(0, this._pagination.value.size);

        // Return the new FAQ as an Observable
        return of(newFaq);
    }
} 