import { Component } from '@angular/core';
import { StatsService } from './stats.service';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatMenuModule } from '@angular/material/menu';

@Component({
    selector: 'app-stats',
    templateUrl: './stats.component.html',
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
export class StatsComponent {
    constructor(private _statsService: StatsService) {}
} 