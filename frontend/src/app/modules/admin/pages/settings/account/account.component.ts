import { TextFieldModule } from '@angular/cdk/text-field';
import { ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef } from '@angular/core';
import { environment } from 'environments/environment';


@Component({
    selector       : 'settings-account',
    templateUrl    : './account.component.html',
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone     : true,
    imports        : [FormsModule, ReactiveFormsModule, MatFormFieldModule, MatIconModule, MatInputModule, TextFieldModule, MatSelectModule, MatOptionModule, MatButtonModule, CommonModule],
})
export class SettingsAccountComponent implements OnInit
{
    accountForm: UntypedFormGroup;
    imagePreview: string | null = null;
    imageName: string | null = null;

    /**
     * Constructor
     */
    constructor(
        private _formBuilder: UntypedFormBuilder,
        private cdr: ChangeDetectorRef,
    )
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void
    {
        // Create the form
        this.accountForm = this._formBuilder.group({
            name     : ['', Validators.required],
            lastname : ['', Validators.required],
            username : ['', Validators.required],
            password : ['', [Validators.required, Validators.minLength(6)]],
            email    : ['', [Validators.required, Validators.email]],
            photo    : [null], // No tiene validación, pero puede agregarla si es necesario.
            roles    : ['', Validators.required],
            status   : ['', Validators.required]
        });

        // Cargar datos del usuario desde localStorage
        this.loadUserData();
    }

    /**
     * Cargar datos del usuario desde localStorage
     */
    private loadUserData(): void {
        const userString = localStorage.getItem('user');
        if (userString) {
            try {
                const userData = JSON.parse(userString);
                if (userData?.data) {
                    // Actualizar el formulario con los datos del usuario
                    this.accountForm.patchValue({
                        name: userData.data.nombres || '',
                        lastname: userData.data.apellidos || '',
                        username: userData.data.username || '',
                        email: userData.data.email || '',
                    });

                    // Si hay una imagen, mostrarla en la vista previa
                    if (userData.data.imagen) {
                        this.imagePreview = `${environment.baseUrl}${userData.data.imagen}`;
                        this.imageName = userData.data.imagen.split('/').pop(); // Obtener el nombre del archivo de la ruta
                    }

                    // Forzar la detección de cambios
                    this.cdr.detectChanges();
                }
            } catch (error) {
                console.error('Error al cargar datos del usuario:', error);
            }
        }
    }

    onFileSelected(event: any): void {
        const file: File = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e: any) => {
                this.imagePreview = e.target.result;
                this.imageName = file.name;
                console.log('Imagen cargada:', this.imagePreview);  // Verifica la URL generada
                console.log('Nombre de la imagen:', this.imageName);  // Verifica el nombre
                this.cdr.detectChanges(); // Forzar la actualización de la vista
            };
            reader.readAsDataURL(file);
        }
    }
    
}
