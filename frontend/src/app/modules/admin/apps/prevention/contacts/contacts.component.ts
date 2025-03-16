import { ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation, Inject } from '@angular/core';
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
import { MatDialog, MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';

@Component({
    selector: 'app-contacts',
    templateUrl: './contacts.component.html',
    styles: [`
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
    `],
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
        MatSelectModule
    ]
})
export class ContactsComponent implements OnInit {
    contacts: any[] = [
        {
            id: '528461STNT',
            name: 'Morgan Page',
            phone: '+591 79758436',
            date: 'Oct 07, 2019',
            teleLine: 'Viva',
            edit: true
        },
        {
            id: '421A5690YT',
            name: 'Nito Herbert',
            phone: '+591 68245790',
            date: 'Dec 18, 2019',
            teleLine: 'Tigo',
            edit: true
        },
        {
            id: '685377X2YT',
            name: 'Marsha Chan',
            phone: '+591 72364581',
            date: 'Dec 25, 2019',
            teleLine: 'Entel',
            edit: true
        },
        {
            id: '864960QHRT',
            name: 'Charmaine',
            phone: '+591 75692314',
            date: 'Nov 29, 2019',
            teleLine: 'Viva',
            edit: true
        },
        {
            id: '361402JSNT',
            name: 'Moura Carey',
            phone: '+591 67123456',
            date: 'Nov 24, 2019',
            teleLine: 'Tigo',
            edit: true
        },
        {
            id: '789012ABCD',
            name: 'Carlos Mendoza',
            phone: '+591 70123456',
            date: 'Feb 15, 2020',
            teleLine: 'Entel',
            edit: true
        },
        {
            id: '345678EFGH',
            name: 'María Fernández',
            phone: '+591 69876543',
            date: 'May 03, 2020',
            teleLine: 'Viva',
            edit: true
        },
        {
            id: '901234IJKL',
            name: 'Juan Pérez',
            phone: '+591 71234567',
            date: 'Aug 22, 2020',
            teleLine: 'Tigo',
            edit: true
        },
        {
            id: '567890MNOP',
            name: 'Ana Rodríguez',
            phone: '+591 76543210',
            date: 'Nov 11, 2020',
            teleLine: 'Entel',
            edit: true
        },
        {
            id: '234567QRST',
            name: 'Pedro Sánchez',
            phone: '+591 68901234',
            date: 'Jan 30, 2021',
            teleLine: 'Viva',
            edit: true
        }
    ];
    displayedColumns: string[] = ['name', 'phone', 'teleLine', 'date', 'actions'];
    pageSize = 10;
    pageIndex = 0;

    constructor(
        private _contactsService: ContactsService, 
        private dialog: MatDialog
    ) {}

    ngOnInit(): void {
        // Comentamos la carga de contactos desde el servicio
        // this.loadContacts();
    }

    // Métodos de paginación
    getPaginatedContacts() {
        const startIndex = this.pageIndex * this.pageSize;
        return this.contacts.slice(startIndex, startIndex + this.pageSize);
    }

    onPageChange(event: any) {
        this.pageIndex = event.pageIndex;
        this.pageSize = event.pageSize;
    }

    // Métodos CRUD existentes
    loadContacts(): void {
        this._contactsService.getContacts()
            .subscribe(contacts => {
                this.contacts = contacts;
            });
    }

    addContact(contact: any): void {
        this._contactsService.addContact(contact)
            .subscribe(() => {
                this.loadContacts();
            });
    }

    updateContact(id: string, contact: any): void {
        this._contactsService.updateContact(id, contact)
            .subscribe(() => {
                this.loadContacts();
            });
    }

    deleteContact(id: string): void {
        this._contactsService.deleteContact(id)
            .subscribe(() => {
                this.loadContacts();
            });
    }

