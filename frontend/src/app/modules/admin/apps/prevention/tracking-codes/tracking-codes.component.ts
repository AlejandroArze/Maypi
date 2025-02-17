import { Component } from '@angular/core';
import { TrackingCodesService } from './tracking-codes.service';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatMenuModule } from '@angular/material/menu';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
    selector: 'app-tracking-codes',
    templateUrl: './tracking-codes.component.html',
    styles: [''],
    standalone: true,
    imports: [
        CommonModule,
        MatButtonModule,
        MatIconModule,
        MatTableModule,
        MatMenuModule,
        MatFormFieldModule,
        MatInputModule,
        FormsModule,
        ReactiveFormsModule
    ]
})
export class TrackingCodesComponent {
    constructor(private _trackingCodesService: TrackingCodesService) {}
} 