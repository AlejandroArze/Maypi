import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import routes from './search-rescue.routes';

@NgModule({
    imports: [
        RouterModule.forChild(routes)
    ]
})
export class SearchRescueModule { } 