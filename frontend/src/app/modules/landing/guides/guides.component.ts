import { Component, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-guides',
  templateUrl: './guides.component.html',
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    RouterLink
  ]
})
export class GuidesComponent {
  // Propiedad para controlar la visibilidad del menú móvil
  isMenuOpen: boolean = false;
  
  // Propiedad para mostrar el año actual en el footer
  currentYear: number = new Date().getFullYear();
  
  // Método para alternar la visibilidad del menú móvil
  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }
}