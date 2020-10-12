import {Component, OnInit, ViewChild} from '@angular/core';
import {DatePickComponent} from "../date-pick/date-pick.component";
import { DatePipe } from '@angular/common';
import {ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.css']
})
export class NavigationComponent implements OnInit {

  @ViewChild(DatePickComponent) datePickComponent;

  currentDate: string;
  public datePipe: DatePipe = new DatePipe('en-Eu');

  constructor(private cdref: ChangeDetectorRef) {
  }

  ngOnInit(): void {
  }

  ngAfterViewInit() {
    setTimeout(() => {
      Promise.resolve(null).then(() => this.currentDate = this.datePipe.transform(this.datePickComponent.dateValue, 'yyyy-MM-dd'));
    });

  }

}
