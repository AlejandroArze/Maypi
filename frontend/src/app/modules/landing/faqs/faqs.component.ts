import { Component, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { RouterLink } from '@angular/router';

interface FaqCategory {
  title: string;
  faqs: Faq[];
}

interface Faq {
  question: string;
  answer: string;
}

@Component({
  selector: 'app-faqs',
  templateUrl: './faqs.component.html',
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatExpansionModule,
    RouterLink
  ]
})
export class FaqsComponent {
  // Propiedad para controlar la visibilidad del menú móvil
  isMenuOpen: boolean = false;
  
  // Propiedad para mostrar el año actual en el footer
  currentYear: number = new Date().getFullYear();
  
  // Categorías de FAQs
  faqCategories: FaqCategory[] = [
    {
      title: 'Sobre Reportes',
      faqs: [
        {
          question: '¿Cuánto tiempo debo esperar para reportar una desaparición?',
          answer: 'No es necesario esperar ningún tiempo. Puedes reportar una desaparición inmediatamente si consideras que la persona está en riesgo o su ausencia es inusual. Las primeras 72 horas son críticas en la búsqueda de personas desaparecidas.'
        },
        {
          question: '¿Qué información necesito para reportar una desaparición?',
          answer: 'Necesitarás proporcionar datos personales de la persona desaparecida (nombre completo, edad, características físicas), fotografías recientes, información sobre la última vez que fue vista (lugar, fecha, hora, ropa que vestía), y tus datos de contacto para seguimiento.'
        },
        {
          question: '¿Puedo reportar la desaparición de alguien que no es mi familiar?',
          answer: 'Sí, puedes reportar la desaparición de cualquier persona. Sin embargo, es recomendable contar con la autorización de la familia o tener información verificable sobre la desaparición para evitar reportes falsos.'
        }
      ]
    },
    {
      title: 'Sobre la Plataforma',
      faqs: [
        {
          question: '¿Cómo funciona Maypi?',
          answer: 'Maypi es una plataforma que conecta a familias, autoridades y comunidades para maximizar las posibilidades de encontrar personas desaparecidas. Permitimos reportar desapariciones, difundir información, recibir alertas y colaborar en la búsqueda.'
        },
        {
          question: '¿Es gratuito el uso de Maypi?',
          answer: 'Sí, Maypi es completamente gratuito para reportar desapariciones, buscar personas y colaborar. Nos financiamos a través de donaciones y alianzas con organizaciones.'
        },
        {
          question: '¿Cómo se protege la privacidad de las personas?',
          answer: 'Maypi cumple con estrictas políticas de privacidad. Solo compartimos la información necesaria para la búsqueda y contamos con el consentimiento de las familias. No revelamos datos sensibles ni información que pueda poner en riesgo a las personas.'
        }
      ]
    },
    {
      title: 'Sobre Colaboración',
      faqs: [
        {
          question: '¿Cómo puedo ayudar en la búsqueda de personas desaparecidas?',
          answer: 'Puedes ayudar compartiendo los casos en redes sociales, uniéndote como voluntario a grupos de búsqueda, donando a organizaciones especializadas, o simplemente manteniéndote alerta y reportando cualquier avistamiento.'
        },
        {
          question: '¿Trabajan con las autoridades?',
          answer: 'Sí, Maypi colabora estrechamente con la Policía Boliviana, Interpol y otras autoridades. Compartimos información en tiempo real y coordinamos esfuerzos para maximizar las posibilidades de encontrar a las personas desaparecidas.'
        },
        {
          question: '¿Puedo ser voluntario en Maypi?',
          answer: 'Sí, Maypi cuenta con un programa de voluntariado. Puedes colaborar en diferentes áreas según tus habilidades: difusión, atención a familias, desarrollo tecnológico, entre otros. Contáctanos para más información.'
        }
      ]
    }
  ];
  
  // Método para alternar la visibilidad del menú móvil
  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }
}