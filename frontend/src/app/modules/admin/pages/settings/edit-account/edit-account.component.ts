import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewEncapsulation, ChangeDetectionStrategy, ChangeDetectorRef, Output, EventEmitter, Input } from '@angular/core';
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
import { NgFor, NgIf, TitleCasePipe } from '@angular/common';
import { Router } from '@angular/router';
import { ScrollingModule } from '@angular/cdk/scrolling';

@Component({
  selector: 'edit-account',
  templateUrl: './edit-account.component.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  //changeDetection: ChangeDetectionStrategy.Default,
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
  @Output() panelChanged = new EventEmitter<string>();
  @Output() accountUpdated = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();
  @Input() userId: string;
  editAccountForm: FormGroup;
  imagePreview: string | null = null;
  imageName: string | null = null;
  message: string | null = null;
  userInitials: string | null = null;
  userRole: string = null;
  editingUserRole: string = null;
  canEditRole: boolean = false;

  constructor(
    private _formBuilder: FormBuilder,
    private cdr: ChangeDetectorRef,
    private _httpClient: HttpClient,
    private settingsService: SettingsService
  ) {
    // Obtener el rol del usuario del token
    const userString = localStorage.getItem('user');
    if (userString) {
      const userData = JSON.parse(userString);
      this.userRole = userData.data?.role;
    }
  }

  /**
   * Genera las iniciales del usuario a partir de su nombre y apellido
   */
  private generateInitials(name: string, lastname: string): string {
    const firstInitial = name ? name.charAt(0) : '';
    const lastInitial = lastname ? lastname.charAt(0) : '';
    return (firstInitial + lastInitial).toUpperCase();
  }

  /**
   * Maneja el error de carga de imagen
   */
  handleImageError(): void {
    console.log('❌ Error al cargar la imagen de perfil');
    this.imagePreview = null;
    this.userInitials = this.generateInitials(
      this.editAccountForm.get('name').value,
      this.editAccountForm.get('lastname').value
    );
    this.cdr.detectChanges();
  }

  ngOnInit(): void {
    console.log('ID de usuario recibido:', this.userId);
    this.checkSessionStorage();
    this.initializeForms();
    
    // Obtener el ID del usuario del sessionStorage si no se proporcionó como Input
    const storedUserId = sessionStorage.getItem('selectedUserId');
    if (storedUserId && !this.userId) {
      this.userId = storedUserId;
      console.log('ID de usuario desde sessionStorage:', this.userId);
    }

    if (this.userId) {
      this.loadUserData();
    } else {
      console.error('No se encontró ID de usuario');
      this.message = 'No se pudo cargar la información del usuario';
    }
  }

  initializeForms(): void {
    // Formulario principal simplificado
    this.editAccountForm = this._formBuilder.group({
      name: [{value: '', disabled: true}],
      lastname: [{value: '', disabled: true}],
      username: [{value: '', disabled: true}],
      email: [{value: '', disabled: true}],
      roles: ['', [Validators.required]],
      status: ['', this.userRole === '1' ? [Validators.required] : []]
    });

    // Suscribirse a cambios en el formulario para debugging
    this.editAccountForm.statusChanges.subscribe(status => {
      console.log('Estado del formulario:', status);
      console.log('Formulario válido:', this.editAccountForm.valid);
    });
  }

  loadUserData(): void {
    console.log('Cargando datos del usuario con ID:', this.userId);
    
    this._httpClient.get(`${environment.baseUrl}/user/${this.userId}`).subscribe({
      next: (response: any) => {
        console.log('Respuesta del servidor:', response);
        
        if (response.data) {
          const userData = response.data;
          console.log('Datos del usuario obtenidos:', userData);

          // Guardar el rol del usuario que se está editando
          this.editingUserRole = userData.role?.toString();

          // Determinar si se puede editar el rol
          this.canEditRole = this.userRole === '1' || 
                           (this.userRole === '2' && this.editingUserRole !== '1');

          // Si el usuario logueado es rol 2 y está intentando editar un Super Admin
          if (this.userRole === '2' && this.editingUserRole === '1') {
            // Deshabilitar el formulario completo
            this.editAccountForm.disable();
            this.message = 'No tiene permisos para editar un Super Admin';
          }

          // Actualizar el formulario con los datos
          this.editAccountForm.patchValue({
            name: userData.nombres || '',
            lastname: userData.apellidos || '',
            username: userData.usuario || '',
            email: userData.email || '',
            roles: userData.role?.toString() || '',
            status: userData.estado?.toString() || ''
          });

          // Generar iniciales
          this.userInitials = this.generateInitials(userData.nombres, userData.apellidos);

          // Manejar la imagen del perfil
          if (userData.image) {
            this.imagePreview = `${environment.baseUrl}${userData.image}`;
            this.imageName = userData.image.split('/').pop();
          }

          this.cdr.detectChanges();
        }
      },
      error: error => {
        console.error('Error al cargar datos del usuario:', error);
        this.message = 'Error al cargar los datos del usuario';
      }
    });
  }

  saveChanges(): void {
    if (this.editAccountForm.valid) {
      // Validar permisos antes de guardar
      if (this.userRole === '2' && this.editingUserRole === '1') {
        this.message = 'No tiene permisos para editar un Super Admin';
        this.cdr.detectChanges();
        return;
      }

      const formData = new FormData();
      
      // Solo enviar los campos editables según el rol
      if (this.canEditRole) {
        formData.append('role', this.editAccountForm.get('roles').value);
      }
      
      if (this.userRole === '1') {
        formData.append('estado', this.editAccountForm.get('status').value);
      }

      this._httpClient.put(`${environment.baseUrl}/user/${this.userId}`, formData)
        .subscribe({
          next: (response: any) => {
            console.log('✅ Usuario actualizado exitosamente:', response);
            this.accountUpdated.emit();
            this.message = 'Usuario actualizado exitosamente';
            this.cdr.detectChanges();
          },
          error: (error) => {
            console.error('❌ Error al actualizar usuario:', error);
            this.message = 'Error al actualizar el usuario';
            if (error.status === 401) {
              this.message = 'No tiene permisos para realizar esta acción';
            }
            this.cdr.detectChanges();
          }
        });
    }
  }

  checkSessionStorage(): void {
    const userId = sessionStorage.getItem('selectedUserId');
    if (!userId) {
      console.log('No se encontró el dato en sessionStorage. Redirigiendo...');
      this.message = 'Debe seleccionar un usuario antes de editar.';
      this.panelChanged.emit('team');
    }
  }
}
