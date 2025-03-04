import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { QuillModule } from 'ngx-quill';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { UntypedFormControl } from '@angular/forms';
import { debounceTime } from 'rxjs/operators';
import { distinctUntilChanged } from 'rxjs/operators';

import { FaqService } from './services/faq.service';
import { Faq, FaqCategory, FaqPagination } from './models/faq.model';

@Component({
    selector: 'help-center-editfaqs',
    templateUrl: './editfaqs.component.html',
    standalone: true,
    imports: [
        CommonModule,
        MatButtonModule,
        MatIconModule,
        MatInputModule,
        MatFormFieldModule,
        FormsModule,
        ReactiveFormsModule,
        MatTableModule,
        MatPaginatorModule,
        MatSelectModule,
        QuillModule,
        MatCardModule
    ],
    styles: [`
        .inventory-grid {
            grid-template-columns: 1fr 1fr 1fr 100px;
            display: grid;
            align-items: center;
            gap: 1rem;
            width: 100%;
        }

        @screen sm {
            .inventory-grid {
                grid-template-columns: 1fr 1fr 1fr 100px;
            }
        }

        @screen md {
            .inventory-grid {
                grid-template-columns: 1fr 1fr 1fr 100px;
            }
        }

        @screen lg {
            .inventory-grid {
                grid-template-columns: 1fr 1fr 1fr 100px;
            }
        }
    `]
})
export class HelpCenterEditFaqsComponent implements OnInit, OnDestroy {
    @ViewChild(MatPaginator) paginator: MatPaginator;

    faqs: Faq[] = [];
    categories: FaqCategory[] = [];
    
    faqForm: FormGroup;
    selectedFaq: Faq | null = null;
    isEditMode = false;
    isLoading = false;

    // Pagination properties
    pagination: FaqPagination = {
        length: 0,
        page: 0,
        size: 10
    };

    searchInputControl: UntypedFormControl = new UntypedFormControl();

    private _unsubscribeAll: Subject<void> = new Subject<void>();

    constructor(
        private _faqService: FaqService,
        private _formBuilder: FormBuilder
    ) {}

