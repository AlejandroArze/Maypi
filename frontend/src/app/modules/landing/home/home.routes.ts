import { Routes } from '@angular/router';
import { LandingHomeComponent } from 'app/modules/landing/home/home.component';
import { ReportComponent } from 'app/modules/landing/home/report/report.component';
import { GuidesComponent } from 'app/modules/landing/guides/guides.component';
import { FaqsComponent } from 'app/modules/landing/faqs/faqs.component';

export default [
    {path: '', pathMatch : 'full', redirectTo: 'landing'},

    {
        path     : 'landing',
        component: LandingHomeComponent,
    },
    {
        path     : 'report',
        component: ReportComponent
    },
    {
        path     : 'guides',
        component: GuidesComponent
    },
    {
        path     : 'faqs',
        component: FaqsComponent
    }
] as Routes;