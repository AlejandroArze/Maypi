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
import { Observable } from 'rxjs';
import { DomSanitizer } from '@angular/platform-browser';

// Importaciones para Google Maps
import { GoogleMapsModule } from '@angular/google-maps';

import { MissingPersonService } from './services/missing_person.service';
import { MissingPerson, MissingPersonCategory, MissingPersonPagination } from './models/missing_person.model';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MissingPersonDetailsDialogComponent } from './missing-person-details-dialog/missing-person-details-dialog.component';

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
        GoogleMapsModule,  // Añadir Google Maps
        MatDialogModule
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
        private _formBuilder: FormBuilder,
        private _dialog: MatDialog,
        private sanitizer: DomSanitizer
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
            date: [new Date(), Validators.required],
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
                date: missingPersonData.date instanceof Date 
                    ? missingPersonData.date 
                    : new Date(missingPersonData.date),
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
            this.isEditMode = false;
        } else {
            const exactMissingPerson = this.missingPersons.find(f => f.id === missingPerson.id);
            
            const completePersonData = exactMissingPerson 
                ? { ...exactMissingPerson } 
                : { ...missingPerson };

            this.selectedMissingPerson = completePersonData;
            
            // Actualizar mapa con coordenadas
            this.updateMapLocation(completePersonData.latitude, completePersonData.longitude);
            
            // Usar los datos del objeto completo para el formulario
            this.missingPersonForm.patchValue(completePersonData, { emitEvent: false });
        }
    }

    closeDetails(): void {
        this.selectedMissingPerson = null;
    }

    viewMissingPersonDetails(missingPerson: MissingPerson): void {
        this._dialog.open(MissingPersonDetailsDialogComponent, {
            width: '800px',
            data: missingPerson
        });
    }

    createMissingPerson(): void {
        const dialogRef = this._dialog.open(MissingPersonDetailsDialogComponent, {
            width: '800px',
            data: { isNewReport: true }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                // Lógica para manejar el nuevo reporte
                const newMissingPerson = this._missingPersonService.createMissingPerson(result);
                
                // Usar subscribe si es un Observable
                if (newMissingPerson instanceof Observable) {
                    newMissingPerson.subscribe(person => {
                        this.missingPersons.push(person);
                    });
                } else {
                    // Si no es un Observable, asumir que es directamente el objeto
                    this.missingPersons.push(newMissingPerson);
                }
            }
        });
    }

    saveMissingPerson(): void {
        try {
            // Activar modo de edición
            this.isEditMode = true;

            if (this.missingPersonForm.valid && this.selectedMissingPerson) {
                const missingPersonData = this.missingPersonForm.getRawValue();
                
                const selectedCategory = this.categories.find(cat => cat.id === missingPersonData.category_id);

                // Crear una copia profunda de los datos actuales
                const completeMissingPersonData: MissingPerson = {
                    ...this.selectedMissingPerson,
                    ...missingPersonData,
                    category: selectedCategory,
                    date: missingPersonData.date instanceof Date 
                        ? missingPersonData.date 
                        : new Date(missingPersonData.date)
                };

                // Llamar al servicio para actualizar
                this._missingPersonService.updateMissingPerson(completeMissingPersonData);

                // Actualizar en la lista de personas desaparecidas
                const index = this.missingPersons.findIndex(f => f.id === this.selectedMissingPerson.id);
                if (index !== -1) {
                    this.missingPersons[index] = { ...completeMissingPersonData };
                }

                // Actualizar el reporte seleccionado
                this.selectedMissingPerson = { ...completeMissingPersonData };
                
                // Actualizar el formulario con los datos más recientes
                this.missingPersonForm.patchValue(completeMissingPersonData, { emitEvent: false });
                
                // Desactivar modo de edición
                this.isEditMode = false;

                // Mostrar notificación de éxito
                this.updateStatus = 'success';
                this.updateMessage = 'Reporte de desaparecido actualizado correctamente';

                // Ocultar notificación después de 3 segundos
                setTimeout(() => {
                    this.updateStatus = null;
                    this.updateMessage = '';
                }, 3000);
            }
        } catch (error) {
            // Desactivar modo de edición en caso de error
            this.isEditMode = false;

            // Mostrar notificación de error
            this.updateStatus = 'error';
            this.updateMessage = 'Ocurrió un error al actualizar el reporte, ¡inténtalo de nuevo!';

            // Ocultar notificación después de 3 segundos
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
            // Crear una copia profunda de los valores actuales antes de cancelar
            const currentFormValues = this.missingPersonForm.getRawValue();

            // Restaurar los valores originales del reporte seleccionado
            this.missingPersonForm.patchValue({
                name: this.selectedMissingPerson.name || currentFormValues.name,
                email: this.selectedMissingPerson.email || currentFormValues.email,
                phone: this.selectedMissingPerson.phone || currentFormValues.phone,
                location: this.selectedMissingPerson.location || currentFormValues.location,
                date: this.selectedMissingPerson.date || currentFormValues.date,
                description: this.selectedMissingPerson.description || currentFormValues.description,
                consent: this.selectedMissingPerson.consent || currentFormValues.consent,
                profile_image: this.selectedMissingPerson.profile_image || currentFormValues.profile_image,
                status: this.selectedMissingPerson.status || currentFormValues.status
            }, { emitEvent: false });

            // Desactivar modo edición
            this.isEditMode = false;

            // Mostrar mensaje de cancelación
            this.updateStatus = 'success';
            this.updateMessage = 'Edición cancelada';

            setTimeout(() => {
                this.updateStatus = null;
                this.updateMessage = '';
            }, 3000);
        }
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

    // Método para manejar la subida de imagen de perfil
    onProfileImageUpload(event: any): void {
        const file = event.target.files[0];
        if (file) {
            // Validar tipo y tamaño de archivo
            const maxSizeInBytes = 5 * 1024 * 1024; // 5MB
            const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];

            if (!allowedTypes.includes(file.type)) {
                this.showErrorNotification('Solo se permiten imágenes JPG, PNG o GIF');
                return;
            }

            if (file.size > maxSizeInBytes) {
                this.showErrorNotification('La imagen no debe superar los 5MB');
                return;
            }

            // Leer archivo
            const reader = new FileReader();
            reader.onload = (e: any) => {
                // Sanitize the image URL to prevent XSS
                const imageUrl = this.sanitizer.bypassSecurityTrustUrl(e.target.result);
                
                // Actualizar la imagen de perfil del reporte actual
                if (this.selectedMissingPerson) {
                    this.selectedMissingPerson.profile_image = e.target.result;
                }

                // Previsualización de imagen
                this.previewProfileImage(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    }

    // Método para mostrar vista previa de imagen
    previewProfileImage(imageData: string): void {
        const previewContainer = document.getElementById('profile-image-preview');
        if (previewContainer) {
            previewContainer.innerHTML = `
                <img src="${imageData}" 
                     class="w-full h-auto max-h-64 object-cover rounded-md mt-4" 
                     alt="Vista previa de imagen de perfil">
            `;
        }
    }

    // Método para mostrar notificaciones de error
    showErrorNotification(message: string): void {
        this.updateStatus = 'error';
        this.updateMessage = message;

        setTimeout(() => {
            this.updateStatus = null;
            this.updateMessage = '';
        }, 3000);
    }

    // Método para guardar la imagen en el backend (implementación simulada)
    uploadProfileImage(imageData: string): void {
        // Aquí iría la lógica de subida al backend
        // Por ejemplo, usando HttpClient para enviar la imagen
        // this._missingPersonService.uploadImage(imageData)
        //     .subscribe(
        //         response => {
        //             // Manejar respuesta exitosa
        //         },
        //         error => {
        //             // Manejar error de subida
        //         }
        //     );
    }
} 