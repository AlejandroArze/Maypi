import { Routes } from '@angular/router';
import { TrackingComponent } from './tracking/tracking.component';
import { FacesComponent } from './faces/faces.component';
import { EmergencyComponent } from './emergency/emergency.component';
import { StatsComponent } from './stats/stats.component';
import { SearchRescueComponent } from './search-rescue.component';

export default [
    {
        path: '',
        component: SearchRescueComponent
    },
    {
        path: 'tracking',
        component: TrackingComponent
    },
    {
        path: 'faces',
        component: FacesComponent
    },
    {
        path: 'emergency',
        component: EmergencyComponent
    },
    {
        path: 'stats',
        component: StatsComponent
    }
] as Routes; 