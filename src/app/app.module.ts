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
            component: TttComponent
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
            matcher: CustomUrlMatcher("id", /^\d+$/),
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
    NgVarDirective
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
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {

}
