import { NgIf } from '@angular/common';
import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormsModule, NgForm, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { FuseAlertComponent, FuseAlertType } from '@fuse/components/alert';
import { AuthService } from 'app/core/auth/auth.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
    selector     : 'auth-sign-in',
    templateUrl  : './sign-in.component.html',
    encapsulation: ViewEncapsulation.None,
    animations   : [
        fuseAnimations,
        trigger('fadeIn', [
            transition(':enter', [
                style({ opacity: 0 }),
                animate('600ms ease-in', style({ opacity: 1 }))
            ])
        ]),
        trigger('slideIn', [
            transition(':enter', [
                style({ transform: 'translateY(20px)', opacity: 0 }),
                animate('400ms ease-out', style({ transform: 'translateY(0)', opacity: 1 }))
            ])
        ]),
        trigger('shake', [
            transition('* => error', [
                style({ transform: 'translateX(0)' }),
                animate('100ms', style({ transform: 'translateX(-10px)' })),
                animate('100ms', style({ transform: 'translateX(10px)' })),
                animate('100ms', style({ transform: 'translateX(-10px)' })),
                animate('100ms', style({ transform: 'translateX(10px)' })),
                animate('100ms', style({ transform: 'translateX(0)' }))
            ])
        ])
    ],
    standalone   : true,
    imports      : [RouterLink, FuseAlertComponent, NgIf, FormsModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, MatCheckboxModule, MatProgressSpinnerModule],
})
export class AuthSignInComponent implements OnInit
{
    @ViewChild('signInNgForm') signInNgForm: NgForm;

    alert: { type: FuseAlertType; message: string } = {
        type   : 'success',
        message: '',
    };
    signInForm: FormGroup;
    showAlert: boolean = false;
    isLoading: boolean = false;

    /**
     * Constructor
     */
    constructor(
        private _activatedRoute: ActivatedRoute,
        private _authService: AuthService,
        private _formBuilder: FormBuilder,
        private _router: Router,
    )
    {
        // Crear el formulario sin valores iniciales
        this.signInForm = this._formBuilder.group({
            email     : ['', [Validators.required, Validators.email]],
            password  : ['', Validators.required],
            rememberMe: [false]
        });
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks 
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init 
     */
    ngOnInit(): void
    {
        // Puedes añadir lógica adicional aquí si es necesario
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Sign in
     */
    signIn(): void
    {
        // Return if the form is invalid
        if (this.signInForm.invalid)
        {
            // Marcar todos los campos como tocados para mostrar errores
            Object.keys(this.signInForm.controls).forEach(key => {
                const control = this.signInForm.get(key);
                control.markAsTouched();
            });
            return;
        }

        // Disable the form
        this.signInForm.disable();
        this.isLoading = true;

        // Hide the alert
        this.showAlert = false;
        
        // Sign in
        this._authService.signIn(this.signInForm.value)
            .subscribe(
                (response) =>
                {
                    // Set the redirect url.
                    localStorage.setItem('token', response.token); 
                    const redirectURL = this._activatedRoute.snapshot.queryParamMap.get('redirectURL') || '/signed-in-redirect';
                    
                    // Navigate to the redirect url
                    this._router.navigate(['/apps/help-center']);
                },
                (response) =>
                {
                    console.error('Error:', response);
                    // Re-enable the form
                    this.signInForm.enable();
                    this.isLoading = false;

                    // Establecer el mensaje de error
                    if (response.status === 401) {
                        this.alert = {
                            type: 'error',
                            message: 'Correo o contraseña incorrecta',
                        };
                    } else {
                        this.alert = {
                            type: 'error',
                            message: 'Error al iniciar sesión, vuelva a intentar',
                        };
                    }

                    // Show the alert
                    this.showAlert = true;
                },
            );
    }
}