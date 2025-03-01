import { Component, OnInit, HostBinding, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { FuseConfigService } from '@fuse/services/config';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

interface Message {
  text: string;
  sender: 'user' | 'bot';
}

@Component({
    selector: 'help-center-chatia',
    templateUrl: './chatia.component.html',
    standalone: true,
    imports: [
        CommonModule,
        MatButtonModule,
        MatIconModule,
        MatInputModule,
        MatFormFieldModule,
        MatDialogModule,
        FormsModule,
        ReactiveFormsModule
    ]
})
export class HelpCenterChatIAComponent implements OnInit, OnDestroy {
    @HostBinding('class.dark') isDarkMode = false;

    messages: Message[] = [];
    userInput: string = '';
    isConversationStarted: boolean = false;
    currentConversationType: string = '';
    suggestedQuestions: string[] = [
        '¿Cómo puedo restablecer mi contraseña?',
        'Quiero conocer los servicios disponibles',
        '¿Cuáles son los horarios de atención?',
        'Necesito información sobre soporte técnico'
    ];

    private _unsubscribeAll = new Subject<void>();

    constructor(
        private dialog: MatDialog, 
        private _fuseConfigService: FuseConfigService
    ) {}

    ngOnInit() {
        // Forzar el modo claro inicialmente
        this._fuseConfigService.config = {
            scheme: 'light'
        };

        // Suscribirse a los cambios de configuración para el modo oscuro
        this._fuseConfigService.config$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((config) => {
                // Log para depuración
                console.log('Esquema actual:', config.scheme);

                // Actualizar el estado del modo oscuro
                this.isDarkMode = config.scheme === 'dark';
                
                // Aplicar la clase de modo oscuro al documento
                document.documentElement.classList.toggle('dark', this.isDarkMode);
            });
    }

    ngOnDestroy(): void {
        // Limpiar todas las suscripciones
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    startConversation(type: string) {
        this.currentConversationType = type;
        this.isConversationStarted = true;
        
        // Generar un prompt inicial basado en el tipo de conversación
        const initialPrompt = this.generateInitialPrompt(type);
        this.userInput = initialPrompt;
        
        // Simular que el usuario envía el mensaje
        this.sendMessage();
    }

    generateInitialPrompt(type: string): string {
        switch(type) {
            case 'Yoga':
                return 'Dame 5 posturas de yoga fáciles para principiantes que pueda hacer en casa';
            case 'Tender mano':
                return 'Quiero saber cómo tender la mano a un amigo que está pasando por un momento difícil. Dame consejos sensibles y respetuosos';
            case 'Comprar coche':
                return 'Estoy pensando en comprar un coche nuevo. Dame 10 consejos importantes para elegir el mejor vehículo para mis necesidades';
            default:
                return '¿En qué puedo ayudarte hoy?';
        }
    }

    openSearch() {
        // Implementación básica de búsqueda 
        const searchTerm = prompt('Introduce tu término de búsqueda:');
        if (searchTerm) {
            const filteredMessages = this.messages.filter(msg => 
                msg.text.toLowerCase().includes(searchTerm.toLowerCase())
            );
            
            console.log('Resultados de búsqueda:', filteredMessages);
        }
    }

    sendMessage() {
        if (this.userInput.trim() === '') return;

        // Iniciar conversación si no ha comenzado
        if (!this.isConversationStarted) {
            this.isConversationStarted = true;
        }

        // Agregar mensaje del usuario
        this.messages.push({
            text: this.userInput,
            sender: 'user'
        });

        // Simular respuesta del bot (en un escenario real, esto sería una llamada a un servicio de IA)
        const botResponse = this.generateBotResponse(this.userInput);
        this.messages.push({
            text: botResponse,
            sender: 'bot'
        });

        // Limpiar input
        this.userInput = '';

        // Desplazar al final del chat
        this.scrollToBottom();
    }

    generateBotResponse(userMessage: string): string {
        const lowercaseMessage = userMessage.toLowerCase();
        
        if (lowercaseMessage.includes('yoga')) {
            return `Aquí tienes 5 posturas de yoga fáciles para principiantes:
1. Postura del Árbol (Vrksasana): Mejora el equilibrio y la concentración.
2. Postura del Perro Boca Abajo (Adho Mukha Svanasana): Estira la espalda y fortalece los brazos.
3. Postura del Guerrero I (Virabhadrasana I): Fortalece piernas y mejora la estabilidad.
4. Postura del Niño (Balasana): Relaja la espalda y reduce el estrés.
5. Postura de la Cobra (Bhujangasana): Fortalece la espalda y abre el pecho.

Recuerda respirar profundamente y no forzar ninguna posición.`;
        } else if (lowercaseMessage.includes('tender la mano')) {
            return `Consejos para tender la mano a un amigo que está pasando por un momento difícil:
1. Escucha sin juzgar: Ofrece tu atención completa.
2. Valida sus sentimientos: Reconoce su dolor sin minimizarlo.
3. Ofrece apoyo concreto: "Estoy aquí para lo que necesites".
4. No intentes "arreglar" todo: A veces solo necesitan ser escuchados.
5. Mantén el contacto: Mensajes ocasionales pueden significar mucho.
6. Respeta su espacio: No presiones si no quieren hablar.
7. Muestra empatía: Ponte en su lugar sin comparar experiencias.`;
        } else if (lowercaseMessage.includes('comprar coche')) {
            return `10 consejos para comprar un coche nuevo:
1. Establece un presupuesto realista
2. Investiga diferentes modelos y marcas
3. Compara precios en varios concesionarios
4. Verifica el consumo de combustible
5. Considera los costos de mantenimiento
6. Realiza una prueba de manejo
7. Revisa la garantía del vehículo
8. Investiga la reputación de la marca
9. Considera el valor de reventa
10. No te apresures, toma tu tiempo para decidir

¿Necesitas más detalles sobre alguno de estos puntos?`;
        } else {
            return 'Gracias por tu mensaje. ¿En qué más puedo ayudarte?';
        }
    }

    selectSuggestedQuestion(question: string) {
        this.userInput = question;
        this.sendMessage();
    }

    private scrollToBottom() {
        setTimeout(() => {
            const chatContainer = document.querySelector('.overflow-y-auto');
            if (chatContainer) {
                chatContainer.scrollTop = chatContainer.scrollHeight;
            }
        }, 0);
    }

    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    }

    toggleDarkMode() {
        // Obtener el esquema actual
        const currentScheme = this._fuseConfigService.config.scheme;
        
        // Cambiar al esquema opuesto
        const newScheme = currentScheme === 'dark' ? 'light' : 'dark';
        
        // Log para depuración
        console.log('Cambiando de', currentScheme, 'a', newScheme);

        // Establecer el nuevo esquema
        this._fuseConfigService.config = {
            scheme: newScheme
        };
    }

    toggleLightMode() {
        // Cambiar explícitamente al modo claro
        this._fuseConfigService.config = {
            scheme: 'light'
        };
    }
} 