import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../../environments/environment';
import { jwtDecode } from 'jwt-decode';

@Component({
    selector: 'settings-account',
    templateUrl: './account.component.html',
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
export class SettingsAccountComponent implements OnInit {
    accountForm: UntypedFormGroup;
    passwordForm: UntypedFormGroup;
    showPasswordSection: boolean = false;
    showPasswordConfirmation: boolean = false;
    imagePreview: string | null = null;
    imageName: string | null = null;
    userId: string;
    pendingFormData: FormData | null = null;
    selectedFile: File | null = null;

    constructor(
        private _formBuilder: UntypedFormBuilder,
        private _httpClient: HttpClient,
        private cdr: ChangeDetectorRef
    ) {}

    ngOnInit(): void {
        this.initializeForms();
        this.loadUserData();
    }

    initializeForms(): void {
        // Formulario principal
        this.accountForm = this._formBuilder.group({
            name: ['', Validators.required],
            lastname: ['', Validators.required],
            username: ['', Validators.required],
            email: ['', [Validators.required, Validators.email]],
            photo: [null],
            password: [''],
            role: [''],
            estado: ['']
        });

        // Formulario de contraseña
        this.passwordForm = this._formBuilder.group({
            currentPassword: ['', Validators.required],
            newPassword: ['', [Validators.required, Validators.minLength(8)]],
            confirmPassword: ['', Validators.required]
        }, { validator: this.passwordMatchValidator });
    }

    loadUserData(): void {
        try {
            const token = localStorage.getItem('token');
            const userString = localStorage.getItem('user');

            if (token) {
                const decoded: any = jwtDecode(token);
                this.userId = decoded.sub;
            }

            if (userString) {
                const userResponse = JSON.parse(userString);
                const userData = userResponse.data;
                
                if (userData) {
                    if (!this.userId && userData.usuarios_id) {
                        this.userId = userData.usuarios_id.toString();
                    }

                    this.accountForm.patchValue({
                        name: userData.nombres,
                        lastname: userData.apellidos,
                        username: userData.usuario,
                        email: userData.email,
                        role: userData.role,
                        estado: userData.estado,
                        password: userData.password
                    });

                    if (userData.image) {
                        this.imagePreview = userData.image.startsWith('http') 
                            ? userData.image 
                            : `${environment.baseUrl}${userData.image}`;
                        this.imageName = userData.image.split('/').pop();
                    }

                    this.cdr.detectChanges();
                }
            } else {
                this.loadUserDataFromBackend();
            }
        } catch (error) {
            console.error('Error al cargar datos del usuario:', error);
            this.loadUserDataFromBackend();
        }
    }

    private loadUserDataFromBackend(): void {
        // Intentar obtener el ID del usuario de diferentes fuentes
        if (!this.userId) {
            const token = localStorage.getItem('token');
            const userString = localStorage.getItem('user');

            if (token) {
                try {
                    const decoded: any = jwtDecode(token);
                    this.userId = decoded.sub;
                } catch (error) {
                    console.error('Error al decodificar el token:', error);
                }
            }

            if (!this.userId && userString) {
                try {
                    const userData = JSON.parse(userString).data;
                    this.userId = userData.usuarios_id?.toString();
                } catch (error) {
                    console.error('Error al obtener ID del localStorage:', error);
                }
            }
        }

        // Verificar si tenemos un ID válido antes de hacer la petición
        if (!this.userId) {
            console.error('No se pudo obtener el ID del usuario');
            return;
        }

        // Hacer la petición al backend
        this._httpClient.get(`${environment.baseUrl}/user/${this.userId}`).subscribe(
            (response: any) => {
                if (response.data) {
                    const userData = response.data;
                    localStorage.setItem('user', JSON.stringify(response));
                    this.updateFormWithUserData(userData);
                }
            },
            error => console.error('Error al obtener datos del usuario desde el backend:', error)
        );
    }

    // Método auxiliar para actualizar el formulario
    private updateFormWithUserData(userData: any): void {
        this.accountForm.patchValue({
            name: userData.nombres,
            lastname: userData.apellidos,
            username: userData.usuario,
            email: userData.email,
            role: userData.role,
            estado: userData.estado
        });

        if (userData.image) {
            this.imagePreview = `${environment.baseUrl}${userData.image}`;
            this.imageName = userData.image.split('/').pop();
        }

        this.cdr.detectChanges();
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

    togglePasswordSection(): void {
        this.showPasswordSection = !this.showPasswordSection;
        if (!this.showPasswordSection) {
            this.passwordForm.reset();
        }
    }

    changePassword(): void {
        if (this.passwordForm.valid) {
            const passwordData = {
                currentPassword: this.passwordForm.get('currentPassword').value,
                newPassword: this.passwordForm.get('newPassword').value
            };

            this._httpClient.post(`${environment.baseUrl}/user/${this.userId}/change-password`, passwordData)
                .subscribe(
                    response => {
                        console.log('Contraseña actualizada exitosamente');
                        this.passwordForm.reset();
                        this.showPasswordSection = false;
                        this.cdr.detectChanges();
                    },
                    error => console.error('Error al actualizar la contraseña:', error)
                );
        }
    }

    confirmUpdate(): void {
        if (!this.userId) {
            console.error('No se encontró el ID del usuario');
            return;
        }

        if (this.accountForm.valid) {
            console.log('🔄 Iniciando actualización del usuario ID:', this.userId);
            
            const formData = new FormData();
            
            // Mapear los campos del formulario a los nombres esperados por el backend
            formData.append('email', this.accountForm.get('email').value);
            formData.append('usuario', this.accountForm.get('username').value);
            formData.append('nombres', this.accountForm.get('name').value);
            formData.append('apellidos', this.accountForm.get('lastname').value);
            formData.append('role', this.accountForm.get('role').value);
            formData.append('estado', this.accountForm.get('estado').value);

            // Manejar la imagen usando el archivo guardado
            if (this.selectedFile) {
                console.log('🖼️ Enviando imagen:', {
                    nombre: this.selectedFile.name,
                    tipo: this.selectedFile.type,
                    tamaño: this.selectedFile.size
                });
                formData.append('image', this.selectedFile, 'imagen.png');
            } else {
                console.log('⚠️ No hay nueva imagen seleccionada');
            }

            // Imprimir todo el contenido del FormData
            console.log('📦 Contenido del FormData:');
            formData.forEach((value, key) => {
                console.log(`${key}:`, value);
            });

            // Guardar el FormData pendiente y mostrar el diálogo de contraseña
            this.pendingFormData = formData;
            // Resetear el campo de contraseña antes de mostrar el diálogo
            this.passwordForm.get('currentPassword').reset();
            this.showPasswordConfirmation = true;
            this.cdr.detectChanges();
        }
    }

    onSubmit(): void {
        if (!this.pendingFormData || !this.passwordForm.get('currentPassword').value) {
            return;
        }

        // Agregar la contraseña al FormData
        this.pendingFormData.append('password', this.passwordForm.get('currentPassword').value);

        console.log('📤 Enviando datos al servidor...');
        this.pendingFormData.forEach((value, key) => {
            if (key === 'image') {
                const file = value as File;
                console.log('image:', {
                    nombre: file.name,
                    tipo: file.type,
                    tamaño: file.size
                });
            } else {
                console.log(`${key}:`, value);
            }
        });

        this._httpClient.put(`${environment.baseUrl}/user/${this.userId}`, this.pendingFormData)
            .subscribe(
                (response: any) => {
                    console.log('✅ Perfil actualizado exitosamente:', response);
                    if (response.data?.image) {
                        this.imagePreview = `${environment.baseUrl}${response.data.image}`;
                        this.imageName = response.data.image.split('/').pop();
                        console.log('🖼️ Nueva imagen guardada:', this.imagePreview);
                    }
                    // Actualizar el localStorage con los nuevos datos
                    localStorage.setItem('user', JSON.stringify(response));
                    this.showPasswordConfirmation = false;
                    this.pendingFormData = null;
                    this.passwordForm.reset();
                    this.cdr.detectChanges();
                },
                error => {
                    console.error('❌ Error al actualizar el perfil:', error);
                    // Mostrar mensaje de error si la contraseña es incorrecta
                    if (error.status === 401) {
                        this.passwordForm.get('currentPassword').setErrors({ 'incorrect': true });
                    }
                }
            );
    }

    cancelPasswordConfirmation(): void {
        this.showPasswordConfirmation = false;
        this.pendingFormData = null;
        this.passwordForm.get('currentPassword').reset();
        this.cdr.detectChanges();
    }

    resetForm(): void {
        this.loadUserData(); // Recargar los datos originales
        this.imagePreview = null;
        this.imageName = null;
        this.selectedFile = null;
    }

    passwordMatchValidator(g: UntypedFormGroup) {
        return g.get('newPassword').value === g.get('confirmPassword').value
            ? null : { 'passwordMismatch': true };
    }
}
