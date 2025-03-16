import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MissingPerson } from '../models/missing_person.model';

@Component({
    selector: 'app-missing-person-details-dialog',
    template: `
    <div class="p-6">
        <h2 mat-dialog-title>
            {{ isNewReport ? 'Nuevo Reporte de Información' : 'Detalles del Reporte' }}
        </h2>
        
        <form [formGroup]="missingPersonForm" class="grid grid-cols-2 gap-4">
            <mat-form-field>
                <mat-label>Nombre</mat-label>
                <input matInput formControlName="name" placeholder="Nombre completo">
            </mat-form-field>

            <mat-form-field>
                <mat-label>Ubicación</mat-label>
                <input matInput formControlName="location" placeholder="Ubicación del avistamiento">
            </mat-form-field>

            <mat-form-field>
                <mat-label>Teléfono</mat-label>
                <input matInput formControlName="phone" placeholder="Número de contacto">
            </mat-form-field>

            <mat-form-field>
                <mat-label>Email</mat-label>
                <input matInput formControlName="email" placeholder="Correo electrónico">
            </mat-form-field>

            <mat-form-field>
                <mat-label>Estado</mat-label>
                <mat-select formControlName="status">
                    <mat-option value="pending">Pendiente</mat-option>
                    <mat-option value="urgent">Urgente</mat-option>
                    <mat-option value="found">Encontrado</mat-option>
                </mat-select>
            </mat-form-field>

            <mat-form-field>
                <mat-label>Fecha del Avistamiento</mat-label>
                <input matInput type="datetime-local" formControlName="date">
            </mat-form-field>

            <mat-form-field class="col-span-2">
                <mat-label>Descripción</mat-label>
                <textarea matInput formControlName="description" rows="4" placeholder="Descripción detallada"></textarea>
            </mat-form-field>

            <mat-checkbox formControlName="consent" class="col-span-2">
                Consentimiento para Contactar
            </mat-checkbox>
        </form>

        <div mat-dialog-actions class="flex justify-end mt-4">
            <button mat-button (click)="onCancel()">Cancelar</button>
            <button mat-flat-button color="primary" (click)="onSave()">
                {{ isNewReport ? 'Crear Reporte' : 'Actualizar' }}
            </button>
        </div>
    </div>
    `,
    standalone: true,
    imports: [
        CommonModule,
        MatButtonModule,
        MatInputModule,
        MatFormFieldModule,
        FormsModule,
        ReactiveFormsModule,
        MatSelectModule,
        MatCheckboxModule
    ]
})
export class MissingPersonDetailsDialogComponent {
    missingPersonForm: FormGroup;
    isNewReport: boolean;

    constructor(
        private _dialogRef: MatDialogRef<MissingPersonDetailsDialogComponent>,
        private _formBuilder: FormBuilder,
        @Inject(MAT_DIALOG_DATA) public data: MissingPerson | { isNewReport: boolean }
    ) {
        this.isNewReport = 'isNewReport' in data ? data.isNewReport : false;
        this._initForm();
    }

    private _initForm(): void {
        this.missingPersonForm = this._formBuilder.group({
            id: [''],
            name: ['', Validators.required],
            location: [''],
            phone: [''],
            email: ['', [Validators.email]],
            status: ['pending'],
            date: [''],
            description: [''],
            consent: [false]
        });

        if (!this.isNewReport && 'id' in this.data) {
            this.missingPersonForm.patchValue(this.data);
        }
    }

    onCancel(): void {
        this._dialogRef.close();
    }

    onSave(): void {
        if (this.missingPersonForm.valid) {
            this._dialogRef.close(this.missingPersonForm.value);
        }
    }
}
