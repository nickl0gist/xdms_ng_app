import {Component, OnInit, ViewChild} from '@angular/core';
import {DatePickComponent} from "../date-pick/date-pick.component";
import { DatePipe } from '@angular/common';
import {AppComponent} from "../../app.component";
import {NavbarService} from "../../shared/service/navbar.service";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.css']
})
export class NavigationComponent implements OnInit {

  @ViewChild(DatePickComponent) datePickComponent;

  public currentDate: string;
  public datePipe: DatePipe = new DatePipe('en-Eu');

  constructor( public nav: NavbarService) {
  }

  ngOnInit(): void {
  }

  ngAfterViewInit() {
    setTimeout(() => {
      Promise.resolve(null).then(() => {
        this.currentDate = this.datePipe.transform(this.datePickComponent.dateValue, 'yyyy-MM-dd');
        this.nav.setCurrentDate(this.datePipe.transform(this.datePickComponent.dateValue, 'yyyy-MM-dd'));
      });
    });
  }

  onDayPicked(str: string) {
    this.currentDate = str;
    this.nav.setCurrentDate(str);
  }

}
