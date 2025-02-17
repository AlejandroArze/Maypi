import { Component, OnInit } from '@angular/core';
import { PanicService } from './panic.service';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatMenuModule } from '@angular/material/menu';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'app-panic',
    templateUrl: './panic.component.html',
    styles: [''],
    standalone: true,
    imports: [
        CommonModule,
        MatButtonModule,
        MatIconModule,
        MatTableModule,
        MatMenuModule,
        RouterModule
    ]
})
export class PanicComponent implements OnInit {
    panicRequests: any[] = [];

    constructor(private _panicService: PanicService) {}

    ngOnInit(): void {
        // Aquí se cargarían las solicitudes de pánico
        this.loadPanicRequests();
    }

    private loadPanicRequests(): void {
        // Implementar la carga de solicitudes
    }
} 