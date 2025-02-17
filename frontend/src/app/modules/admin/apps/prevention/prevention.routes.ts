import { Routes } from '@angular/router';
import { TrackingCodesComponent } from './tracking-codes/tracking-codes.component';
import { PreventionComponent } from './prevention.component';
import { ContactsComponent } from './contacts/contacts.component';

export default [
    {
        path: '',
        component: PreventionComponent
    },
    {
        path: 'contacts',
        component: ContactsComponent
    },
    {
        path: 'tracking-codes',
        component: TrackingCodesComponent
    }
] as Routes; 