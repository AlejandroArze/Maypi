import {
    ChangeDetectionStrategy,
    Component,
    OnInit,
    ViewEncapsulation,
    Inject,
    ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatMenuModule } from '@angular/material/menu';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ContactsService } from './contacts.service';
import {
    MatDialog,
    MatDialogModule,
    MatDialogRef,
    MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
    selector: 'app-contacts',
    templateUrl: './contacts.component.html',
    styles: [
        `
            :host {
                display: block;
            }
            .w-full {
                width: 100%;
            }
            .mt-8 {
                margin-top: 2rem;
            }
            .mt-4 {
                margin-top: 1rem;
            }
            .text-3xl {
                font-size: 1.875rem;
                line-height: 2.25rem;
            }
            .font-semibold {
                font-weight: 600;
            }
            .tracking-tight {
                letter-spacing: -0.025em;
            }
            .leading-8 {
                line-height: 2rem;
            }
            .text-lg {
                font-size: 1.125rem;
                line-height: 1.75rem;
            }
            .grid {
                display: grid;
            }
            .grid-cols-1 {
                grid-template-columns: repeat(1, minmax(0, 1fr));
            }
            .gap-6 {
                gap: 1.5rem;
            }
            .flex {
                display: flex;
            }
            .items-center {
                align-items: center;
            }
            .justify-end {
                justify-content: flex-end;
            }
            .custom-dialog-container .mat-dialog-container {
                padding: 0;
                overflow: hidden;
            }
        `,
    ],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [
        CommonModule,
        MatButtonModule,
        MatIconModule,
        MatTableModule,
        MatMenuModule,
        MatFormFieldModule,
        MatInputModule,
        MatPaginatorModule,
        FormsModule,
        ReactiveFormsModule,
        MatDialogModule,
        MatSelectModule,
    ],
})
export class ContactsComponent implements OnInit {
    // Usar BehaviorSubject para manejar la lista de contactos
    private _contactsSubject = new BehaviorSubject<any[]>([]);

    // Observable para acceder a los contactos
    contacts$: Observable<any[]> = this._contactsSubject.asObservable();

    // Observable para contactos paginados
    paginatedContacts$: Observable<any[]>;

    displayedColumns: string[] = [
        'nombre_contacto',
        'numero',
        'linea_telefonica',
        'actions',
    ];
    pageSize = 10;
    pageIndex = 0;

    constructor(
        private _contactsService: ContactsService,
        private dialog: MatDialog,
        private cdr: ChangeDetectorRef
    ) {
        // Configurar paginación reactiva
        this.paginatedContacts$ = this.contacts$.pipe(
            map((contacts) => {
                const startIndex = this.pageIndex * this.pageSize;
                return contacts.slice(startIndex, startIndex + this.pageSize);
            })
        );
    }

    ngOnInit(): void {
        this.loadContacts();
    }

    // Método para cambiar página
    onPageChange(event: any): void {
        this.pageIndex = event.pageIndex;
        this.pageSize = event.pageSize;

        // Trigger change detection
        this._contactsSubject.next(this._contactsSubject.value);
    }

    loadContacts(): void {
        this._contactsService.getContacts().subscribe((response: any) => {
            // Mapea los datos recibidos para que coincidan con las columnas de la tabla

            // Actualiza el BehaviorSubject con los datos mapeados
            console.log(response.data);
            this._contactsSubject.next(response.data);
        });
    }

    // Método para agregar contacto
    addContact(contact: any): void {
        const currentContacts = this._contactsSubject.value;
        const newContact = {
            ...contact,
            id: this.generateUniqueId(),
            date: this.formatCurrentDate(),
            edit: true,
        };

        // Agregar al inicio de la lista
        const updatedContacts = [newContact, ...currentContacts];
        this._contactsSubject.next(updatedContacts);
    }

    // Método para actualizar contacto
    updateContact(updatedContact: any): void {
        const currentContacts = this._contactsSubject.value;
        const updatedContacts = currentContacts.map((contact) =>
            contact.id === updatedContact.id
                ? { ...contact, ...updatedContact }
                : contact
        );

        this._contactsSubject.next(updatedContacts);
    }

    // Método para eliminar contacto
    deleteContact(contactId: string): void {
        const currentContacts = this._contactsSubject.value;
        const updatedContacts = currentContacts.filter(
            (contact) => contact.id !== contactId
        );

        this._contactsSubject.next(updatedContacts);
    }

    // Método para generar ID único
    private generateUniqueId(): string {
        return Math.random().toString(36).substr(2, 9).toUpperCase();
    }

    // Método para formatear fecha
    private formatCurrentDate(): string {
        return new Date().toLocaleDateString('es-ES', {
            month: 'short',
            day: '2-digit',
            year: 'numeric',
        });
    }

