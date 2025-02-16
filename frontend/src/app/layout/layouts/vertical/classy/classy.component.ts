import { NgIf, NgClass } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { FuseFullscreenComponent } from '@fuse/components/fullscreen';
import { FuseLoadingBarComponent } from '@fuse/components/loading-bar';
import { FuseNavigationService, FuseVerticalNavigationComponent } from '@fuse/components/navigation';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import { NavigationService } from 'app/core/navigation/navigation.service';
import { Navigation } from 'app/core/navigation/navigation.types';
import { UserService } from 'app/core/user/user.service';
import { User } from 'app/core/user/user.types';
import { LanguagesComponent } from 'app/layout/common/languages/languages.component';
import { MessagesComponent } from 'app/layout/common/messages/messages.component';
import { NotificationsComponent } from 'app/layout/common/notifications/notifications.component';
import { QuickChatComponent } from 'app/layout/common/quick-chat/quick-chat.component';
import { SearchComponent } from 'app/layout/common/search/search.component';
import { ShortcutsComponent } from 'app/layout/common/shortcuts/shortcuts.component';
import { UserComponent } from 'app/layout/common/user/user.component';
import { Subject, takeUntil } from 'rxjs';
import { environment } from 'environments/environment';
import { SchemeComponent } from 'app/layout/common/scheme/scheme.component';

@Component({
    selector     : 'classy-layout',
    templateUrl  : './classy.component.html',
    encapsulation: ViewEncapsulation.None,
    standalone   : true,
    imports      : [
        FuseLoadingBarComponent, 
        FuseVerticalNavigationComponent, 
        NotificationsComponent, 
        UserComponent, 
        NgIf,
        NgClass, 
        MatIconModule, 
        MatButtonModule, 
        LanguagesComponent, 
        FuseFullscreenComponent, 
        SearchComponent, 
        ShortcutsComponent, 
        MessagesComponent, 
        RouterOutlet, 
        QuickChatComponent, 
        SchemeComponent
    ],
})
export class ClassyLayoutComponent implements OnInit, OnDestroy
{
    isScreenSmall: boolean;
    navigation: Navigation;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    user: any;

    /**
     * Constructor
     */
    constructor(
        private _activatedRoute: ActivatedRoute,
        private _router: Router,
        private _navigationService: NavigationService,
        private _fuseMediaWatcherService: FuseMediaWatcherService,
        private _fuseNavigationService: FuseNavigationService,
    )
    {
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
                //console.log('userData completo:', userData); // Para ver toda la estructura
                //console.log('userData.data:', userData?.data); // Para ver específicamente data
                
                if (userData?.data) {
                    const userImage = userData.data.imagen || userData.data.image;
                    const nombres = userData.data.nombres || '';
                    const apellidos = userData.data.apellidos || '';
                    
                    // Obtener iniciales
                    const iniciales = this.getInitials(nombres, apellidos);
                    
                    // Obtener estado del usuario del localStorage o default a 'online'
                    const userStatus = localStorage.getItem('userStatus') || 'online';
                    
                    this.user = {
                        name: `${nombres} ${apellidos}`.trim(),
                        email: userData.data.email || '',
                        // Si no hay imagen, avatar será null y se mostrarán las iniciales
                        avatar: userImage ? `${environment.baseUrl}/${userImage}` : null,
                        status: userStatus,
                        initials: iniciales
                    };
                    console.log('Usuario cargado:', this.user);
                }
            } catch (error) {
                console.error('Error al parsear datos del usuario:', error);
                this.user = {
                    name: 'Usuario',
                    email: 'No disponible',
                    avatar: null,
                    status: 'online',
                    initials: 'U'
                };
            }
        }
    }

    /**
     * Actualiza el estado del usuario
     */
    updateUserStatus(status: 'online' | 'away' | 'busy' | 'not-visible'): void {
        if (this.user) {
            this.user.status = status;
            localStorage.setItem('userStatus', status);
        }
    }

    /**
     * Obtiene las iniciales del nombre y apellido
     */
    private getInitials(nombres: string, apellidos: string): string {
        const nombreInicial = nombres.charAt(0);
        const apellidoInicial = apellidos.charAt(0);
        return (nombreInicial + apellidoInicial).toUpperCase() || 'U';
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Getter for current year
     */
    get currentYear(): number
    {
        return new Date().getFullYear();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void
    {
        // Recargar datos del usuario al iniciar y cada vez que cambie el localStorage
        this.loadUserData();
        window.addEventListener('storage', () => this.loadUserData());

        // Subscribe to navigation data
        this._navigationService.navigation$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((navigation: Navigation) =>
            {
                this.navigation = navigation;
            });

        // Subscribe to media changes
        this._fuseMediaWatcherService.onMediaChange$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(({matchingAliases}) =>
            {
                // Check if the screen is small
                this.isScreenSmall = !matchingAliases.includes('md');
            });
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void
    {
        // Remover el listener de storage
        window.removeEventListener('storage', () => this.loadUserData());
        
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    getImageUrl(imagePath: string): string {
        console.log('Path de imagen recibido:', imagePath); // Para ver qué path llega
        if (!imagePath) {
            return null;
        }
        // Si la URL ya es completa (comienza con http o https), retornarla tal cual
        if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
            return imagePath;
        }
        // Si la URL comienza con una barra, quitarla para evitar doble barra
        const cleanPath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;
        return `${environment.baseUrl}/${cleanPath}`;
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Toggle navigation
     *
     * @param name
     */
    toggleNavigation(name: string): void
    {
        // Get the navigation
        const navigation = this._fuseNavigationService.getComponent<FuseVerticalNavigationComponent>(name);

        if ( navigation )
        {
            // Toggle the opened status
            navigation.toggle();
        }
    }
}