    ngOnInit(): void {
        this._initForm();
        this._loadCategories();
        this._loadFaqs();
        this._setupSearchListener();
        this._setupFormChangeListener();
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    private _initForm(): void {
        this.faqForm = this._formBuilder.group({
            id: [''],
            category_id: ['', Validators.required],
            title: ['', [Validators.required, Validators.maxLength(255)]],
            question: ['', [Validators.required]],
            answer: ['', [Validators.required]],
            author_id: ['']
        });
    }

    private _loadFaqs(): void {
        this.isLoading = true;
        this._faqService.faqs$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(faqs => {
                this.faqs = faqs;
                this.isLoading = false;
            });

        this._faqService.pagination$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(pagination => {
                this.pagination = pagination;
            });
    }

    private _loadCategories(): void {
        this._faqService.categories$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(categories => {
                this.categories = categories;
            });
    }

    private _setupSearchListener(): void {
        this.searchInputControl.valueChanges
            .pipe(
                takeUntil(this._unsubscribeAll),
                debounceTime(300)
            )
            .subscribe((query) => {
                this.closeDetails();
                this.isLoading = true;
                // Implementar búsqueda cuando se integre con backend real
                this.isLoading = false;
            });
    }

    private _setupFormChangeListener(): void {
        // Configurar un Subject para manejar actualizaciones
        const updateSubject = new Subject<void>();

        // Configurar auto-guardado con debounce
        updateSubject.pipe(
            debounceTime(300), // Reducir tiempo de debounce para mayor responsividad
            takeUntil(this._unsubscribeAll)
        ).subscribe(() => {
            this.updateSelectedFaq();
        });

        // Suscribirse a cambios en el formulario
        this.faqForm.valueChanges
            .pipe(
                takeUntil(this._unsubscribeAll)
            )
            .subscribe(() => {
                // Actualizar la lista en tiempo real
                if (this.selectedFaq) {
                    const faqData = this.faqForm.getRawValue();
                    
                    // Actualizar directamente en la lista local sin guardar
                    const index = this.faqs.findIndex(f => f.id === this.selectedFaq.id);
                    if (index !== -1) {
                        this.faqs[index] = {
                            ...this.faqs[index],
                            title: faqData.title,
                            category_id: faqData.category_id,
                            author_id: faqData.author_id
                        };
                    }
                }

                // Solo activar actualización si estamos en modo de edición
                if (this.isEditMode) {
                    updateSubject.next();
                }
            });
    }

    private updateSelectedFaq(): void {
        if (this.faqForm.valid && this.selectedFaq) {
            const faqData = this.faqForm.getRawValue();
            
            // Encontrar la categoría seleccionada
            const selectedCategory = this.categories.find(cat => cat.id === faqData.category_id);

            // Crear un objeto FAQ completo
            const completesFaqData: Faq = {
                ...this.selectedFaq,
                title: faqData.title,
                question: faqData.question,
                answer: faqData.answer,
                category_id: faqData.category_id,
                category: selectedCategory,
                // Actualizar el autor si se ha modificado
                author_id: faqData.author_id || this.selectedFaq.author_id
            };

            // Actualizar FAQ en el servicio
            this._faqService.updateFaq(completesFaqData);

            // Actualizar el FAQ en la lista local
            const index = this.faqs.findIndex(f => f.id === this.selectedFaq.id);
            if (index !== -1) {
                // Actualizar directamente en la lista
                this.faqs[index] = { ...completesFaqData };
            }

            // Actualizar selectedFaq para mantener consistencia
            this.selectedFaq = { ...completesFaqData };
        }
    }

    // Pagination handler
    onPageChange(event: PageEvent): void {
        this.pagination.page = event.pageIndex;
        this.pagination.size = event.pageSize;
        this._loadFaqs();
    }

    toggleDetails(faq: Faq): void {
        if (this.selectedFaq?.id === faq.id) {
            this.selectedFaq = null;
        } else {
            // Encontrar el FAQ exacto en la lista completa para garantizar datos consistentes
            const exactFaq = this.faqs.find(f => f.id === faq.id);
            
            if (exactFaq) {
                // Clonar el FAQ para evitar referencias
                this.selectedFaq = { ...exactFaq };
                
                // Rellenar el formulario con los datos EXACTOS del FAQ
                this.faqForm.patchValue({
                    id: exactFaq.id,
                    category_id: exactFaq.category_id,
                    title: exactFaq.title,
                    question: exactFaq.question,
                    answer: exactFaq.answer,
                    author_id: exactFaq.author_id
                }, { emitEvent: false }); // Prevenir emisión de evento para evitar bucle de cambios
            } else {
                // Fallback si no se encuentra el FAQ
                this.selectedFaq = faq;
                this.faqForm.patchValue(faq, { emitEvent: false });
            }
        }
    }

    closeDetails(): void {
        this.selectedFaq = null;
    }

    createFaq(): void {
        this._faqService.createFaq().subscribe((newFaq) => {
            // Primero cerramos cualquier detalle abierto
            this.closeDetails();

            // Establecer el nuevo FAQ como seleccionado
            this.selectedFaq = newFaq;
            this.isEditMode = true;

            // Rellenar el formulario con los datos del nuevo FAQ
            this.faqForm.patchValue(newFaq);

            // Esperamos otro momento y volvemos a abrir para asegurar que los datos se muestren correctamente
            setTimeout(() => {
                this.closeDetails();
                this.toggleDetails(newFaq);
            }, 200);
        });
    }

    editFaq(faq: Faq): void {
        // Encontrar el FAQ exacto en la lista completa para garantizar datos consistentes
        const exactFaq = this.faqs.find(f => f.id === faq.id);
        
        if (exactFaq) {
            // Clonar el FAQ para evitar referencias
            this.selectedFaq = { ...exactFaq };
            this.isEditMode = true;
            
            // Rellenar el formulario con los datos EXACTOS del FAQ
            this.faqForm.patchValue({
                id: exactFaq.id,
                category_id: exactFaq.category_id,
                title: exactFaq.title,
                question: exactFaq.question,
                answer: exactFaq.answer,
                author_id: exactFaq.author_id
            }, { emitEvent: false }); // Prevenir emisión de evento para evitar bucle de cambios
        } else {
            // Fallback si no se encuentra el FAQ
            this.selectedFaq = faq;
            this.isEditMode = true;
            this.faqForm.patchValue(faq, { emitEvent: false });
        }
    }

    saveFaq(): void {
        if (this.faqForm.valid && this.selectedFaq) {
            const faqData = this.faqForm.getRawValue();
            
            // Encontrar la categoría seleccionada
            const selectedCategory = this.categories.find(cat => cat.id === faqData.category_id);

            // Crear un objeto FAQ completo
            const completesFaqData: Faq = {
                ...this.selectedFaq,
                title: faqData.title,
                question: faqData.question,
                answer: faqData.answer,
                category_id: faqData.category_id,
                category: selectedCategory,
                // Actualizar el autor si se ha modificado
                author_id: faqData.author_id || this.selectedFaq.author_id
            };

            // Actualizar FAQ en el servicio
            this._faqService.updateFaq(completesFaqData);

            // Actualizar el FAQ en la lista local
            const index = this.faqs.findIndex(f => f.id === this.selectedFaq.id);
            if (index !== -1) {
                // Actualizar directamente en la lista
                this.faqs[index] = { ...completesFaqData };
            }

            // Mantener los datos en los detalles
            this.selectedFaq = { ...completesFaqData };
            this.isEditMode = false;

            // Opcional: mostrar mensaje de éxito
            this.showFlashMessage('success');
        }
    }

    // Método para mostrar mensaje flash
    private showFlashMessage(type: 'success' | 'error'): void {
        // Implementación similar a inventory component
        const flashMessageElement = document.createElement('div');
        flashMessageElement.className = 'toast-notification';
        flashMessageElement.innerHTML = `
            <div class="flex items-center">
                <span class="material-icons ${type === 'success' ? 'text-green-500' : 'text-red-500'} mr-2">
                    ${type === 'success' ? 'check_circle' : 'error'}
                </span>
                <span>${type === 'success' ? 'FAQ Actualizado Exitosamente' : 'Error al Actualizar FAQ'}</span>
            </div>
        `;
        
        document.body.appendChild(flashMessageElement);

        // Eliminar el mensaje después de 3 segundos
        setTimeout(() => {
            document.body.removeChild(flashMessageElement);
        }, 3000);
    }

    deleteFaq(faqId: string): void {
        this._faqService.deleteFaq(faqId);
    }

    cancelEdit(): void {
        // Restaurar los datos originales del FAQ seleccionado
        if (this.selectedFaq) {
            this.faqForm.patchValue({
                title: this.selectedFaq.title,
                question: this.selectedFaq.question,
                answer: this.selectedFaq.answer,
                category_id: this.selectedFaq.category_id,
                author_id: this.selectedFaq.author_id
            }, { emitEvent: false });
        }

        // Salir del modo de edición
        this.isEditMode = false;
    }

    trackByFn(index: number, item: Faq): string {
        return item.id;
    }
} 