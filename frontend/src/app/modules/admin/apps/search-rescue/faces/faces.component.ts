import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatMenuModule } from '@angular/material/menu';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatPaginatorModule } from '@angular/material/paginator';

interface Alert {
    timestamp: string;
    location: string;
    matchPercentage: number;
    status: 'urgent' | 'pending' | 'verified';
}

interface InternetResult {
    platform: string;
    platformIcon: string;
    username: string;
    matchPercentage: number;
    link: string;
    image: string;
    multiIcons?: string[];
}

interface TerminalAlert extends Alert {
    image?: string;
}

@Component({
    selector: 'app-faces',
    templateUrl: './faces.component.html',
    styleUrls: ['./faces.component.css'],
    standalone: true,
    imports: [
        CommonModule,
        MatButtonModule,
        MatIconModule,
        MatTableModule,
        MatMenuModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatProgressBarModule,
        MatPaginatorModule
    ]
})
export class FacesComponent implements OnInit {
    @ViewChild('fileInput') fileInput: ElementRef;
    @ViewChild('dropArea') dropArea: ElementRef;
    @ViewChild('scanParent') scanParent: ElementRef;

    displayedColumns: string[] = ['timestamp', 'location', 'matchPercentage', 'status', 'actions'];
    alerts: TerminalAlert[] = [];

    selectedImage: string | ArrayBuffer | null = null;
    isSearching: boolean = false;
    searchProgress: number = 0;
    searchingFaces: string[] = [];
    activeTab: 'terminal' | 'internet' = 'terminal';
    isSearchingInternet: boolean = false;
    isSearchingTerminal: boolean = false;
    searchProgressInternet: number = 0;
    searchProgressTerminal: number = 0;

    internetResults: InternetResult[] = [];

    // Configuración de paginación
    pageSize: number = 10;
    currentPageTerminal: number = 1;
    currentPageInternet: number = 1;
    pageSizeOptions: number[] = [5, 10, 15, 20];

    constructor() { }

    ngOnInit(): void {
        this.setupDragAndDrop();
    }

