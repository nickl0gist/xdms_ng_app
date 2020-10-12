import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {NavigationComponent} from './navigation/navigation.component';
import {WarehouseComponent} from './warehouse/warehouse.component';
import {HomeComponent} from './home/home.component';
import {TttComponent} from './ttt/ttt.component';
import {TpaComponent} from './tpa/tpa.component';
import {Router, Routes} from "@angular/router";
import {TttRootComponent} from './ttt-root/ttt-root.component';
import {TpaRootComponent} from './tpa-root/tpa-root.component';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatInputModule} from "@angular/material/input";
import {MatNativeDateModule} from "@angular/material/core";
import {DatePickComponent} from './date-pick/date-pick.component';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {BrowserAnimationsModule, NoopAnimationsModule} from "@angular/platform-browser/animations";
import {AaDatepickerModule} from 'ngx-animating-datepicker';
import { DatePickerModule } from '@syncfusion/ej2-angular-calendars';
import {DateTimePickerModule} from '@syncfusion/ej2-angular-calendars';

const appRoutes: Routes = [
  {
    path: 'warehouse/home',
    component: HomeComponent
  },
  {
    path: 'warehouse/:id',
    component: WarehouseComponent,
    children: [
      {
        path: "ttt",
        component: TttRootComponent
      },
      {
        path: "tpa",
        component: TpaRootComponent
      },
      {
        path: "ttt/:id",
        component: TttComponent
      },
      {
        path: "tpa/:id",
        component: TpaComponent
      }
    ]
  }
];

@NgModule({
  declarations: [
    AppComponent,
    NavigationComponent,
    HomeComponent,
    WarehouseComponent,
    TttRootComponent,
    TpaRootComponent,
    TttComponent,
    TpaComponent,
    DatePickComponent
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
    BrowserModule, BrowserAnimationsModule, DateTimePickerModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
}