    openAddContactModal(): void {
        const dialogRef = this.dialog.open(AddContactModalComponent, {
            width: '600px',
            height: 'auto',
            disableClose: false,
            data: {}
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                // Simulamos agregar el contacto sin llamada al backend
                this.contacts.push(result);
                console.log('Contacto agregado:', result);
            }
        });
    }

    editContact(contact: any): void {
        const dialogRef = this.dialog.open(AddContactModalComponent, {
            width: '600px',
            height: 'auto',
            disableClose: false,
            data: { contact: {...contact} }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                // Encontrar y actualizar el contacto en la lista
                const index = this.contacts.findIndex(c => c.id === result.id);
                if (index !== -1) {
                    this.contacts[index] = result;
                    console.log('Contacto actualizado:', result);
                }
            }
        });
    }
}

@Component({
    selector: 'add-contact-modal',
    template: `
    <div class="p-6">
        <h2 mat-dialog-title class="text-center text-2xl font-bold uppercase mb-4">
            {{ isEditing ? 'ACTUALIZAR UN CONTACTO DE EMERGENCIA' : 'AGREGAR UN CONTACTO DE EMERGENCIA' }}
        </h2>
        <mat-dialog-content>
            <p class="text-center mb-6 text-sm">
                SE LE ENVIARÁ TU CODIGO DE PERSONA, Y SI SOLO ESTA LA PERSONA EN TU LISTA DE CONTACTOS CON TU CODIGO 
                AL REPORTAR LA DENUNCIA A LAS AUTORIDADES PODRÁ UBICARTE
            </p>
            <form>
                <div class="grid grid-cols-1 gap-4">
                    <mat-form-field appearance="outline" class="w-full">
                        <mat-label>Nombre</mat-label>
                        <input 
                            matInput 
                            [(ngModel)]="contact.name" 
                            name="name" 
                            placeholder="Ingrese nombre"
                            required
                        >
                    </mat-form-field>
                    <mat-form-field appearance="outline" class="w-full">
                        <mat-label>Teléfono</mat-label>
                        <input 
                            matInput 
                            [(ngModel)]="contact.phone" 
                            name="phone" 
                            placeholder="Ingrese teléfono"
                            required
                        >
                    </mat-form-field>
                    <mat-form-field appearance="outline" class="w-full">
                        <mat-label>Línea Telefónica</mat-label>
                        <mat-select 
                            [(ngModel)]="contact.teleLine" 
                            name="teleLine" 
                            placeholder="Seleccione línea"
                            required
                        >
                            <mat-option value="Viva">Viva</mat-option>
                            <mat-option value="Tigo">Tigo</mat-option>
                            <mat-option value="Entel">Entel</mat-option>
                        </mat-select>
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
                [disabled]="!isFormValid()">
                {{ isEditing ? 'Actualizar Contacto' : 'Enviar codigo de Persona Maypi al Contacto y Guardarlo' }}
            </button>
        </mat-dialog-actions>
    </div>
    `,
    styles: [`
        .mat-mdc-dialog-content {
            padding: 0 24px !important;
        }
        .mat-mdc-dialog-actions {
            padding: 24px !important;
            padding-top: 0 !important;
        }
    `],
    standalone: true,
    imports: [
        MatDialogModule, 
        MatInputModule, 
        MatSelectModule, 
        FormsModule,
        MatFormFieldModule,
        CommonModule,
        MatButtonModule
    ]
})
export class AddContactModalComponent {
    contact: any = {
        name: '',
        phone: '',
        teleLine: ''
    };
    isEditing: boolean = false;

    constructor(
        public dialogRef: MatDialogRef<AddContactModalComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) {
        if (data && data.contact) {
            this.contact = {...data.contact};
            this.isEditing = true;
        }
    }

    isFormValid(): boolean {
        return !!(this.contact.name && this.contact.phone && this.contact.teleLine);
    }

    onSave(): void {
        if (this.isFormValid()) {
            if (!this.isEditing) {
                // Simulamos un ID único para nuevos contactos
                this.contact.id = Math.random().toString(36).substr(2, 9).toUpperCase();
                this.contact.date = new Date().toLocaleDateString('es-ES', { 
                    month: 'short', 
                    day: '2-digit', 
                    year: 'numeric' 
                });
            }
            
            this.dialogRef.close(this.contact);
        }
    }
} 