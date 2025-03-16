import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { TrackingService } from './services/tracking.service';
import { TrackingLocation } from './models/tracking-location.model';
import { SearchOperation } from './models/search-operation.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { MatMenuModule } from '@angular/material/menu';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';

// Importar librería de mapas (por ejemplo, Leaflet)
import * as L from 'leaflet';

@Component({
    selector: 'app-tracking',
    templateUrl: './tracking.component.html',
    styleUrls: ['./tracking.component.scss'],
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        MatButtonModule,
        MatIconModule,
        MatInputModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatPaginatorModule,
        MatTableModule,
        MatMenuModule,
        MatCardModule,
        MatDividerModule,
        MatProgressBarModule,
        MatChipsModule,
        MatBadgeModule,
        MatTooltipModule
    ]
})
export class TrackingComponent implements OnInit, AfterViewInit {
    @ViewChild('map', { static: false }) mapContainer: ElementRef;
    
    map: L.Map;
    trackingCode: string = '';
    dateStart: Date | null = null;
    dateEnd: Date | null = null;
    
    locations: TrackingLocation[] = [];
    displayedLocations: TrackingLocation[] = [];
    
    pageSize = 10;
    pageIndex = 0;

    activeOperations: SearchOperation[] = [];

    constructor(private trackingService: TrackingService) {}

    ngOnInit(): void {
        this.loadMockLocations();
        this.loadActiveOperations();
    }

    ngAfterViewInit(): void {
        // Usar setTimeout para asegurar que el DOM esté completamente renderizado
        setTimeout(() => {
            if (this.mapContainer && this.mapContainer.nativeElement) {
                this.initMap();
            }
        });
    }

    initMap(): void {
        // Destruir mapa existente si lo hay
        if (this.map) {
            this.map.remove();
        }

        // Inicializar mapa con Leaflet
        this.map = L.map(this.mapContainer.nativeElement, {
            center: [-34.6037, -58.3816],
            zoom: 10,
            attributionControl: true
        });
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '© OpenStreetMap contributors'
        }).addTo(this.map);

        // Forzar recalculo del tamaño del mapa
        this.map.invalidateSize();
    }

    loadMockLocations(): void {
        this.trackingService.getMockLocations().subscribe(
            (locations) => {
                this.locations = locations;
                this.updateDisplayedLocations();
                this.updateMapMarkers();
            },
            (error) => {
                console.error('Error al cargar ubicaciones:', error);
            }
        );
    }

    searchTracking(): void {
        // En el futuro, usará los parámetros de búsqueda
        this.trackingService.getTrackingLocations(
            this.trackingCode, 
            this.dateStart, 
            this.dateEnd
        ).subscribe(
            (locations) => {
                this.locations = locations;
                this.updateDisplayedLocations();
                this.updateMapMarkers();
            },
            (error) => {
                console.error('Error al buscar ubicaciones:', error);
            }
        );
    }

    updateDisplayedLocations(): void {
        const startIndex = this.pageIndex * this.pageSize;
        this.displayedLocations = this.locations.slice(
            startIndex, 
            startIndex + this.pageSize
        );
    }

    updateMapMarkers(): void {
        // Limpiar marcadores anteriores
        this.map.eachLayer((layer) => {
            if (layer instanceof L.Marker) {
                this.map.removeLayer(layer);
            }
        });

        // Añadir nuevos marcadores con iconos personalizados y más información
        this.locations.forEach((location, index) => {
            // Crear un ícono personalizado
            const markerIcon = L.divIcon({
                className: 'custom-marker',
                html: `
                    <div class="marker-pin bg-blue-500 text-white">
                        <span>${index + 1}</span>
                    </div>
                `,
                iconSize: [30, 30],
                iconAnchor: [15, 30]
            });

            // Crear marcador con información detallada
            const marker = L.marker(
                [location.latitude, location.longitude], 
                { icon: markerIcon }
            ).addTo(this.map);

            // Popup con información detallada
            marker.bindPopup(`
                <div class="popup-content">
                    <strong>Ubicación ${index + 1}</strong><br>
                    <p>Código: ${location.trackingCode}</p>
                    <p>Hora: ${location.timestamp.toLocaleString()}</p>
                    <p>Coordenadas: ${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}</p>
                    <p>${location.description || 'Sin descripción adicional'}</p>
                </div>
            `);
        });

        // Ajustar vista del mapa
        if (this.locations.length > 0) {
            const bounds = L.latLngBounds(
                this.locations.map(loc => [loc.latitude, loc.longitude])
            );
            this.map.fitBounds(bounds, {
                padding: [50, 50] // Añadir un poco de padding
            });
        }
    }

    onPageChange(event: PageEvent): void {
        this.pageIndex = event.pageIndex;
        this.pageSize = event.pageSize;
        this.updateDisplayedLocations();
    }

    selectLocation(location: TrackingLocation): void {
        // Centrar mapa en la ubicación seleccionada
        this.map.setView([location.latitude, location.longitude], 15);
    }

    loadActiveOperations(): void {
        this.trackingService.getActiveOperations().subscribe(
            (operations) => {
                this.activeOperations = operations;
            },
            (error) => {
                console.error('Error al cargar operaciones:', error);
            }
        );
    }

    updateOperationStatus(operationId: string, newStatus: string): void {
        this.trackingService.updateOperationStatus(operationId, newStatus).subscribe(
            (updatedOperation) => {
                const index = this.activeOperations.findIndex(op => op.id === operationId);
                if (index !== -1) {
                    this.activeOperations[index] = updatedOperation;
                }
            },
            (error) => {
                console.error('Error al actualizar estado:', error);
            }
        );
    }

    getStatusClass(status: string): string {
        switch (status) {
            case 'active':
                return 'status-active';
            case 'paused':
                return 'status-paused';
            case 'completed':
                return 'status-completed';
            default:
                return '';
        }
    }

    getStatusText(status: string): string {
        switch (status) {
            case 'active':
                return 'Activa';
            case 'paused':
                return 'Pausada';
            case 'completed':
                return 'Completada';
            default:
                return status;
        }
    }

    getTeamMemberStatusColor(status: string): string {
        switch (status) {
            case 'available':
                return 'bg-green-100 text-green-800';
            case 'deployed':
                return 'bg-blue-100 text-blue-800';
            case 'resting':
                return 'bg-yellow-100 text-yellow-800';
            default:
                return '';
        }
    }

    getUpdateTypeClass(type: string): string {
        switch (type) {
            case 'info':
                return 'update-info';
            case 'alert':
                return 'update-alert';
            case 'success':
                return 'update-success';
            default:
                return '';
        }
    }

    getWeatherIcon(conditions: string): string {
        switch (conditions.toLowerCase()) {
            case 'soleado':
                return 'wb_sunny';
            case 'parcialmente nublado':
                return 'partly_cloudy_day';
            case 'nublado':
                return 'cloud';
            case 'lluvia':
                return 'rainy';
            default:
                return 'wb_sunny';
        }
    }

    formatDate(date: string): string {
        return new Date(date).toLocaleString();
    }

    addUpdate(operationId: string): void {
        // Implementar diálogo para agregar actualización
        console.log('Agregar actualización a operación:', operationId);
    }
} 