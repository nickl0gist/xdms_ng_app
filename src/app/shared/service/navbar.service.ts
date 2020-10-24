import { Injectable } from '@angular/core';
import {Subject} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class NavbarService {
  visible: boolean;
  warehouseUrlCode: string = '';
  currentDate: string='';
  currentDateChange : Subject<string> = new Subject<string>();
  currentDateChangeObs = this.currentDateChange.asObservable()
  ;
  constructor() {
    this.visible = false;
    this.currentDateChange.subscribe((value) => {
      this.currentDate = value;
    })
  }

  hide() { this.visible = false; }

  show() { this.visible = true; }

  toggle() { this.visible = !this.visible; }

  toggleCurrentDate(){
    this.currentDateChange.next(this.currentDate);
  }

  getCurrentWarehouseUrl(urlCode: string){
    this.warehouseUrlCode = urlCode;
  }

  setCurrentDate(date: string){
    this.currentDate = date;
    this.currentDateChange.next(date);
    this.toggleCurrentDate();
  }
}
