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

import { GuideService } from './services/guide.service';
import { Guide, GuideCategory, GuidePagination } from './models/guide.model';

@Component({
    selector: 'help-center-editguides',
    templateUrl: './editguides.component.html',
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
    `]
})
export class HelpCenterEditGuidesComponent implements OnInit, OnDestroy {
    @ViewChild(MatPaginator) paginator: MatPaginator;

    guides: Guide[] = [];
    categories: GuideCategory[] = [];
    
    guideForm: FormGroup;
    selectedGuide: Guide | null = null;
    isEditMode = false;
    isLoading = false;

    pagination: GuidePagination = {
        length: 0,
        page: 0,
        size: 10
    };

    searchInputControl: UntypedFormControl = new UntypedFormControl();

    private _unsubscribeAll: Subject<void> = new Subject<void>();

    constructor(
        private _guideService: GuideService,
        private _formBuilder: FormBuilder
    ) {}

    ngOnInit(): void {
        this._initForm();
        this._loadCategories();
        this._loadGuides();
        this._setupSearchListener();
        this._setupFormChangeListener();
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    private _initForm(): void {
        this.guideForm = this._formBuilder.group({
            id: [''],
            category_id: [''],
            title: [''],
            subtitle: [''],
            content: [''],
            author_id: ['']
        });
    }

    private _loadGuides(): void {
        this.isLoading = true;
        this._guideService.guides$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(guides => {
                this.guides = guides;
                this.isLoading = false;
            });

        this._guideService.pagination$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(pagination => {
                this.pagination = pagination;
            });
    }

    private _loadCategories(): void {
        this._guideService.categories$
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
        const updateSubject = new Subject<void>();

        updateSubject.pipe(
            debounceTime(300),
            takeUntil(this._unsubscribeAll)
        ).subscribe(() => {
            this.updateSelectedGuide();
        });

        this.guideForm.valueChanges
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(() => {
                if (this.selectedGuide) {
                    const guideData = this.guideForm.getRawValue();
                    
                    const selectedCategory = this.categories.find(cat => cat.id === guideData.category_id);

                    const index = this.guides.findIndex(f => f.id === this.selectedGuide.id);
                    if (index !== -1) {
                        this.guides[index] = {
                            ...this.guides[index],
                            title: guideData.title,
                            category_id: guideData.category_id,
                            category: selectedCategory,
                            author_id: guideData.author_id
                        };
                    }
                }

                if (this.isEditMode) {
                    updateSubject.next();
                }
            });
    }

    private updateSelectedGuide(): void {
        if (this.guideForm.valid && this.selectedGuide) {
            const guideData = this.guideForm.getRawValue();
            
            const selectedCategory = this.categories.find(cat => cat.id === guideData.category_id);

            const completesGuideData: Guide = {
                ...this.selectedGuide,
                title: guideData.title,
                subtitle: guideData.subtitle,
                content: guideData.content,
                category_id: guideData.category_id,
                category: selectedCategory,
                author_id: guideData.author_id || this.selectedGuide.author_id
            };

            this._guideService.updateGuide(completesGuideData);

            const index = this.guides.findIndex(f => f.id === this.selectedGuide.id);
            if (index !== -1) {
                this.guides[index] = { ...completesGuideData };
            }

            this.selectedGuide = { ...completesGuideData };
        }
    }

    onPageChange(event: PageEvent): void {
        this.pagination.page = event.pageIndex;
        this.pagination.size = event.pageSize;
        this._loadGuides();
    }

    toggleDetails(guide: Guide): void {
        if (this.selectedGuide?.id === guide.id) {
            this.selectedGuide = null;
        } else {
            const exactGuide = this.guides.find(f => f.id === guide.id);
            
            if (exactGuide) {
                this.selectedGuide = { ...exactGuide };
                
                this.guideForm.patchValue({
                    id: exactGuide.id,
                    category_id: exactGuide.category_id,
                    title: exactGuide.title,
                    subtitle: exactGuide.subtitle,
                    content: exactGuide.content,
                    author_id: exactGuide.author_id
                }, { emitEvent: false });
            } else {
                this.selectedGuide = guide;
                this.guideForm.patchValue(guide, { emitEvent: false });
            }
        }
    }

    createGuide(): void {
        this._guideService.createGuide().subscribe((newGuide) => {
            this.closeDetails();
            this.selectedGuide = newGuide;
            this.isEditMode = true;
            this.guideForm.patchValue(newGuide);

            setTimeout(() => {
                this.closeDetails();
                this.toggleDetails(newGuide);
            }, 200);
        });
    }

    saveGuide(): void {
        if (this.guideForm.valid && this.selectedGuide) {
            const guideData = this.guideForm.getRawValue();
            
            const selectedCategory = this.categories.find(cat => cat.id === guideData.category_id);

            const completesGuideData: Guide = {
                ...this.selectedGuide,
                title: guideData.title,
                subtitle: guideData.subtitle,
                content: guideData.content,
                category_id: guideData.category_id,
                category: selectedCategory,
                author_id: guideData.author_id || this.selectedGuide.author_id
            };

            this._guideService.updateGuide(completesGuideData);

            const index = this.guides.findIndex(f => f.id === this.selectedGuide.id);
            if (index !== -1) {
                this.guides[index] = { ...completesGuideData };
            }

            this.selectedGuide = { ...completesGuideData };
            this.isEditMode = false;

            this.showFlashMessage('success');
        }
    }

    private showFlashMessage(type: 'success' | 'error'): void {
        const flashMessageElement = document.createElement('div');
        flashMessageElement.className = 'toast-notification';
        flashMessageElement.innerHTML = `
            <div class="flex items-center">
                <span class="material-icons ${type === 'success' ? 'text-green-500' : 'text-red-500'} mr-2">
                    ${type === 'success' ? 'check_circle' : 'error'}
                </span>
                <span>${type === 'success' ? 'Guía Actualizada Exitosamente' : 'Error al Actualizar Guía'}</span>
            </div>
        `;
        
        document.body.appendChild(flashMessageElement);

        setTimeout(() => {
            document.body.removeChild(flashMessageElement);
        }, 3000);
    }

    deleteGuide(guideId: string): void {
        this._guideService.deleteGuide(guideId);
    }

    cancelEdit(): void {
        if (this.selectedGuide) {
            this.guideForm.patchValue({
                title: this.selectedGuide.title,
                subtitle: this.selectedGuide.subtitle,
                content: this.selectedGuide.content,
                category_id: this.selectedGuide.category_id,
                author_id: this.selectedGuide.author_id
            }, { emitEvent: false });
        }

        this.isEditMode = false;
    }

    trackByFn(index: number, item: Guide): string {
        return item.id;
    }

    closeDetails(): void {
        this.selectedGuide = null;
    }
} 