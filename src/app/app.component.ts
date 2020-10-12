import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'XDMS';
  public minDate: Date = new Date ("09/27/2020 2:00 AM");
  public maxDate: Date = new Date ("09/27/2040 11:00 AM");
  public dateValue: Date = new Date ();
}
