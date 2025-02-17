import { Component } from '@angular/core';
import { MissingTrackingService } from './missing-tracking.service';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatMenuModule } from '@angular/material/menu';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'app-missing-tracking',
    templateUrl: './missing-tracking.component.html',
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
export class MissingTrackingComponent {
    constructor(private _missingTrackingService: MissingTrackingService) {}
} 