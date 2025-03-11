import { Routes } from '@angular/router';
import { PossibleMissingComponent } from './possible-missing/possible-missing.component';
import { PanicComponent } from './panic/panic.component';
import { MissingComponent } from './missing/missing.component';
import { MissingTrackingComponent } from './missing-tracking/missing-tracking.component';
import { ReportsComponent } from './reports.component';

const routes: Routes = [
    {
        path: '',
        component: ReportsComponent,
        children: [
            {
                path: 'missing',
                component: MissingComponent
            },
            {
                path: 'missing-tracking',
                component: MissingTrackingComponent
            },
            {
                path: 'possible-missing',
                component: PossibleMissingComponent
            },
            {
                path: 'panic',
                component: PanicComponent
            }
        ]
    }
];

export default routes; 