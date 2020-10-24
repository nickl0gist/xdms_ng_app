import {Component, ViewEncapsulation, Inject, Output, EventEmitter} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {now} from "moment";
import {formatDate} from "@angular/common";

@Component({
  selector: 'app-date-pick',
  templateUrl: './date-pick.component.html',
  styleUrls: ['./date-pick.component.css'],

})
export class DatePickComponent{
  public minDate: Date = new Date ("09/27/2020 2:00 AM");
  public maxDate: Date = new Date ("09/27/2040 11:00 AM");
  public dateValue: Date = new Date ();
  skillForm: FormGroup;
  @Output() voted = new EventEmitter<string>();

  constructor(private fb: FormBuilder) {
    if(this.skillForm === undefined){
      this.dateValue = new Date;
    } else {
      this.dateValue = this.skillForm.controls['datetime'].value;
    }
    // setInterval(() => {
    //  //console.log(this.skillForm.toString())
    //    this.dateValue = new Date();
    // }, 1);
    this.createForm();
  }

  createForm(): void {
    this.skillForm = this.fb.group({
      datetime: [new Date(), Validators.required]
    });
    this.dateValue = this.skillForm.controls['datetime'].value;
    this.dateValue.setTime(now());
  }

  changeLink() {
    let str: string = this.skillForm.controls['datetime'].value;
    this.dateValue = new Date(str);
    let currentTime: Date = new Date();
    this.dateValue.setHours(currentTime.getHours(), currentTime.getMinutes(), currentTime.getSeconds());
    this.voted.emit(formatDate(this.dateValue, 'yyyy-MM-dd', 'en-EU'));
  }
}
