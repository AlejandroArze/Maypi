import { Component, ViewEncapsulation } from '@angular/core';
import { RouterLink } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
    selector     : 'auth-confirmation-required',
    templateUrl  : './confirmation-required.component.html',
    encapsulation: ViewEncapsulation.None,
    animations   : [
        fuseAnimations,
        trigger('fadeIn', [
            transition(':enter', [
                style({ opacity: 0 }),
                animate('600ms ease-in', style({ opacity: 1 }))
            ])
        ])
    ],
    standalone   : true,
    imports      : [RouterLink, MatIconModule, MatButtonModule],
})
export class AuthConfirmationRequiredComponent
{
    /**
     * Constructor
     */
    constructor()
    {
    }
}