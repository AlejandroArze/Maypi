import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';

import { EmergencyService } from './emergency.service';
import { EmergencyRequest } from './emergency.interface';

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
import CircleStyle from 'ol/style/Circle';
import Fill from 'ol/style/Fill';
import Stroke from 'ol/style/Stroke';
import { Geometry, Point as OLPoint } from 'ol/geom';
import { boundingExtent } from 'ol/extent';

@Component({
    selector: 'app-emergency',
    templateUrl: './emergency.component.html',
    standalone: true,
    imports: [
        CommonModule,
        MatButtonModule,
        MatIconModule,
        MatTableModule,
        MatPaginatorModule
    ]
})
export class EmergencyComponent implements OnInit, AfterViewInit {
    @ViewChild(MatPaginator) paginator!: MatPaginator;
    @ViewChild('map', { static: false }) mapContainer!: ElementRef;

    map!: Map;
    vectorSource!: VectorSource;
    vectorLayer!: VectorLayer<VectorSource>;

    emergencyRequests: EmergencyRequest[] = [];
    displayedColumns: string[] = ['personCode', 'location', 'coordinates', 'timestamp', 'actions'];

    constructor(private _emergencyService: EmergencyService) {}

    ngOnInit(): void {
        this.loadEmergencyRequests();
    }

    ngAfterViewInit(): void {
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
                // Coordenadas de ejemplo: Lima, Perú
                center: fromLonLat([-77.0428, -12.0464]), 
                zoom: 10
            })
        });
    }

    loadEmergencyRequests(): void {
        this._emergencyService.getEmergencyRequests().subscribe({
            next: (requests) => {
                this.emergencyRequests = requests;
                this.updateMapMarkers();
            },
            error: (error) => {
                console.error('Error cargando solicitudes', error);
            }
        });
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
            geometry: (feature) => {
                const geometry = feature.getGeometry();
                
                if (geometry instanceof OLPoint) {
                    const coordinates = geometry.getCoordinates();
                    const pinHeight = 20;
                    return new OLPoint([
                        coordinates[0], 
                        coordinates[1] - pinHeight / 111111
                    ]);
                }
                
                return geometry;
            }
        });
    }

    updateMapMarkers(): void {
        // Limpiar marcadores anteriores
        this.vectorSource.clear();

        // Añadir nuevos marcadores con estilos personalizados
        this.emergencyRequests.forEach((request) => {
            // Crear nuevo marcador
            const marker = new Feature({
                geometry: new Point(fromLonLat([
                    request.location.coordinates.longitude, 
                    request.location.coordinates.latitude
                ]))
            });

            // Estilo del marcador personalizado
            marker.setStyle(this.createCustomPinStyle());

            // Añadir marcador
            this.vectorSource.addFeature(marker);
        });

        // Ajustar vista del mapa
        if (this.emergencyRequests.length > 0) {
            const coordinates = this.emergencyRequests.map(req => 
                fromLonLat([
                    req.location.coordinates.longitude, 
                    req.location.coordinates.latitude
                ])
            );

            const extent = boundingExtent(coordinates);

            this.map.getView().fit(extent, {
                padding: [50, 50, 50, 50],
                duration: 1000
            });
        }
    }

    viewEmergencyDetails(request: EmergencyRequest): void {
        // Limpiar marcadores anteriores
        this.vectorSource.clear();

        // Crear nuevo marcador
        const marker = new Feature({
            geometry: new Point(fromLonLat([
                request.location.coordinates.longitude, 
                request.location.coordinates.latitude
            ]))
        });

        // Estilo del marcador con color destacado
        marker.setStyle(this.createCustomPinStyle('#FF5722')); // Color más llamativo

        // Añadir marcador
        this.vectorSource.addFeature(marker);

        // Centrar mapa en la ubicación
        this.map.getView().animate({
            center: fromLonLat([
                request.location.coordinates.longitude, 
                request.location.coordinates.latitude
            ]),
            zoom: 15,
            duration: 1000
        });

        console.log('Detalles de solicitud:', request);
    }

    updateEmergencyStatus(id: string, status: string): void {
        this._emergencyService.updateEmergencyRequestStatus(id, status).subscribe({
            next: (updatedRequest) => {
                const index = this.emergencyRequests.findIndex(req => req.id === id);
                if (index !== -1) {
                    this.emergencyRequests[index] = updatedRequest;
                }
            },
            error: (error) => {
                console.error('Error actualizando estado de solicitud', error);
            }
        });
    }
} 