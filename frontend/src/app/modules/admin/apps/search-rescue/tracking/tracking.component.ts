import { Component, OnInit } from '@angular/core';
import { TrackingService, SearchOperation } from './tracking.service';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatMenuModule } from '@angular/material/menu';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
    selector: 'app-tracking',
    templateUrl: './tracking.component.html',
    styles: [`
        :host {
            display: block;
        }
        .operation-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 1rem;
        }
        .status-badge {
            padding: 0.25rem 0.75rem;
            border-radius: 9999px;
            font-size: 0.875rem;
            font-weight: 500;
        }
        .status-active {
            background-color: #FEE2E2;
            color: #991B1B;
        }
        .status-paused {
            background-color: #FEF3C7;
            color: #92400E;
        }
        .status-completed {
            background-color: #D1FAE5;
            color: #065F46;
        }
        .update-card {
            border-left: 4px solid transparent;
        }
        .update-info {
            border-left-color: #3B82F6;
        }
        .update-alert {
            border-left-color: #EF4444;
        }
        .update-success {
            border-left-color: #10B981;
        }
        .weather-icon {
            font-size: 2rem;
            width: 2rem;
            height: 2rem;
        }
    `],
    standalone: true,
    imports: [
        CommonModule,
        MatButtonModule,
        MatIconModule,
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
export class TrackingComponent implements OnInit {
    activeOperations: SearchOperation[] = [];

    constructor(private _trackingService: TrackingService) {}

    ngOnInit(): void {
        this.loadActiveOperations();
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