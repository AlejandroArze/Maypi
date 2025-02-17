import { Component } from '@angular/core';
import { FacesService } from './faces.service';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatMenuModule } from '@angular/material/menu';

@Component({
    selector: 'app-faces',
    templateUrl: './faces.component.html',
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
export class FacesComponent {
    constructor(private _facesService: FacesService) {}
} 