    setupDragAndDrop(): void {
        const dropArea = this.dropArea.nativeElement;

        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropArea.addEventListener(eventName, this.preventDefaults, false);
        });

        dropArea.addEventListener('drop', this.handleDrop.bind(this), false);
    }

    preventDefaults(e: Event): void {
        e.preventDefault();
        e.stopPropagation();
    }

    handleDrop(e: DragEvent): void {
        const dt = e.dataTransfer;
        const files = dt?.files;
        
        if (files && files.length > 0) {
            this.handleFiles(files);
        }
    }

    handleFiles(files: FileList | File[]): void {
        const file = files[0];
        const reader = new FileReader();

        reader.onload = (e) => {
            this.selectedImage = e.target?.result;
            this.updateDropArea();
        };

        reader.readAsDataURL(file);
    }

    updateDropArea(): void {
        const dropArea = this.dropArea.nativeElement;
        dropArea.innerHTML = `
            <img src="${this.selectedImage}" class="selected-image" style="max-width: 100%; max-height: 200px; object-fit: contain;">
        `;
    }

    startSearch(): void {
        if (!this.selectedImage) {
            alert('Por favor, selecciona una imagen primero');
            return;
        }

        // Reiniciar estado de búsqueda para permitir múltiples búsquedas
        this.isSearching = true;
        this.searchProgress = 0;
        this.searchingFaces = [];

        // Simular búsqueda con múltiples rostros
        this.startSearchAnimation();
    }

    startSearchAnimation(): void {
        // Generar rostros aleatorios para la animación
        const faceUrls = [
            'https://randomuser.me/api/portraits/men/1.jpg',
            'https://randomuser.me/api/portraits/women/2.jpg',
            'https://randomuser.me/api/portraits/men/3.jpg',
            'https://randomuser.me/api/portraits/women/4.jpg',
            'https://randomuser.me/api/portraits/men/5.jpg'
        ];

        // Animación de progreso y rostros
        const interval = setInterval(() => {
            // Añadir un rostro cada iteración
            if (this.searchingFaces.length < faceUrls.length) {
                this.searchingFaces.push(faceUrls[this.searchingFaces.length]);
            }

            // Incrementar progreso
            this.searchProgress += 20;

            // Detener cuando llegue al 100%
            if (this.searchProgress >= 100) {
                clearInterval(interval);
                setTimeout(() => {
                    // Determinar qué pestaña está activa y cargar resultados correspondientes
                    if (this.activeTab === 'internet') {
                        this.loadInternetResultsWithDelay();
                    } else if (this.activeTab === 'terminal') {
                        this.loadTerminalResultsWithDelay();
                    }
                }, 1000);
            }
        }, 1000);
    }

    stopSearchAnimation(): void {
        this.isSearching = false;
        this.searchProgress = 0;
        this.searchingFaces = [];
    }

    showSearchResults(): void {
        // Implementar lógica para mostrar resultados de búsqueda
        console.log('Mostrando resultados de búsqueda');
        // Aquí podrías abrir un modal o mostrar los resultados
    }

    startCapture(): void {
        // Implementar lógica para iniciar captura
        console.log('Iniciando nueva captura...');
    }

    viewDetails(alert: TerminalAlert): void {
        // Implementar lógica para ver detalles
        console.log('Viendo detalles de alerta:', alert);
    }

    verifyAlert(alert: TerminalAlert): void {
        // Implementar lógica para verificar alerta
        console.log('Verificando alerta:', alert);
    }

    reportFalsePositive(alert: TerminalAlert): void {
        // Implementar lógica para reportar falso positivo
        console.log('Reportando falso positivo:', alert);
    }

    updateThreshold(value: number): void {
        // Implementar lógica para actualizar umbral
        console.log('Actualizando umbral a:', value);
    }

    updateActiveCameras(cameras: string[]): void {
        // Implementar lógica para actualizar cámaras activas
        console.log('Actualizando cámaras activas:', cameras);
    }

    // Métodos de paginación
    getPaginatedTerminalAlerts(): TerminalAlert[] {
        const startIndex = (this.currentPageTerminal - 1) * this.pageSize;
        return this.alerts.slice(startIndex, startIndex + this.pageSize);
    }

    getPaginatedInternetResults(): InternetResult[] {
        const startIndex = (this.currentPageInternet - 1) * this.pageSize;
        return this.internetResults.slice(startIndex, startIndex + this.pageSize);
    }

    onPageChangeTerminal(event: any): void {
        this.currentPageTerminal = event.pageIndex + 1;
        this.pageSize = event.pageSize;
    }

    onPageChangeInternet(event: any): void {
        this.currentPageInternet = event.pageIndex + 1;
        this.pageSize = event.pageSize;
    }

    // Método para buscar en Internet
    searchInternet(): void {
        if (!this.selectedImage) {
            alert('Por favor, selecciona una imagen primero');
            return;
        }

        // Reiniciar resultados
        this.internetResults = [];
        
        this.isSearchingInternet = true;
        this.searchProgressInternet = 0;
        this.activeTab = 'internet';

        // Simular búsqueda con progreso
        const searchInterval = setInterval(() => {
            this.searchProgressInternet += 33;

            if (this.searchProgressInternet >= 99) {
                clearInterval(searchInterval);
                
                // Simular tiempo de espera de 3 segundos antes de mostrar resultados
                setTimeout(() => {
                    // Simular carga de imágenes con retraso
                    this.loadInternetResultsWithDelay();
                }, 3000);
            }
        }, 1000);
    }

    // Método para buscar en Terminal/Aeropuerto
    searchTerminal(): void {
        if (!this.selectedImage) {
            alert('Por favor, selecciona una imagen primero');
            return;
        }

        // Reiniciar resultados
        this.alerts = [];
        
        this.isSearchingTerminal = true;
        this.searchProgressTerminal = 0;
        this.activeTab = 'terminal';

        // Simular búsqueda con progreso
        const searchInterval = setInterval(() => {
            this.searchProgressTerminal += 33;

            if (this.searchProgressTerminal >= 99) {
                clearInterval(searchInterval);
                
                // Simular tiempo de espera de 3 segundos antes de mostrar resultados
                setTimeout(() => {
                    // Simular carga de imágenes con retraso
                    this.loadTerminalResultsWithDelay();
                }, 3000);
            }
        }, 1000);
    }

    // Método para cargar resultados de Internet con retraso
    loadInternetResultsWithDelay(): void {
        // Generar resultados
        const results = this.generateInternetResults();
        
        // Cargar imágenes con retraso
        results.forEach((result, index) => {
            setTimeout(() => {
                // Añadir resultados uno por uno
                this.internetResults.push(result);
                
                // Desactivar búsqueda cuando se carguen todos los resultados
                if (index === results.length - 1) {
                    // No desactivar completamente la búsqueda
                    this.searchProgress = 0;
                    this.searchingFaces = [];
                }
            }, (index + 1) * 500); // Retraso incremental entre imágenes
        });
    }

    // Método para cargar resultados de Terminal con retraso
    loadTerminalResultsWithDelay(): void {
        // Generar resultados
        const results = this.generateTerminalResults();
        
        // Cargar imágenes con retraso
        results.forEach((result, index) => {
            setTimeout(() => {
                // Añadir resultados uno por uno
                this.alerts.push(result);
                
                // Desactivar búsqueda cuando se carguen todos los resultados
                if (index === results.length - 1) {
                    // No desactivar completamente la búsqueda
                    this.searchProgress = 0;
                    this.searchingFaces = [];
                }
            }, (index + 1) * 500); // Retraso incremental entre imágenes
        });
    }

    // Método para generar resultados aleatorios de Internet
    generateInternetResults(): InternetResult[] {
        return [
            {
                platform: 'Instagram',
                platformIcon: 'https://cdn-icons-png.flaticon.com/128/2111/2111463.png',
                username: 'Resultado Internet 1',
                matchPercentage: 81,
                link: 'https://instagram.com',
                image: 'https://randomuser.me/api/portraits/men/21.jpg'
            },
            {
                platform: 'LinkedIn',
                platformIcon: 'https://cdn-icons-png.flaticon.com/128/3536/3536505.png',
                username: 'Resultado Internet 2',
                matchPercentage: 79,
                link: 'https://linkedin.com',
                image: 'https://randomuser.me/api/portraits/men/22.jpg'
            },
            {
                platform: 'Facebook',
                platformIcon: 'https://cdn-icons-png.flaticon.com/128/5968/5968764.png',
                username: 'Resultado Internet 3',
                matchPercentage: 77,
                link: 'https://facebook.com',
                image: 'https://randomuser.me/api/portraits/men/23.jpg'
            },
            {
                platform: 'TikTok',
                platformIcon: 'https://cdn-icons-png.flaticon.com/128/3046/3046121.png',
                username: 'Resultado Internet 4',
                matchPercentage: 76,
                link: 'https://tiktok.com',
                image: 'https://randomuser.me/api/portraits/men/24.jpg'
            },
            {
                platform: 'Twitter',
                platformIcon: 'https://cdn-icons-png.flaticon.com/128/3670/3670151.png',
                username: 'Resultado Internet 5',
                matchPercentage: 75,
                link: 'https://twitter.com',
                image: 'https://randomuser.me/api/portraits/men/25.jpg'
            }
        ];
    }

    // Método para generar resultados aleatorios de Terminal
    generateTerminalResults(): TerminalAlert[] {
        return [
            {
                timestamp: '14:30 PM',
                location: 'Resultado Terminal 1',
                matchPercentage: 92,
                status: 'verified',
                image: 'https://randomuser.me/api/portraits/men/31.jpg'
            },
            {
                timestamp: '15:00 PM',
                location: 'Resultado Terminal 2',
                matchPercentage: 88,
                status: 'pending',
                image: 'https://randomuser.me/api/portraits/men/32.jpg'
            },
            {
                timestamp: '15:30 PM',
                location: 'Resultado Terminal 3',
                matchPercentage: 85,
                status: 'urgent',
                image: 'https://randomuser.me/api/portraits/men/33.jpg'
            }
            // ... más resultados
        ];
    }

    // Métodos para cambiar la pestaña activa sin buscar
    selectTerminalTab(): void {
        this.activeTab = 'terminal';
    }

    selectInternetTab(): void {
        this.activeTab = 'internet';
    }
} 