import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { TrackingService, SearchOperation } from './tracking.service';
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

interface TrackingLocation {
    id: string;
    timestamp: Date;
    latitude: number;
    longitude: number;
    trackingCode: string;
}

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

    constructor(private _trackingService: TrackingService) {}

    ngOnInit(): void {
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

    searchTracking(): void {
        // Lógica para buscar ubicaciones por código de seguimiento y rango de fechas
        // Esta es una implementación simulada, deberías reemplazarla con tu servicio real
        this.locations = this.getMockLocations();
        this.updateDisplayedLocations();
        this.updateMapMarkers();
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

        // Añadir nuevos marcadores
        this.locations.forEach(location => {
            L.marker([location.latitude, location.longitude])
                .addTo(this.map)
                .bindPopup(`
                    Código: ${location.trackingCode}<br>
                    Hora: ${location.timestamp.toLocaleString()}
                `);
        });

        // Ajustar vista del mapa
        if (this.locations.length > 0) {
            const bounds = L.latLngBounds(
                this.locations.map(loc => [loc.latitude, loc.longitude])
            );
            this.map.fitBounds(bounds);
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

    // Método de ejemplo - reemplazar con servicio real
    getMockLocations(): TrackingLocation[] {
        return [
            {
                id: '1',
                timestamp: new Date(),
                latitude: -34.6037,
                longitude: -58.3816,
                trackingCode: 'ABC123'
            },
            // Añadir más ubicaciones de ejemplo
        ];
    }

    loadActiveOperations(): void {
        this._trackingService.getActiveOperations().subscribe(
            (operations) => {
                this.activeOperations = operations;
            },
            (error) => {
                console.error('Error al cargar operaciones:', error);
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

    updateOperationStatus(operationId: string, newStatus: string): void {
        this._trackingService.updateOperationStatus(operationId, newStatus).subscribe(
            () => {
                const operation = this.activeOperations.find(op => op.id === operationId);
                if (operation) {
                    operation.status = newStatus as 'active' | 'paused' | 'completed';
                }
            },
            (error) => {
                console.error('Error al actualizar estado:', error);
            }
        );
    }

    addUpdate(operationId: string): void {
        // Implementar diálogo para agregar actualización
        console.log('Agregar actualización a operación:', operationId);
    }
} 