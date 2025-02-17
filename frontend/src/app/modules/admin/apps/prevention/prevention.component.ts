import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
    selector       : 'prevention',
    template       : '<router-outlet></router-outlet>',
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone     : true,
    imports        : [RouterOutlet],
})
export class PreventionComponent
{
    constructor()
    {
    }
} 