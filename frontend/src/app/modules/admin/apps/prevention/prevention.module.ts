import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import routes from './prevention.routes';

@NgModule({
    imports: [
        RouterModule.forChild(routes)
    ]
})
export class PreventionModule { } 