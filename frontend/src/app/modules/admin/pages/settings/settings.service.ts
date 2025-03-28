import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  private selectedPanelSubject = new BehaviorSubject<string>(''); // Estado inicial vacío
  private selectedUserIdSubject = new BehaviorSubject<string | null>(null); // ID de usuario inicial vacío

  // Observable para escuchar los cambios en el panel seleccionado
  selectedPanel$ = this.selectedPanelSubject.asObservable();

  // Observable para escuchar el ID de usuario seleccionado
  selectedUserId$ = this.selectedUserIdSubject.asObservable();

  constructor(private _httpClient: HttpClient) {}

  // Cambiar el panel
  setSelectedPanel(panel: string): void {
    this.selectedPanelSubject.next(panel);
  }

  // Cambiar el ID del usuario seleccionado
  setSelectedUserId(userId: string): void {
    this.selectedUserIdSubject.next(userId);
  }

  // Método para obtener las configuraciones
  getSettings(): Observable<any> {
    return this._httpClient.get('/api/settings');
  }

  // Método para guardar las configuraciones
  saveSettings(settings: any): Observable<any> {
    return this._httpClient.put('/api/settings', settings);
  }
}
