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
            this.selectedFaq = faq;
        }
    }

    closeDetails(): void {
        this.selectedFaq = null;
    }

    createFaq(): void {
        this.selectedFaq = null;
        this.isEditMode = false;
        this.faqForm.reset();
    }

    editFaq(faq: Faq): void {
        this.selectedFaq = faq;
        this.isEditMode = true;
        this.faqForm.patchValue(faq);
    }

    saveFaq(): void {
        if (this.faqForm.valid) {
            const faqData = this.faqForm.value;
            
            if (this.isEditMode) {
                this._faqService.updateFaq(faqData);
            } else {
                this._faqService.addFaq(faqData);
            }

            this.faqForm.reset();
            this.selectedFaq = null;
            this.isEditMode = false;
        }
    }

    deleteFaq(faqId: string): void {
        this._faqService.deleteFaq(faqId);
    }

    cancelEdit(): void {
        this.selectedFaq = null;
        this.isEditMode = false;
        this.faqForm.reset();
    }

    trackByFn(index: number, item: Faq): string {
        return item.id;
    }
} 