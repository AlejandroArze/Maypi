import { Component } from '@angular/core';
import { TrackingService } from './tracking.service';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatMenuModule } from '@angular/material/menu';

@Component({
    selector: 'app-tracking',
    templateUrl: './tracking.component.html',
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
export class TrackingComponent {
    constructor(private _trackingService: TrackingService) {}
} 