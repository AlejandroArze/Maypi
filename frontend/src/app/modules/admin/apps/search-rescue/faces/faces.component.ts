import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatMenuModule } from '@angular/material/menu';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

interface Alert {
    timestamp: string;
    location: string;
    matchPercentage: number;
    status: 'urgent' | 'pending' | 'verified';
}

@Component({
    selector: 'app-faces',
    templateUrl: './faces.component.html',
    standalone: true,
    imports: [
        CommonModule,
        MatButtonModule,
        MatIconModule,
        MatTableModule,
        MatMenuModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule
    ]
})
export class FacesComponent implements OnInit {
    displayedColumns: string[] = ['timestamp', 'location', 'matchPercentage', 'status', 'actions'];
    alerts: Alert[] = [
        {
            timestamp: '10:30 AM',
            location: 'Entrada Principal',
            matchPercentage: 95,
            status: 'urgent'
        },
        {
            timestamp: '11:15 AM',
            location: 'Sala de Espera',
            matchPercentage: 87,
            status: 'pending'
        },
        {
            timestamp: '12:00 PM',
            location: 'Zona de Embarque',
            matchPercentage: 92,
            status: 'verified'
        }
    ];

    constructor() { }

    ngOnInit(): void {
        // Inicializar componente
    }

    startCapture(): void {
        // Implementar lógica para iniciar captura
        console.log('Iniciando nueva captura...');
    }

    viewDetails(alert: Alert): void {
        // Implementar lógica para ver detalles
        console.log('Viendo detalles de alerta:', alert);
    }

    verifyAlert(alert: Alert): void {
        // Implementar lógica para verificar alerta
        console.log('Verificando alerta:', alert);
    }

    reportFalsePositive(alert: Alert): void {
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
} 