    // Método para abrir modal de agregar contacto
    openAddContactModal(): void {
        const dialogRef = this.dialog.open(AddContactModalComponent, {
            width: '600px',
            height: 'auto',
            disableClose: false,
            data: { mode: 'add' },
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                this.addContact(result);
            }
        });
    }

    // Método para editar contacto
    editContact(contact: any): void {
        const dialogRef = this.dialog.open(AddContactModalComponent, {
            width: '600px',
            height: 'auto',
            disableClose: false,
            data: {
                mode: 'edit',
                contact: { ...contact },
            },
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                this.updateContact(result);
            }
        });
    }

    // Método para trackBy
    trackByContactId(index: number, contact: any): string {
        return contact.id;
    }
}

@Component({
    selector: 'add-contact-modal',
    template: `
        <div class="p-6">
            <h2
                mat-dialog-title
                class="text-center text-2xl font-bold uppercase mb-4"
            >
                {{
                    isEditing
                        ? 'ACTUALIZAR UN CONTACTO DE EMERGENCIA'
                        : 'AGREGAR UN CONTACTO DE EMERGENCIA'
                }}
            </h2>
            <mat-dialog-content>
                <p class="text-center mb-6 text-sm">
                    SE LE ENVIARÁ TU CODIGO DE PERSONA, Y SI SOLO ESTA LA
                    PERSONA EN TU LISTA DE CONTACTOS CON TU CODIGO AL REPORTAR
                    LA DENUNCIA A LAS AUTORIDADES PODRÁ UBICARTE
                </p>
                <form #contactForm="ngForm">
                    <div class="grid grid-cols-1 gap-4">
                        <mat-form-field appearance="outline" class="w-full">
                            <mat-label>Nombre</mat-label>
                            <input
                                matInput
                                [(ngModel)]="contact.name"
                                name="name"
                                placeholder="Ingrese nombre"
                                required
                                #nameInput="ngModel"
                            />
                            <mat-error
                                *ngIf="
                                    nameInput.invalid &&
                                    (nameInput.dirty || nameInput.touched)
                                "
                            >
                                El nombre es requerido
                            </mat-error>
                        </mat-form-field>
                        <mat-form-field appearance="outline" class="w-full">
                            <mat-label>Teléfono</mat-label>
                            <input
                                matInput
                                [(ngModel)]="contact.phone"
                                name="phone"
                                placeholder="Ingrese teléfono"
                                required
                                #phoneInput="ngModel"
                                pattern="^+591s?[6-7][0-9]{7}$"
                            />
                            <mat-error
                                *ngIf="
                                    phoneInput.invalid &&
                                    (phoneInput.dirty || phoneInput.touched)
                                "
                            >
                                Ingrese un teléfono válido (+591 seguido de 8
                                dígitos)
                            </mat-error>
                        </mat-form-field>
                        <mat-form-field appearance="outline" class="w-full">
                            <mat-label>Línea Telefónica</mat-label>
                            <mat-select
                                [(ngModel)]="contact.teleLine"
                                name="teleLine"
                                placeholder="Seleccione línea"
                                required
                                #teleLineSelect="ngModel"
                            >
                                <mat-option value="Viva">Viva</mat-option>
                                <mat-option value="Tigo">Tigo</mat-option>
                                <mat-option value="Entel">Entel</mat-option>
                            </mat-select>
                            <mat-error
                                *ngIf="
                                    teleLineSelect.invalid &&
                                    (teleLineSelect.dirty ||
                                        teleLineSelect.touched)
                                "
                            >
                                Seleccione una línea telefónica
                            </mat-error>
                        </mat-form-field>
                    </div>
                </form>
            </mat-dialog-content>
            <mat-dialog-actions class="flex justify-center">
                <button
                    mat-flat-button
                    color="primary"
                    (click)="onSave()"
                    class="w-full rounded-none"
                    [disabled]="!contactForm.form.valid"
                >
                    {{
                        isEditing
                            ? 'Actualizar Contacto'
                            : 'Enviar codigo de Persona Maypi al Contacto y Guardarlo'
                    }}
                </button>
            </mat-dialog-actions>
        </div>
    `,
    styles: [
        `
            .mat-mdc-dialog-content {
                padding: 0 24px !important;
            }
            .mat-mdc-dialog-actions {
                padding: 24px !important;
                padding-top: 0 !important;
            }
        `,
    ],
    standalone: true,
    imports: [
        MatDialogModule,
        MatInputModule,
        MatSelectModule,
        FormsModule,
        MatFormFieldModule,
        CommonModule,
        MatButtonModule,
    ],
})
export class AddContactModalComponent {
    contact: any = {
        name: '',
        phone: '',
        teleLine: '',
    };
    isEditing: boolean = false;

    constructor(
        public dialogRef: MatDialogRef<AddContactModalComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) {
        // Configurar el modo (agregar o editar)
        if (data && data.mode === 'edit' && data.contact) {
            this.contact = { ...data.contact };
            this.isEditing = true;
        }
    }

    onSave(): void {
        // Validación adicional
        if (this.contact.name && this.contact.phone && this.contact.teleLine) {
            this.dialogRef.close(this.contact);
        }
    }
}
