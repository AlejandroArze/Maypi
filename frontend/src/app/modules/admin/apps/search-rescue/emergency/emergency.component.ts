import { Component } from '@angular/core';
import { EmergencyService } from './emergency.service';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatMenuModule } from '@angular/material/menu';

@Component({
    selector: 'app-emergency',
    templateUrl: './emergency.component.html',
    styles: [''],
    standalone: true,
    imports: [
        CommonModule,
        MatButtonModule,
        MatIconModule,
        MatTableModule,
        MatMenuModule
    ]
})
export class EmergencyComponent {
    constructor(private _emergencyService: EmergencyService) {}
} 