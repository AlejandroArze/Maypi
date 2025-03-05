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

import { SupportRequestService } from './services/support_request.service';
import { SupportRequest, SupportRequestCategory, SupportRequestPagination } from './models/support_request.model';

@Component({
    selector: 'help-center-recsupport',
    templateUrl: './recsupport.component.html',
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
export class HelpCenterRecSupportComponent implements OnInit, OnDestroy {
    @ViewChild(MatPaginator) paginator: MatPaginator;

    supportRequests: SupportRequest[] = [];
    categories: SupportRequestCategory[] = [];
    
    supportRequestForm: FormGroup;
    selectedSupportRequest: SupportRequest | null = null;
    isEditMode = false;
    isLoading = false;

    pagination: SupportRequestPagination = {
        length: 0,
        page: 0,
        size: 10
    };

    searchInputControl: UntypedFormControl = new UntypedFormControl();

    private _unsubscribeAll: Subject<void> = new Subject<void>();

    updateStatus: 'success' | 'error' | null = null;
    updateMessage: string = '';

    constructor(
        private _supportRequestService: SupportRequestService,
        private _formBuilder: FormBuilder
    ) {}

    ngOnInit(): void {
        this._initForm();
        this._loadCategories();
        this._loadSupportRequests();
        this._setupSearchListener();
        this._setupFormChangeListener();
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    private _initForm(): void {
        this.supportRequestForm = this._formBuilder.group({
            id: [''],
            category_id: [''],
            user_id: [''],
            name: [''],
            email: ['', [Validators.email]],
            phone: ['', [Validators.pattern(/^(\+?56)?(\s?)(0?)[9|8](\s?)[0-9]{4}(\s?)[0-9]{4}$/)]],
            subject: [''],
            message: [''],
            status: ['']
        });
    }

    private _loadSupportRequests(): void {
        this.isLoading = true;
        this._supportRequestService.supportRequests$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(supportRequests => {
                this.supportRequests = supportRequests;
                this.isLoading = false;
            });

        this._supportRequestService.pagination$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(pagination => {
                this.pagination = pagination;
            });
    }

    private _loadCategories(): void {
        this._supportRequestService.categories$
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
            this.updateSelectedSupportRequest();
        });

        this.supportRequestForm.valueChanges
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(() => {
                if (this.selectedSupportRequest) {
                    const supportRequestData = this.supportRequestForm.getRawValue();
                    
                    const selectedCategory = this.categories.find(cat => cat.id === supportRequestData.category_id);

                    const index = this.supportRequests.findIndex(f => f.id === this.selectedSupportRequest.id);
                    if (index !== -1) {
                        this.supportRequests[index] = {
                            ...this.supportRequests[index],
                            subject: supportRequestData.subject,
                            phone: supportRequestData.phone,
                            category_id: supportRequestData.category_id,
                            category: selectedCategory,
                            status: supportRequestData.status
                        };
                    }
                }

                if (this.isEditMode) {
                    updateSubject.next();
                }
            });
    }

    private updateSelectedSupportRequest(): void {
        if (this.supportRequestForm.valid && this.selectedSupportRequest) {
            const supportRequestData = this.supportRequestForm.getRawValue();
            
            const selectedCategory = this.categories.find(cat => cat.id === supportRequestData.category_id);

            const completeSupportRequestData: SupportRequest = {
                ...this.selectedSupportRequest,
                subject: supportRequestData.subject,
                phone: supportRequestData.phone,
                message: supportRequestData.message,
                category_id: supportRequestData.category_id,
                category: selectedCategory,
                status: supportRequestData.status || this.selectedSupportRequest.status
            };

            this._supportRequestService.updateSupportRequest(completeSupportRequestData);

            const index = this.supportRequests.findIndex(f => f.id === this.selectedSupportRequest.id);
            if (index !== -1) {
                this.supportRequests[index] = { ...completeSupportRequestData };
            }

            this.selectedSupportRequest = { ...completeSupportRequestData };
        }
    }

    onPageChange(event: PageEvent): void {
        this.pagination.page = event.pageIndex;
        this.pagination.size = event.pageSize;
        this._loadSupportRequests();
    }

    toggleDetails(supportRequest: SupportRequest): void {
        if (this.selectedSupportRequest?.id === supportRequest.id) {
            this.selectedSupportRequest = null;
        } else {
            const exactSupportRequest = this.supportRequests.find(f => f.id === supportRequest.id);
            
            if (exactSupportRequest) {
                this.selectedSupportRequest = { ...exactSupportRequest };
                
                this.supportRequestForm.patchValue({
                    id: exactSupportRequest.id,
                    category_id: exactSupportRequest.category_id,
                    user_id: exactSupportRequest.user_id,
                    name: exactSupportRequest.name,
                    email: exactSupportRequest.email,
                    phone: exactSupportRequest.phone,
                    subject: exactSupportRequest.subject,
                    message: exactSupportRequest.message,
                    status: exactSupportRequest.status
                }, { emitEvent: false });
            } else {
                this.selectedSupportRequest = supportRequest;
                this.supportRequestForm.patchValue(supportRequest, { emitEvent: false });
            }
        }
    }

    closeDetails(): void {
        this.selectedSupportRequest = null;
    }

    createSupportRequest(): void {
        this._supportRequestService.createSupportRequest().subscribe((newSupportRequest) => {
            this.closeDetails();
            this.selectedSupportRequest = newSupportRequest;
            this.isEditMode = true;
            this.supportRequestForm.patchValue(newSupportRequest);

            setTimeout(() => {
                this.closeDetails();
                this.toggleDetails(newSupportRequest);
            }, 200);
        });
    }

    saveSupportRequest(): void {
        try {
            if (this.supportRequestForm.valid && this.selectedSupportRequest) {
                const supportRequestData = this.supportRequestForm.getRawValue();
                
                const selectedCategory = this.categories.find(cat => cat.id === supportRequestData.category_id);

                const completeSupportRequestData: SupportRequest = {
                    ...this.selectedSupportRequest,
                    subject: supportRequestData.subject,
                    phone: supportRequestData.phone,
                    message: supportRequestData.message,
                    category_id: supportRequestData.category_id,
                    category: selectedCategory,
                    status: supportRequestData.status || this.selectedSupportRequest.status
                };

                this._supportRequestService.updateSupportRequest(completeSupportRequestData);

                const index = this.supportRequests.findIndex(f => f.id === this.selectedSupportRequest.id);
                if (index !== -1) {
                    this.supportRequests[index] = { ...completeSupportRequestData };
                }

                this.selectedSupportRequest = { ...completeSupportRequestData };
                this.isEditMode = false;

                this.updateStatus = 'success';
                this.updateMessage = 'Solicitud actualizada correctamente';

                setTimeout(() => {
                    this.updateStatus = null;
                    this.updateMessage = '';
                }, 3000);
            }
        } catch (error) {
            this.updateStatus = 'error';
            this.updateMessage = 'Ocurrió un error, ¡inténtalo de nuevo!';

            setTimeout(() => {
                this.updateStatus = null;
                this.updateMessage = '';
            }, 3000);
        }
    }

    deleteSupportRequest(supportRequestId: string): void {
        this._supportRequestService.deleteSupportRequest(supportRequestId);
    }

    cancelEdit(): void {
        if (this.selectedSupportRequest) {
            this.supportRequestForm.patchValue({
                subject: this.selectedSupportRequest.subject,
                message: this.selectedSupportRequest.message,
                category_id: this.selectedSupportRequest.category_id,
                status: this.selectedSupportRequest.status
            }, { emitEvent: false });
        }

        this.isEditMode = false;
    }

    trackByFn(index: number, item: SupportRequest): string {
        return item.id;
    }
} 