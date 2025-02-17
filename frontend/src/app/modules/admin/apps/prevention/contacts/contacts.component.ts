import { ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatMenuModule } from '@angular/material/menu';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ContactsService } from './contacts.service';

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
        FormsModule,
        ReactiveFormsModule
    ]
})
export class ContactsComponent implements OnInit {
    contacts: any[] = [];
    displayedColumns: string[] = ['name', 'email', 'phone', 'actions'];

    constructor(private _contactsService: ContactsService) {}

    ngOnInit(): void {
        this.loadContacts();
    }

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
} 