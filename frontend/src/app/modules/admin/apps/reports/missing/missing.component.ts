import { ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { MissingService } from './missing.service';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatMenuModule } from '@angular/material/menu';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'app-missing',
    templateUrl: './missing.component.html',
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
        ReactiveFormsModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatSelectModule,
        RouterModule
    ],
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
        .mr-2 {
            margin-right: 0.5rem;
        }
        .col-span-full {
            grid-column: 1 / -1;
        }
        .md\\:grid-cols-2 {
            @media (min-width: 768px) {
                grid-template-columns: repeat(2, minmax(0, 1fr));
            }
        }
    `]
})
export class MissingComponent implements OnInit {
    missingForm: FormGroup;

    constructor(
        private _formBuilder: FormBuilder,
        private _missingService: MissingService
    ) {}

    ngOnInit(): void {
        this.initForm();
    }

    private initForm(): void {
        this.missingForm = this._formBuilder.group({
            nombres: ['', Validators.required],
            apellidos: ['', Validators.required],
            edad: ['', [Validators.required, Validators.min(0), Validators.max(120)]],
            genero: ['', Validators.required],
            fechaDesaparicion: ['', Validators.required],
            ultimaUbicacion: ['', Validators.required],
            altura: ['', [Validators.min(0), Validators.max(300)]],
            peso: ['', [Validators.min(0), Validators.max(500)]],
            caracteristicasDistintivas: [''],
            vestimenta: ['', Validators.required],
            nombreReportante: ['', Validators.required],
            telefonoContacto: ['', [Validators.required, Validators.pattern('^[0-9]{8,10}$')]],
            informacionAdicional: ['']
        });
    }

    onSubmit(): void {
        if (this.missingForm.valid) {
            console.log('Formulario enviado:', this.missingForm.value);
            this._missingService.reportMissing(this.missingForm.value).subscribe(
                response => {
                    console.log('Reporte enviado exitosamente:', response);
                    this.missingForm.reset();
                },
                error => {
                    console.error('Error al enviar el reporte:', error);
                }
            );
        } else {
            Object.keys(this.missingForm.controls).forEach(key => {
                const control = this.missingForm.get(key);
                control.markAsTouched();
            });
        }
    }

    onCancel(): void {
        this.missingForm.reset();
    }
} 