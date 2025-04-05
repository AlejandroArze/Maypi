import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';

@Component({
  selector: 'app-report',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule],
  templateUrl: './report.component.html',
})
export class ReportComponent implements OnInit {
  reportForm!: FormGroup;
  currentYear: number = new Date().getFullYear();
  profileImageName: string = '';
  eventImageName: string = '';
  
  @ViewChild('profileImageInput') profileImageInput!: ElementRef;
  @ViewChild('eventImageInput') eventImageInput!: ElementRef;

  constructor(
    private fb: FormBuilder,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    this.reportForm = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required], [Validators.email]],
      phone: ['', [Validators.required]],
      consent: [false],
      sightingDate: ['', [Validators.required]],
      location: ['', [Validators.required]],
      description: ['', [Validators.required]],
      profileImage: ['', [Validators.required]],
      eventImage: ['']
    });
  }

  triggerFileInput(inputType: 'profileImage' | 'eventImage'): void {
    if (inputType === 'profileImage') {
      this.profileImageInput.nativeElement.click();
    } else {
      this.eventImageInput.nativeElement.click();
    }
  }

  onFileSelected(event: Event, inputType: 'profileImage' | 'eventImage'): void {
    const fileInput = event.target as HTMLInputElement;
    if (fileInput.files && fileInput.files.length > 0) {
      const file = fileInput.files[0];
      
      // Actualizar el nombre del archivo para mostrar en la UI
      if (inputType === 'profileImage') {
        this.profileImageName = file.name;
        this.reportForm.patchValue({ profileImage: file });
      } else {
        this.eventImageName = file.name;
        this.reportForm.patchValue({ eventImage: file });
      }
    }
  }

  resetForm(): void {
    this.reportForm.reset();
    this.profileImageName = '';
    this.eventImageName = '';
    // Reiniciar los valores por defecto
    this.reportForm.patchValue({
      consent: false
    });
  }

  onSubmit(): void {
    if (this.reportForm.valid) {
      console.log('Formulario enviado:', this.reportForm.value);
      
      // Aquí iría la lógica para enviar los datos al servidor
      
      // Mostrar mensaje de éxito (puedes implementar un servicio de notificaciones)
      alert('Reporte enviado con éxito. Gracias por su colaboración.');
      
      // Redirigir a la página principal
      this.goBack();
    } else {
      // Marcar todos los campos como tocados para mostrar los errores
      Object.keys(this.reportForm.controls).forEach(key => {
        const control = this.reportForm.get(key);
        control?.markAsTouched();
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/']); // Navegar a la ruta raíz (landing page)
  }
}