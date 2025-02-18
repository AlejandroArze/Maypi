import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatMenuModule } from '@angular/material/menu';
import { RouterModule } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MissingTrackingService, MissingCase } from './missing-tracking.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
    selector: 'app-missing-tracking',
    templateUrl: './missing-tracking.component.html',
    styles: [`
        :host {
            display: block;
        }
        .case-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 1rem;
            padding: 1rem;
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
        .status-investigating {
            background-color: #FEF3C7;
            color: #92400E;
        }
        .status-found {
            background-color: #D1FAE5;
            color: #065F46;
        }
        .case-card {
            transition: transform 0.2s;
        }
        .case-card:hover {
            transform: translateY(-2px);
        }
    `],
    standalone: true,
    imports: [
        CommonModule,
        MatButtonModule,
        MatIconModule,
        MatTableModule,
        MatMenuModule,
        RouterModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        FormsModule,
        ReactiveFormsModule,
        MatCardModule,
        MatDividerModule,
        MatProgressBarModule,
        MatDialogModule,
        MatSnackBarModule
    ]
})
export class MissingTrackingComponent implements OnInit {
    cases: MissingCase[] = [];
    filteredCases: MissingCase[] = [];
    searchTerm: string = '';
    selectedStatus: string = 'all';

    constructor(
        private _missingTrackingService: MissingTrackingService,
        private _dialog: MatDialog,
        private _snackBar: MatSnackBar
    ) {}

    ngOnInit(): void {
        this.loadCases();
    }

    loadCases(): void {
        this._missingTrackingService.getCases().subscribe(
            (cases) => {
                this.cases = cases;
                this.applyFilters();
            },
            (error) => {
                console.error('Error al cargar casos:', error);
                this.showNotification('Error al cargar los casos', 'error');
            }
        );
    }

    applyFilters(): void {
        this.filteredCases = this.cases.filter(case_ => {
            const matchesSearch = !this.searchTerm || 
                case_.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                case_.location.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                case_.id.toLowerCase().includes(this.searchTerm.toLowerCase());
            
            const matchesStatus = this.selectedStatus === 'all' || case_.status === this.selectedStatus;
            
            return matchesSearch && matchesStatus;
        });
    }

    updateStatus(caseId: string, newStatus: 'active' | 'found' | 'investigating'): void {
        this._missingTrackingService.updateCaseStatus(caseId, newStatus).subscribe(
            () => {
                const caseToUpdate = this.cases.find(c => c.id === caseId);
                if (caseToUpdate) {
                    caseToUpdate.status = newStatus;
                    this.showNotification('Estado actualizado correctamente', 'success');
                }
            },
            (error) => {
                console.error('Error al actualizar estado:', error);
                this.showNotification('Error al actualizar el estado', 'error');
            }
        );
    }

    viewDetails(caseId: string): void {
        // Implementar vista detallada
        console.log('Ver detalles del caso:', caseId);
    }

    addUpdate(caseId: string): void {
        // Implementar agregar actualización
        console.log('Agregar actualización al caso:', caseId);
    }

    getStatusClass(status: string): string {
        switch (status) {
            case 'active':
                return 'status-active';
            case 'investigating':
                return 'status-investigating';
            case 'found':
                return 'status-found';
            default:
                return '';
        }
    }

    getStatusText(status: string): string {
        switch (status) {
            case 'active':
                return 'Activo';
            case 'investigating':
                return 'En Investigación';
            case 'found':
                return 'Encontrado';
            default:
                return status;
        }
    }

    private showNotification(message: string, type: 'success' | 'error'): void {
        this._snackBar.open(message, 'Cerrar', {
            duration: 5000,
            panelClass: type === 'success' ? ['bg-green-500'] : ['bg-red-500'],
        });
    }
} 