import {Component} from '@angular/core';

@Component({
  selector: 'app-date-pick',
  templateUrl: './date-pick.component.html',
  styleUrls: ['./date-pick.component.css'],

})
export class DatePickComponent{
  public minDate: Date = new Date ("09/27/2020 2:00 AM");
  public maxDate: Date = new Date ("09/27/2040 11:00 AM");
  public dateValue: Date = new Date ();

  constructor() {
    setInterval(() => {
      this.dateValue = new Date();
    }, 1);
  }
}
