import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {NavigationComponent} from './component/navigation/navigation.component';
import {WarehouseComponent} from "./component/warehouse/warehouse.component";
import {HomeComponent} from './component/home/home.component';
import {TttComponent} from './component/ttt/ttt.component';
import {TpaComponent} from './component/tpa/tpa.component';
import {Route, Router, RouterModule, Routes} from "@angular/router";
import {TttRootComponent} from './component/ttt-root/ttt-root.component';
import {TpaRootComponent} from './component/tpa-root/tpa-root.component';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatInputModule} from "@angular/material/input";
import {MatNativeDateModule} from "@angular/material/core";
import {DatePickComponent} from './component/date-pick/date-pick.component';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {BrowserAnimationsModule, NoopAnimationsModule} from "@angular/platform-browser/animations";
import {AaDatepickerModule} from 'ngx-animating-datepicker';
import {DatePickerModule} from '@syncfusion/ej2-angular-calendars';
import {DateTimePickerModule} from '@syncfusion/ej2-angular-calendars';
import {NotFoundComponent} from './component/not-found/not-found.component';
import {HttpClientModule} from "@angular/common/http";
import {CustomUrlMatcher} from "./custom.url.matcher";
import {NgVarDirective} from './shared/directives/ng-var.directive';
import {NgxWebstorageModule} from "ngx-webstorage";
import {ManifestComponent} from './component/manifest/manifest.component';
import { NumberFormatPipe } from './shared/pipe/number-format.pipe';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AddReferenceComponent } from './component/modal/add-reference/add-reference.component';
import {MatSelectModule} from "@angular/material/select";
import {MatProgressSpinnerModule} from "@angular/material/progress-spinner";
import { ManifestXdReceptionModalComponent } from './component/modal/manifest-xd-reception-modal/manifest-xd-reception-modal.component';
import { AddManifestComponent } from './component/modal/add-manifest/add-manifest.component';
import { AddTruckComponent } from './component/modal/add-truck/add-truck.component';
import { SearchInListPipe } from './shared/pipe/search-in-list.pipe';
import { SplitReferenceComponent } from './component/modal/split-reference/split-reference.component';

const appRoutes: Routes = [
  {
    path: 'warehouse',
    component: HomeComponent
  },
  {
    path: 'warehouse/:url_code',
    children: [
      {
        path: '',
        pathMatch: 'full',
        component: WarehouseComponent
      },
      {
        path: 'ttt',
        children: [
          {
            matcher: CustomUrlMatcher("date", /^20[0-9]{2}-[0-1][0-9]-[0-3][0-9]?$/),
            component: TttRootComponent
          },
          {
            matcher: CustomUrlMatcher("id", /^[0-9A-Za-z\-_]+/),
            children: [
              {
                path: '',
                pathMatch: 'full',
                component: TttComponent,
              },
              {
                path:'manifest/:code',
                component: ManifestComponent
              }
            ]
          },
        ]
      },
      {
        path: 'tpa',
        children: [
          {
            matcher: CustomUrlMatcher("date", /^20[0-9]{2}-[0-1][0-9]-[0-3][0-9]?$/),
            component: TpaRootComponent
          },
          {
            matcher: CustomUrlMatcher("id", /^[0-9A-Za-z\-_]+/),
            component: TpaComponent
          },
        ]
      },
    ]
  },
  {
    path: '**',
    component: NotFoundComponent
  }
];

@NgModule({
  declarations: [
    AppComponent,
    NavigationComponent,
    HomeComponent,
    WarehouseComponent,
    TpaRootComponent,
    TttRootComponent,
    TttComponent,
    TpaComponent,
    DatePickComponent,
    NotFoundComponent,
    NgVarDirective,
    ManifestComponent,
    NumberFormatPipe,
    AddReferenceComponent,
    ManifestXdReceptionModalComponent,
    AddManifestComponent,
    AddTruckComponent,
    SearchInListPipe,
    SplitReferenceComponent
  ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        MatDatepickerModule,
        MatInputModule,
        MatNativeDateModule,
        FormsModule,
        ReactiveFormsModule,
        BrowserAnimationsModule,
        NoopAnimationsModule,
        AaDatepickerModule,
        DatePickerModule,
        BrowserModule, BrowserAnimationsModule, DateTimePickerModule,
        RouterModule.forRoot(appRoutes),
        HttpClientModule,
        NgxWebstorageModule.forRoot(),
        NgbModule, MatSelectModule, MatProgressSpinnerModule,
    ],
  providers: [],
  bootstrap: [AppComponent],
  entryComponents: [
    AddReferenceComponent,
    ManifestXdReceptionModalComponent,
    AddManifestComponent,
    AddTruckComponent,
    SplitReferenceComponent
  ]
})
export class AppModule {

}
