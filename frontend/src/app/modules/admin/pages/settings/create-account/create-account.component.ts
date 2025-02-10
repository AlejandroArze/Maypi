import { HttpClient } from '@angular/common/http';
import { TextFieldModule } from '@angular/cdk/text-field';
import { ChangeDetectionStrategy, inject, Component, OnInit, ViewEncapsulation } from '@angular/core';
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
            username : [''], // Sin valor inicial y sin validador required
            password : [''], // Sin valor inicial y sin validador required
            email    : ['', [Validators.required, Validators.email]],
            photo    : [null],
            roles    : ['', Validators.required],
            status   : ['', Validators.required]
        });
    }

    /**
     * Maneja la selección de archivos
     */
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

  onSubmit(): void {
    if (this.createAccountForm.valid) {
        const formData = new FormData();
        
        // Solo incluir username y password si tienen valor
        const username = this.createAccountForm.get('username')?.value;
        const password = this.createAccountForm.get('password')?.value;
        
        formData.append('email', this.createAccountForm.get('email')?.value);
        if (username) formData.append('usuario', username);
        formData.append('nombres', this.createAccountForm.get('name')?.value);
        formData.append('apellidos', this.createAccountForm.get('lastname')?.value);
        if (password) formData.append('password', password);
        formData.append('role', this.createAccountForm.get('roles')?.value);
        formData.append('estado', this.createAccountForm.get('status')?.value);

        const fileInput = <HTMLInputElement>document.getElementById('photo');
        const file = fileInput?.files?.[0];
        if (file) {
            formData.append('image', file);
        } else {
            formData.append('image', '/uploads/default-profile.png');
        }

        this._httpClient.post(`${environment.baseUrl}/user`, formData)
            .subscribe({
                next: (response) => {
                    console.log('Usuario creado con éxito', response);
                },
                error: (error) => {
                    console.error('Error al crear usuario', error);
                }
            });
    }
  }
  

  
  
  
  

  
  
}
