import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { trigger, transition, style, animate } from '@angular/animations';

interface Message {
  content: string;
  isUser: boolean;
  timestamp: Date;
}

@Component({
  selector: 'app-chatbot',
  templateUrl: './chatbot.component.html',
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule
  ],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(10px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('slideIn', [
      transition(':enter', [
        style({ transform: 'translateY(100%)' }),
        animate('300ms ease-out', style({ transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('300ms ease-in', style({ transform: 'translateY(100%)' }))
      ])
    ])
  ]
})
export class ChatbotComponent implements OnInit {
  isOpen = false;
  userMessage = '';
  messages: Message[] = [];
  isTyping = false;

  // Respuestas predefinidas para el chatbot
  private responses = {
    'hola': 'Hola, soy el asistente virtual de Maypi. ¿En qué puedo ayudarte hoy?',
    'ayuda': 'Puedo ayudarte con información sobre cómo reportar una desaparición, buscar personas desaparecidas o contactar con las autoridades.',
    'reportar': 'Para reportar una desaparición, puedes hacer clic en el botón "Reportar Desaparición" en nuestra página principal o ir directamente a la sección de reportes.',
    'buscar': 'Puedes buscar personas desaparecidas en nuestra base de datos utilizando el buscador en la sección "Buscar" de nuestra página principal.',
    'contacto': 'Puedes contactarnos a través de nuestra línea de emergencia 800-123-456, disponible 24/7, o visitando nuestra oficina central en Av. Principal #123, La Paz, Bolivia.',
    'default': 'Lo siento, no entiendo tu consulta. ¿Podrías reformularla o elegir entre estas opciones: reportar una desaparición, buscar personas, o contactar con nosotros?'
  };

  constructor() { }

  ngOnInit(): void {
    // Mensaje inicial al cargar el componente
    setTimeout(() => {
      this.addBotMessage('Hola, soy el asistente virtual de Maypi. ¿En qué puedo ayudarte a encontrar personas desaparecidas en Bolivia?');
      
      setTimeout(() => {
        this.addBotMessage('Puedes preguntarme sobre cómo reportar una desaparición, buscar personas o contactar con nosotros.');
      }, 1000);
    }, 500);
  }

  toggleChat(): void {
    this.isOpen = !this.isOpen;
  }

  sendMessage(): void {
    if (!this.userMessage.trim()) return;

    // Añadir mensaje del usuario
    this.addUserMessage(this.userMessage);
    const userQuery = this.userMessage.toLowerCase();
    this.userMessage = '';

    // Simular que el bot está escribiendo
    this.isTyping = true;
    setTimeout(() => {
      this.isTyping = false;
      
      // Buscar respuesta adecuada
      let botResponse = this.responses.default;
      
      for (const [key, response] of Object.entries(this.responses)) {
        if (userQuery.includes(key)) {
          botResponse = response;
          break;
        }
      }
      
      // Añadir respuesta del bot
      this.addBotMessage(botResponse);
    }, 1500);
  }

  private addUserMessage(content: string): void {
    this.messages.push({
      content,
      isUser: true,
      timestamp: new Date()
    });
  }

  private addBotMessage(content: string): void {
    this.messages.push({
      content,
      isUser: false,
      timestamp: new Date()
    });
  }
}