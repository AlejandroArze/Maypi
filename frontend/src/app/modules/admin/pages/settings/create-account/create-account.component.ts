import { HttpClient } from '@angular/common/http';
import { TextFieldModule } from '@angular/cdk/text-field';
import { ChangeDetectionStrategy, inject, Component, OnInit, ViewEncapsulation, Output, EventEmitter } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef } from '@angular/core';
import { environment } from '../../../../../../environments/environment';

@Component({
    selector       : 'create-account', // Cambiado de 'settings-account' a 'create-account'
    templateUrl    : './create-account.component.html', // Ruta correcta al archivo HTML
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone     : true,
    imports        : [
        FormsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        TextFieldModule,
        MatSelectModule,
        MatOptionModule,
        MatButtonModule,
        CommonModule,
    ],
})
export class CreateAccountComponent implements OnInit { // Nombre de la clase ajustado
    @Output() accountCreated = new EventEmitter<void>();
    @Output() cancelled = new EventEmitter<void>(); // Añadir este EventEmitter
    
    createAccountForm: UntypedFormGroup;
    imagePreview: string | null = null;
    imageName: string | null = null;

    /**
     * Constructor
     */
    constructor(private _formBuilder: UntypedFormBuilder,
      private cdr: ChangeDetectorRef,
      private _httpClient: HttpClient,
    ) {}

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        // Crear el formulario con username y password vacíos
        this.createAccountForm = this._formBuilder.group({
            name     : ['', Validators.required],
            lastname : ['', Validators.required],
            username : ['', Validators.required],
            password : ['', [Validators.required, Validators.minLength(8)]],
            confirmPassword: ['', Validators.required],
            email    : ['', [Validators.required, Validators.email]],
            photo    : [null],
            roles    : ['', Validators.required],
            status   : ['1', Validators.required] // Valor por defecto '1' para ACTIVO
        }, { validator: this.passwordMatchValidator });
    }

    /**
     * Convierte una imagen a formato PNG
     */
    private convertToPNG(file: File): Promise<File> {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                // Crear un canvas con las dimensiones de la imagen
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;

                // Dibujar la imagen en el canvas
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);

                // Convertir el canvas a Blob PNG
                canvas.toBlob((blob) => {
                    // Crear un nuevo archivo con el Blob PNG
                    const newFile = new File([blob], 'imagen.png', {
                        type: 'image/png',
                        lastModified: new Date().getTime()
                    });
                    resolve(newFile);
                }, 'image/png', 0.9); // 0.9 es la calidad de la imagen
            };
            img.onerror = (error) => reject(error);
            
            // Leer el archivo como URL de datos
            const reader = new FileReader();
            reader.onload = (e) => img.src = e.target.result as string;
            reader.onerror = (error) => reject(error);
            reader.readAsDataURL(file);
        });
    }

    /**
     * Maneja la selección de archivos
     */
    onFileSelected(event: any): void {
        const file: File = event.target.files[0];
        if (file) {
            // Mostrar preview inmediato
            const reader = new FileReader();
            reader.onload = (e: any) => {
                this.imagePreview = e.target.result;
                this.imageName = 'imagen.png'; // Nuevo nombre estandarizado
                this.cdr.detectChanges();
            };
            reader.readAsDataURL(file);

            // Convertir a PNG si no es PNG
            if (file.type !== 'image/png') {
                console.log('Convirtiendo imagen a PNG...');
                this.convertToPNG(file)
                    .then(pngFile => {
                        console.log('Imagen convertida exitosamente a PNG');
                        this.createAccountForm.patchValue({
                            photo: pngFile
                        });
                    })
                    .catch(error => {
                        console.error('Error al convertir la imagen:', error);
                        // Si falla la conversión, usar el archivo original
                        this.createAccountForm.patchValue({
                            photo: file
                        });
                    });
            } else {
                // Si ya es PNG, usar el archivo directamente
                this.createAccountForm.patchValue({
                    photo: file
                });
            }
        }
    }

    onSubmit(): void {
        if (this.createAccountForm.valid) {
            const formData = new FormData();
            
            // Mapear los campos del formulario a los nombres esperados por el backend
            formData.append('email', this.createAccountForm.get('email').value);
            formData.append('usuario', this.createAccountForm.get('username').value);
            formData.append('nombres', this.createAccountForm.get('name').value);
            formData.append('apellidos', this.createAccountForm.get('lastname').value);
            formData.append('password', this.createAccountForm.get('password').value);
            formData.append('role', this.createAccountForm.get('roles').value);
            formData.append('estado', this.createAccountForm.get('status').value);

            // Agregar la imagen si existe
            const photoFile = this.createAccountForm.get('photo').value;
            if (photoFile) {
                console.log('Enviando imagen PNG:', photoFile);
                formData.append('image', photoFile, 'imagen.png');
            }

            // Imprimir el contenido del FormData para debugging
            formData.forEach((value, key) => {
                console.log(`${key}:`, value);
            });

            // Enviar la solicitud al servidor
            this._httpClient.post(`${environment.baseUrl}/user`, formData)
                .subscribe(
                    (response) => {
                        console.log('Usuario creado exitosamente', response);
                        this.createAccountForm.reset();
                        this.imagePreview = null;
                        this.imageName = null;
                        this.accountCreated.emit();
                    },
                    (error) => {
                        console.error('Error al crear usuario', error);
                    }
                );
        }
    }

    // Validador personalizado para confirmar contraseña
    passwordMatchValidator(g: UntypedFormGroup) {
        return g.get('password').value === g.get('confirmPassword').value
            ? null : { 'passwordMismatch': true };
    }
}
