import { NgFor, NgIf } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { RouterLink } from '@angular/router';
import { HelpCenterService } from 'app/modules/admin/apps/help-center/help-center.service';
import { FaqCategory } from 'app/modules/admin/apps/help-center/help-center.type';
import { Subject, takeUntil } from 'rxjs';

@Component({
    selector     : 'help-center',
    templateUrl  : './help-center.component.html',
    encapsulation: ViewEncapsulation.None,
    standalone   : true,
    imports      : [
        MatFormFieldModule, 
        MatInputModule, 
        MatIconModule, 
        RouterLink, 
        MatExpansionModule, 
        NgFor,
        NgIf
    ],
})
export class HelpCenterComponent implements OnInit, OnDestroy
{
    faqCategory: FaqCategory = {
        id: '',
        slug: '',
        title: '',
        faqs: []
    };
    private _unsubscribeAll: Subject<any> = new Subject();

    /**
     * Constructor
     */
    constructor(private _helpCenterService: HelpCenterService)
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void
    {
        // Cargar las FAQs inicialmente
        this._helpCenterService.getAllFaqs().subscribe();

        // Suscribirse a los cambios
        this._helpCenterService.faqs$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((faqCategories) => {
                if (faqCategories && faqCategories.length > 0) {
                    this.faqCategory = faqCategories[0];
                }
            });
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void
    {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Track by function for ngFor loops
     *
     * @param index
     * @param item
     */
    trackByFn(index: number, item: any): any
    {
        return item.id || index;
    }
}
