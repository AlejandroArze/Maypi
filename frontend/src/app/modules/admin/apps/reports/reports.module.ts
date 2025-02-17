import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import routes from './reports.routes';

@NgModule({
    imports: [
        RouterModule.forChild(routes)
    ]
})
export class ReportsModule {} 