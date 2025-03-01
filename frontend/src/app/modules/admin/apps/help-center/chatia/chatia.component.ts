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
    greeting: string = '';

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

        this.updateGreeting();
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
            case 'Guía de búsqueda':
                return 'Necesito orientación sobre los primeros pasos para buscar a una persona desaparecida';
            case 'Apoyo emocional':
                return 'Estoy pasando por un momento muy difícil y necesito ayuda para manejar mi dolor y angustia';
            case 'Asesoría legal':
                return 'Quiero conocer mis derechos y los procedimientos legales para la búsqueda de mi ser querido';
            default:
                return '¿Cómo puedo obtener ayuda para encontrar a mi familiar desaparecido?';
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

        // Desplazar dejando espacio en blanco en la parte inferior
        // Restar la altura del contenedor para dejar espacio
        this.scrollToBottom();

        // Simular respuesta del bot (en un escenario real, esto sería una llamada a un servicio de IA)
        const botResponse = this.generateBotResponse(this.userInput);
        
        // Agregar respuesta del bot con generación gradual
        this.addBotResponseGradually(botResponse);

        // Limpiar input
        this.userInput = '';
    }

    private scrollToBottom() {
        // Variable para controlar el último desplazamiento
        if (!this.lastScrollTime) {
            this.lastScrollTime = 0;
        }

        const currentTime = Date.now();
        
        // Agregar un intervalo mínimo entre desplazamientos
        if (currentTime - this.lastScrollTime < 500) {
            return;
        }

        // Actualizar el tiempo del último desplazamiento
        this.lastScrollTime = currentTime;

        // Usar setTimeout con un retraso para suavizar el desplazamiento
        setTimeout(() => {
            const chatContainer = document.querySelector('.overflow-y-auto');
            
            if (chatContainer) {
                // Agregar un marcador invisible al final para forzar el scroll
                const marker = document.createElement('div');
                marker.style.height = '1px';
                marker.style.visibility = 'hidden';
                marker.id = 'scroll-marker';
                chatContainer.appendChild(marker);

                // Encontrar todos los mensajes de usuario
                const userMessages = Array.from(chatContainer.querySelectorAll('.user-message'));
                
                // Obtener el último mensaje de usuario
                const lastUserMessage = userMessages[userMessages.length - 1] as HTMLElement;
                
                if (lastUserMessage) {
                    // Método 1: Scroll forzado
                    lastUserMessage.scrollIntoView({
                        behavior: 'smooth', 
                        block: 'start'
                    });

                    // Método 2: Ajuste manual de scroll
                    const containerRect = chatContainer.getBoundingClientRect();
                    const messageRect = lastUserMessage.getBoundingClientRect();
                    
                    // Calcular el desplazamiento
                    const scrollPosition = messageRect.top - containerRect.top + chatContainer.scrollTop - 20; // Margen un poco más grande
                    
                    // Establecer la posición de desplazamiento
                    chatContainer.scrollTop = scrollPosition;
                }

                // Limpiar el marcador
                setTimeout(() => {
                    const existingMarker = document.getElementById('scroll-marker');
                    if (existingMarker) {
                        existingMarker.remove();
                    }
                }, 200);
            }
        }, 100); // Retraso inicial
    }

    // Agregar propiedad para controlar el último tiempo de desplazamiento
    private lastScrollTime: number = 0;

    private addBotResponseGradually(fullResponse: string) {
        // Agregar mensaje inicial vacío
        const botMessageIndex = this.messages.push({
            text: '',
            sender: 'bot'
        }) - 1;

        // Función para generar texto gradualmente
        const generateTextGradually = (currentIndex: number) => {
            if (currentIndex <= fullResponse.length) {
                // Actualizar el mensaje con el texto parcial
                this.messages[botMessageIndex].text = fullResponse.slice(0, currentIndex);
                
                // Desplazar al final del chat
                this.scrollToBottom();

                // Programar la siguiente iteración
                setTimeout(() => {
                    generateTextGradually(currentIndex + 5); // Ajusta este valor para controlar la velocidad
                }, 50); // Ajusta este valor para controlar la velocidad de generación
            }
        };

        // Iniciar generación gradual
        generateTextGradually(1);
    }

    generateBotResponse(userMessage: string): string {
        const lowercaseMessage = userMessage.toLowerCase();
        
        if (lowercaseMessage.includes('guía de búsqueda') || lowercaseMessage.includes('primeros pasos')) {
            return `Pasos iniciales para buscar a una persona desaparecida:
1. Reporta la desaparición inmediatamente a las autoridades
2. Reúne y prepara información detallada:
   - Descripción física
   - Última ubicación conocida
   - Ropa que vestía
   - Fotografías recientes
3. Contacta a la policía y fiscalía
4. Realiza una denuncia formal
5. Comparte información en redes sociales y medios locales
6. Mantén un registro de todas tus acciones y comunicaciones

Recuerda: Actúa rápido, mantén la calma y no dudes en buscar ayuda profesional.`;
        } else if (lowercaseMessage.includes('apoyo emocional') || lowercaseMessage.includes('dolor') || lowercaseMessage.includes('angustia')) {
            return `Recursos de apoyo emocional para familiares de personas desaparecidas:
1. Grupos de apoyo:
   - Conexión con personas que han pasado por situaciones similares
   - Espacios seguros para compartir emociones
2. Estrategias de manejo emocional:
   - Practica técnicas de respiración y meditación
   - Mantén una rutina de autocuidado
   - No te culpes
3. Apoyo psicológico:
   - Busca terapia especializada
   - Líneas de ayuda gratuitas
4. Consejos para manejar la incertidumbre:
   - Mantén la esperanza
   - Enfócate en acciones concretas
   - Busca apoyo de familia y amigos

Nunca estás solo en este proceso.`;
        } else if (lowercaseMessage.includes('asesoría legal') || lowercaseMessage.includes('derechos') || lowercaseMessage.includes('procedimientos')) {
            return `Orientación legal para casos de personas desaparecidas:
1. Derechos fundamentales:
   - Derecho a la búsqueda y localización
   - Acceso a información
   - Protección y atención integral
2. Documentos importantes:
   - Denuncia formal
   - Solicitud de búsqueda urgente
   - Registro de desaparecidos
3. Instituciones de apoyo:
   - Fiscalía especializada
   - Comisión de búsqueda
   - Organizaciones de derechos humanos
4. Pasos legales:
   - Presentar denuncia
   - Solicitar investigación
   - Exigir actualizaciones periódicas
5. Recomendaciones:
   - Documenta todo
   - Mantén comunicación constante
   - Busca asesoría legal especializada

Tu persistencia es fundamental.`;
        } else {
            return `Estamos aquí para apoyarte en la búsqueda de tu ser querido. 

Nuestro objetivo es brindarte:
- Orientación profesional
- Recursos de búsqueda
- Apoyo emocional
- Asesoría legal

¿En qué área específica necesitas ayuda hoy?`;
        }
    }

    selectSuggestedQuestion(question: string) {
        this.userInput = question;
        this.sendMessage();
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

    updateGreeting() {
        const currentHour = new Date().getHours();
        if (currentHour >= 5 && currentHour < 12) {
            this.greeting = 'Buenos días';
        } else if (currentHour >= 12 && currentHour < 19) {
            this.greeting = 'Buenas tardes';
        } else {
            this.greeting = 'Buenas noches';
        }
    }
} 