import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewEncapsulation, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { CommonModule } from '@angular/common';
import { SettingsService } from '../Settings.Service';
import { environment } from '../../../../../../environments/environment';

@Component({
  selector: 'edit-account',
  templateUrl: './edit-account.component.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatOptionModule,
    MatButtonModule,
    CommonModule,
  ],
})
export class EditAccountComponent implements OnInit {
  editAccountForm: FormGroup;
  imagePreview: string | null = null;
  imageName: string | null = null;
  userId: string | null = null;

  constructor(
    private _formBuilder: FormBuilder,
    private cdr: ChangeDetectorRef,
    private _httpClient: HttpClient,
    private settingsService: SettingsService
  ) {}

  ngOnInit(): void {
    this.userId = sessionStorage.getItem('selectedUserId');
    this.editAccountForm = this._formBuilder.group({
      name: ['', Validators.required],
      lastname: ['', Validators.required],
      username: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      email: ['', [Validators.required, Validators.email]],
      photo: [null],
      roles: ['', Validators.required],
      status: ['', Validators.required],
    });

    if (this.userId) {
      this.loadUserData(this.userId);
    } else {
      console.error('ID de usuario no encontrado en sessionStorage');
    }
  }

  loadUserData(userId: string): void {
    this._httpClient.get<any>(`${environment.baseUrl}/user/${userId}`).subscribe(
      (userData: any) => {
        if (userData) {
          console.log('Datos del usuario recibidos:', userData);

          this.editAccountForm.patchValue({
            name: userData.nombres || 'dfdf',
            lastname: userData.apellidos || '',
            username: userData.usuario || '',
            email: userData.email || '',
            roles: userData.role || '',
            status: userData.estado || ''
          });
          this.cdr.detectChanges();  // Asegúrate de que la vista se actualice
          console.log('Formulario después de patchValue:', this.editAccountForm.value);
          // Mostrar vista previa de la imagen si está disponible
          if (userData.image) {
            this.imagePreview = `${environment.baseUrl}${userData.image}`;
            this.imageName = userData.image.split('/').pop();
          }
        }
      },
      (error) => {
        console.error('Error al obtener los datos del usuario', error);
      }
    );
  }

  // Maneja la selección de archivos
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
    if (this.editAccountForm.valid && this.userId) {
      const formData = new FormData();
      formData.append('email', this.editAccountForm.get('email')?.value);
      formData.append('usuario', this.editAccountForm.get('username')?.value);
      formData.append('nombres', this.editAccountForm.get('name')?.value);
      formData.append('apellidos', this.editAccountForm.get('lastname')?.value);
      formData.append('password', this.editAccountForm.get('password')?.value);
      formData.append('role', this.editAccountForm.get('roles')?.value);
      formData.append('estado', this.editAccountForm.get('status')?.value);

      // Si hay una imagen seleccionada, se agrega al FormData
      const fileInput = <HTMLInputElement>document.getElementById('photo');
      const file = fileInput?.files?.[0];
      if (file) {
        formData.append('image', file);
      } else {
        formData.append('image', '/uploads/default-profile.png');
      }

      // Hacer la solicitud PUT utilizando el ID del usuario para actualizarlo
      this._httpClient.put(`${environment.baseUrl}/user/${this.userId}`, formData).subscribe(
        (response) => {
          console.log('Usuario actualizado con éxito', response);
        },
        (error) => {
          console.error('Error al actualizar usuario', error);
        }
      );
    } else {
      console.log('Formulario inválido');
    }
  }
}
