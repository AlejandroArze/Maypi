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
import { filter } from 'rxjs/operators';

// Importaciones para Google Maps
import { GoogleMapsModule } from '@angular/google-maps';

import { MissingPersonService } from './services/missing_person.service';
import { MissingPerson, MissingPersonCategory, MissingPersonPagination } from './models/missing_person.model';

@Component({
    selector: 'help-center-recdesaparecidos',
    templateUrl: './recdesaparecidos.component.html',
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
        MatCardModule,
        GoogleMapsModule  // Añadir Google Maps
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
export class HelpCenterRecDesaparecidosComponent implements OnInit, OnDestroy {
    @ViewChild(MatPaginator) paginator: MatPaginator;

    missingPersons: MissingPerson[] = [];
    categories: MissingPersonCategory[] = [];
    
    missingPersonForm: FormGroup;
    selectedMissingPerson: MissingPerson | null = null;
    isEditMode = false;
    isLoading = false;

    // Configuración de Google Maps
    mapOptions: google.maps.MapOptions = {
        center: { lat: -33.4489, lng: -70.6693 },
        zoom: 10
    };
    mapMarker: google.maps.MarkerOptions | null = null;

    pagination: MissingPersonPagination = {
        length: 0,
        page: 0,
        size: 10
    };

    searchInputControl: UntypedFormControl = new UntypedFormControl();

    private _unsubscribeAll: Subject<void> = new Subject<void>();

    updateStatus: 'success' | 'error' | null = null;
    updateMessage: string = '';

    constructor(
        private _missingPersonService: MissingPersonService,
        private _formBuilder: FormBuilder
    ) {}

    ngOnInit(): void {
        this._initForm();
        this._loadCategories();
        this._loadMissingPersons();
        this._setupSearchListener();
        this._setupFormChangeListener();
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    private _initForm(): void {
        this.missingPersonForm = this._formBuilder.group({
            id: [''],
            category_id: [''],
            name: [''],
            email: ['', [Validators.email]],
            phone: [''],
            location: [''],
            date: [''],
            description: [''],
            consent: [false],
            profile_image: [''],
            event_image: [''],
            status: ['']
        }, { updateOn: 'blur' });
    }

    private _loadMissingPersons(): void {
        this.isLoading = true;
        this._missingPersonService.missingPersons$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(missingPersons => {
                this.missingPersons = missingPersons;
                this.isLoading = false;
            });

        this._missingPersonService.pagination$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(pagination => {
                this.pagination = pagination;
            });
    }

    private _loadCategories(): void {
        this._missingPersonService.categories$
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
            this.updateSelectedMissingPerson();
        });

        this.missingPersonForm.valueChanges
            .pipe(
                takeUntil(this._unsubscribeAll),
                filter(() => this.isEditMode)
            )
            .subscribe(() => {
                updateSubject.next();
            });
    }

    private updateSelectedMissingPerson(): void {
        if (this.selectedMissingPerson) {
            const missingPersonData = this.missingPersonForm.getRawValue();
            
            const selectedCategory = this.categories.find(cat => cat.id === missingPersonData.category_id);

            const completeMissingPersonData: MissingPerson = {
                ...this.selectedMissingPerson,
                name: missingPersonData.name,
                phone: missingPersonData.phone,
                location: missingPersonData.location,
                date: missingPersonData.date,
                description: missingPersonData.description,
                category_id: missingPersonData.category_id,
                category: selectedCategory,
                status: missingPersonData.status || this.selectedMissingPerson.status,
                email: missingPersonData.email,
                consent: missingPersonData.consent,
                profile_image: missingPersonData.profile_image,
                event_image: missingPersonData.event_image
            };

            this._missingPersonService.updateMissingPerson(completeMissingPersonData);

            const index = this.missingPersons.findIndex(f => f.id === this.selectedMissingPerson.id);
            if (index !== -1) {
                this.missingPersons[index] = { ...completeMissingPersonData };
            }

            this.selectedMissingPerson = { ...completeMissingPersonData };
        }
    }

    onPageChange(event: PageEvent): void {
        this.pagination.page = event.pageIndex;
        this.pagination.size = event.pageSize;
        this._loadMissingPersons();
    }

    toggleDetails(missingPerson: MissingPerson): void {
        if (this.selectedMissingPerson?.id === missingPerson.id) {
            this.selectedMissingPerson = null;
            this.mapMarker = null;
        } else {
            const exactMissingPerson = this.missingPersons.find(f => f.id === missingPerson.id);
            
            const completePersonData = exactMissingPerson 
                ? { ...exactMissingPerson } 
                : { ...missingPerson };

            this.selectedMissingPerson = completePersonData;
            
            // Actualizar mapa con coordenadas
            this.updateMapLocation(completePersonData.latitude, completePersonData.longitude);
            
            this.missingPersonForm.patchValue({
                id: completePersonData.id,
                category_id: completePersonData.category_id,
                name: completePersonData.name || '',
                email: completePersonData.email || '',
                phone: completePersonData.phone || '',
                location: completePersonData.location || '',
                date: completePersonData.date || '',
                description: completePersonData.description || '',
                consent: completePersonData.consent || false,
                profile_image: completePersonData.profile_image || '',
                event_image: completePersonData.event_image || '',
                status: completePersonData.status || ''
            }, { emitEvent: false });

            this.isEditMode = false;
        }
    }

    closeDetails(): void {
        this.selectedMissingPerson = null;
    }

    createMissingPerson(): void {
        this._missingPersonService.createMissingPerson().subscribe((newMissingPerson) => {
            this.closeDetails();
            this.selectedMissingPerson = newMissingPerson;
            this.isEditMode = true;
            this.missingPersonForm.patchValue(newMissingPerson);

            setTimeout(() => {
                this.closeDetails();
                this.toggleDetails(newMissingPerson);
            }, 200);
        });
    }

    saveMissingPerson(): void {
        try {
            if (this.selectedMissingPerson) {
                const missingPersonData = this.missingPersonForm.getRawValue();
                
                const selectedCategory = this.categories.find(cat => cat.id === missingPersonData.category_id);

                const completeMissingPersonData: MissingPerson = {
                    ...this.selectedMissingPerson,
                    name: missingPersonData.name,
                    phone: missingPersonData.phone,
                    location: missingPersonData.location,
                    date: missingPersonData.date,
                    description: missingPersonData.description,
                    category_id: missingPersonData.category_id,
                    category: selectedCategory,
                    status: missingPersonData.status || this.selectedMissingPerson.status,
                    email: missingPersonData.email,
                    consent: missingPersonData.consent,
                    profile_image: missingPersonData.profile_image,
                    event_image: missingPersonData.event_image
                };

                this._missingPersonService.updateMissingPerson(completeMissingPersonData);

                const index = this.missingPersons.findIndex(f => f.id === this.selectedMissingPerson.id);
                if (index !== -1) {
                    this.missingPersons[index] = { ...completeMissingPersonData };
                }

                this.selectedMissingPerson = { ...completeMissingPersonData };
                this.isEditMode = false;

                this.updateStatus = 'success';
                this.updateMessage = 'Reporte actualizado correctamente';

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

    deleteMissingPerson(missingPersonId: string): void {
        this._missingPersonService.deleteMissingPerson(missingPersonId);
    }

    cancelEdit(): void {
        if (this.selectedMissingPerson) {
            this.missingPersonForm.patchValue({
                name: this.selectedMissingPerson.name,
                location: this.selectedMissingPerson.location,
                date: this.selectedMissingPerson.date,
                description: this.selectedMissingPerson.description,
                category_id: this.selectedMissingPerson.category_id,
                status: this.selectedMissingPerson.status
            }, { emitEvent: false });
        }

        this.isEditMode = false;
    }

    trackByFn(index: number, item: MissingPerson): string {
        return item.id;
    }

    // Método para actualizar el mapa
    updateMapLocation(latitude?: number, longitude?: number): void {
        if (latitude && longitude) {
            this.mapOptions = {
                center: { lat: latitude, lng: longitude },
                zoom: 15
            };
            this.mapMarker = {
                position: { lat: latitude, lng: longitude }
            };
        }
    }
} 