import { Routes } from '@angular/router';
import { LandingHomeComponent } from 'app/modules/landing/home/home.component';
import { ReportComponent } from 'app/modules/landing/home/report/report.component';

export default [
    {
        path     : 'landing',
        component: LandingHomeComponent,
    },
    {
        path     : 'report',
        component: ReportComponent
    }
] as Routes;
