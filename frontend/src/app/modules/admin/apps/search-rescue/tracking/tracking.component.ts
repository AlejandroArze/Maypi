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

// Importar OpenLayers
import { Map, View } from 'ol';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import { fromLonLat } from 'ol/proj';
import Style from 'ol/style/Style';
import Icon from 'ol/style/Icon';
import { boundingExtent } from 'ol/extent';
import CircleStyle from 'ol/style/Circle';
import Fill from 'ol/style/Fill';
import Stroke from 'ol/style/Stroke';
import { Geometry, Point as OLPoint } from 'ol/geom';

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
    
    map: Map;
    vectorSource: VectorSource;
    vectorLayer: VectorLayer<VectorSource>;
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
            this.map.dispose();
        }

        // Crear fuente de vectores para marcadores
        this.vectorSource = new VectorSource();
        this.vectorLayer = new VectorLayer({
            source: this.vectorSource
        });

        // Inicializar mapa con OpenLayers
        this.map = new Map({
            target: this.mapContainer.nativeElement,
            layers: [
                new TileLayer({
                    source: new OSM()
                }),
                this.vectorLayer
            ],
            view: new View({
                // Coordenadas de ejemplo: -17.375751, -66.1580363
                center: fromLonLat([-66.1580363, -17.375751]), // Nota: longitud primero, latitud después
                zoom: 18 // Zoom alto para ver detalles
            })
        });
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

    createCustomPinStyle(color: string = '#2196F3'): Style {
        return new Style({
            image: new CircleStyle({
                radius: 10,
                fill: new Fill({
                    color: color
                }),
                stroke: new Stroke({
                    color: 'white',
                    width: 3
                })
            }),
            // Añadir un pin triangular
            geometry: (feature) => {
                const geometry = feature.getGeometry();
                
                // Verificar si es una instancia de Point
                if (geometry instanceof OLPoint) {
                    const coordinates = geometry.getCoordinates();
                    const pinHeight = 20;
                    return new OLPoint([
                        coordinates[0], 
                        coordinates[1] - pinHeight / 111111 // Convertir píxeles a grados
                    ]);
                }
                
                // Si no es un punto, devolver la geometría original
                return geometry;
            }
        });
    }

    updateMapMarkers(): void {
        // Limpiar marcadores anteriores
        this.vectorSource.clear();

        // Añadir nuevos marcadores con estilos personalizados
        this.locations.forEach((location, index) => {
            // Crear nuevo marcador
            const marker = new Feature({
                geometry: new Point(fromLonLat([location.longitude, location.latitude]))
            });

            // Estilo del marcador personalizado
            marker.setStyle(this.createCustomPinStyle());

            // Añadir marcador
            this.vectorSource.addFeature(marker);
        });

        // Ajustar vista del mapa
        if (this.locations.length > 0) {
            const coordinates = this.locations.map(loc => 
                fromLonLat([loc.longitude, loc.latitude])
            );

            const extent = boundingExtent(coordinates);

            this.map.getView().fit(extent, {
                padding: [50, 50, 50, 50],
                duration: 1000
            });
        }
    }

    onPageChange(event: PageEvent): void {
        this.pageIndex = event.pageIndex;
        this.pageSize = event.pageSize;
        this.updateDisplayedLocations();
    }

    selectLocation(location: TrackingLocation): void {
        // Limpiar marcadores anteriores
        this.vectorSource.clear();

        // Crear nuevo marcador
        const marker = new Feature({
            geometry: new Point(fromLonLat([location.longitude, location.latitude]))
        });

        // Estilo del marcador con color destacado
        marker.setStyle(this.createCustomPinStyle('#FF5722')); // Color más llamativo

        // Añadir marcador
        this.vectorSource.addFeature(marker);

        // Centrar mapa en la ubicación
        this.map.getView().animate({
            center: fromLonLat([location.longitude, location.latitude]),
            zoom: 15,
            duration: 1000
        });
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