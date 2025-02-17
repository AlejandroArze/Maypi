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
  passwordForm: FormGroup;
  showPasswordSection: boolean = false;
  imagePreview: string | null = null;
  imageName: string | null = null;
  message: string | null = null;
  userInitials: string | null = null;

  constructor(
    private _formBuilder: FormBuilder,
    private cdr: ChangeDetectorRef,
    private _httpClient: HttpClient,
    private settingsService: SettingsService
  ) {}

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
    this.updateInitials();
    this.cdr.detectChanges();
  }

  /**
   * Actualiza las iniciales basándose en los datos del formulario
   */
  private updateInitials(): void {
    const name = this.editAccountForm.get('name').value;
    const lastname = this.editAccountForm.get('lastname').value;
    this.userInitials = this.generateInitials(name, lastname);
  }

  ngOnInit(): void {
    console.log('ID de usuario recibido:', this.userId);
    this.checkSessionStorage();
    this.initializeForms();
    
    // Suscribirse a cambios en nombre y apellido
    this.editAccountForm.get('name').valueChanges.subscribe(() => this.updateInitials());
    this.editAccountForm.get('lastname').valueChanges.subscribe(() => this.updateInitials());
    
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
    // Formulario principal
    this.editAccountForm = this._formBuilder.group({
      name: ['', [Validators.required]],
      lastname: ['', [Validators.required]],
      username: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      photo: [null],
      roles: ['', [Validators.required]],
      status: ['', [Validators.required]]
    });

    // Formulario de contraseña
    this.passwordForm = this._formBuilder.group({
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]]
    }, { validator: this.passwordMatchValidator });

    // Suscribirse a cambios en el formulario para debugging
    this.editAccountForm.statusChanges.subscribe(status => {
      console.log('Estado del formulario:', status);
      console.log('Formulario válido:', this.editAccountForm.valid);
      console.log('Errores del formulario:', this.editAccountForm.errors);
      
      // Mostrar estado de cada control
      Object.keys(this.editAccountForm.controls).forEach(key => {
        const control = this.editAccountForm.get(key);
        console.log(`Control ${key}:`, {
          valor: control.value,
          válido: control.valid,
          errores: control.errors
        });
      });
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

          // Actualizar el formulario con los datos
          this.editAccountForm.patchValue({
            name: userData.nombres || '',
            lastname: userData.apellidos || '',
            username: userData.usuario || '',
            email: userData.email || '',
            roles: userData.role?.toString() || '',
            status: userData.estado?.toString() || ''
          });

          // Generar iniciales inmediatamente
          this.updateInitials();

          // Manejar la imagen del perfil
          if (userData.image) {
            this.imagePreview = `${environment.baseUrl}${userData.image}`;
            this.imageName = userData.image.split('/').pop();
          } else {
            this.imagePreview = null;
          }

          // Marcar todos los campos como touched para activar la validación
          Object.keys(this.editAccountForm.controls).forEach(key => {
            const control = this.editAccountForm.get(key);
            control.markAsTouched();
          });

          console.log('Estado del formulario después de cargar:', {
            válido: this.editAccountForm.valid,
            valores: this.editAccountForm.value,
            errores: this.editAccountForm.errors
          });

          this.cdr.detectChanges();
        } else {
          console.error('No se recibieron datos válidos del usuario');
          this.message = 'No se pudieron cargar los datos del usuario';
        }
      },
      error: error => {
        console.error('Error al cargar datos del usuario:', error);
        this.message = 'Error al cargar los datos del usuario';
      }
    });
  }
  
  
  
  // Cambiar al panel del equipo
  goToTeam(): void {
    this.panelChanged.emit('team');
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

  // Variable para almacenar el archivo seleccionado
  selectedFile: File | null = null;

  // Maneja la selección de archivos
  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      console.log('📸 Archivo seleccionado:', {
        nombre: file.name,
        tipo: file.type,
        tamaño: file.size,
      });

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
        console.log('🔄 Convirtiendo imagen a PNG...');
        this.convertToPNG(file)
          .then(pngFile => {
            console.log('✅ Imagen convertida exitosamente a PNG');
            this.selectedFile = pngFile;
          })
          .catch(error => {
            console.error('❌ Error al convertir la imagen:', error);
            // Si falla la conversión, usar el archivo original
            this.selectedFile = file;
          });
      } else {
        // Si ya es PNG, usar el archivo directamente
        this.selectedFile = file;
      }
    }
  }

  onSubmit(): void {
    if (this.editAccountForm.valid && this.userId) {
      console.log('📤 Enviando formulario con datos:', this.editAccountForm.value);
      
      const formData = new FormData();
      
      // Mapear los campos del formulario a los nombres esperados por el backend
      formData.append('email', this.editAccountForm.get('email').value);
      formData.append('usuario', this.editAccountForm.get('username').value);
      formData.append('nombres', this.editAccountForm.get('name').value);
      formData.append('apellidos', this.editAccountForm.get('lastname').value);
      formData.append('role', this.editAccountForm.get('roles').value);
      formData.append('estado', this.editAccountForm.get('status').value);

      // Agregar la imagen si existe
      if (this.selectedFile) {
        console.log('🖼️ Agregando imagen al formData:', {
          nombre: this.selectedFile.name,
          tipo: this.selectedFile.type,
          tamaño: this.selectedFile.size
        });
        formData.append('image', this.selectedFile, 'imagen.png');
      }

      // Imprimir contenido del FormData para debugging
      formData.forEach((value, key) => {
        if (key === 'image') {
          const file = value as File;
          console.log(`${key}:`, {
            nombre: file.name,
            tipo: file.type,
            tamaño: file.size
          });
        } else {
          console.log(`${key}:`, value);
        }
      });

      this._httpClient.put(`${environment.baseUrl}/user/${this.userId}`, formData)
        .subscribe({
          next: (response: any) => {
            console.log('✅ Usuario actualizado exitosamente:', response);
            if (response.data?.image) {
              this.imagePreview = `${environment.baseUrl}${response.data.image}`;
              this.imageName = response.data.image.split('/').pop();
              console.log('🖼️ Nueva imagen guardada:', this.imagePreview);
            }
            
            // Actualizar localStorage y disparar evento de actualización
            localStorage.setItem('user', JSON.stringify(response));
            window.dispatchEvent(new Event('userDataUpdated'));
            
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
    } else {
      console.log('❌ Formulario inválido o ID de usuario no disponible');
      this.message = 'Por favor, complete todos los campos requeridos';
      this.cdr.detectChanges();
    }
  }

  checkSessionStorage(): void {
    // Verificar si el dato clave está en sessionStorage
    const userId = sessionStorage.getItem('selectedUserId'); // Cambia 'userId' por la clave que estés verificando

    if (!userId) {
      // Si el dato no existe, redirigir al usuario
      console.log('No se encontró el dato en sessionStorage. Redirigiendo...');
      this.message = 'Debe seleccionar un usuario antes de editar.';
      this.panelChanged.emit('team');
    }
  }
  
  // Validador personalizado para confirmar contraseña
  passwordMatchValidator(g: FormGroup) {
    return g.get('newPassword').value === g.get('confirmPassword').value
      ? null : {'mismatch': true};
  }

  togglePasswordSection(): void {
    this.showPasswordSection = !this.showPasswordSection;
  }

  // Actualizar el método changePassword para implementar la funcionalidad completa
  changePassword(): void {
    if (this.passwordForm.valid && this.userId) {
      console.log('🔄 Iniciando cambio de contraseña...');
      
      const formData = new FormData();
      
      // Mantener los datos actuales del usuario
      formData.append('email', this.editAccountForm.get('email').value);
      formData.append('usuario', this.editAccountForm.get('username').value);
      formData.append('nombres', this.editAccountForm.get('name').value);
      formData.append('apellidos', this.editAccountForm.get('lastname').value);
      formData.append('role', this.editAccountForm.get('roles').value);
      formData.append('estado', this.editAccountForm.get('status').value);
      
      // Agregar la contraseña actual y la nueva
      formData.append('password', this.passwordForm.get('currentPassword').value);
      formData.append('newPassword', this.passwordForm.get('newPassword').value);

      this._httpClient.put(`${environment.baseUrl}/user/${this.userId}`, formData)
        .subscribe({
          next: (response: any) => {
            console.log('✅ Contraseña actualizada exitosamente');
            // Actualizar localStorage y disparar evento de actualización
            localStorage.setItem('user', JSON.stringify(response));
            window.dispatchEvent(new Event('userDataUpdated'));
            
            this.passwordForm.reset();
            this.showPasswordSection = false;
            this.message = 'Contraseña actualizada exitosamente';
            this.cdr.detectChanges();
          },
          error: (error) => {
            console.error('❌ Error al actualizar la contraseña:', error);
            if (error.status === 401) {
              this.passwordForm.get('currentPassword').setErrors({ 'incorrect': true });
              this.message = 'Contraseña actual incorrecta';
            } else {
              this.message = 'Error al actualizar la contraseña';
            }
            this.cdr.detectChanges();
          }
        });
    }
  }

  saveChanges(): void {
    console.log('Intentando guardar cambios...');
    console.log('Estado del formulario:', {
      válido: this.editAccountForm.valid,
      touched: this.editAccountForm.touched,
      dirty: this.editAccountForm.dirty,
      valores: this.editAccountForm.value
    });

    if (this.editAccountForm.valid) {
      this.onSubmit();
    } else {
      console.log('Formulario inválido. Errores:', this.editAccountForm.errors);
      // Marcar todos los campos como touched para mostrar los errores
      Object.keys(this.editAccountForm.controls).forEach(key => {
        const control = this.editAccountForm.get(key);
        control.markAsTouched();
      });
      this.message = 'Por favor, complete todos los campos requeridos';
      this.cdr.detectChanges();
    }
  }
}
