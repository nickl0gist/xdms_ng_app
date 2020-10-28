import { Component, OnInit } from '@angular/core';
import {Warehouse} from "../../model/warehouse/warehouse";
import * as myGlobals from "../../global";
import {ApiService} from "../../shared/service/api.service";
import {NavbarService} from "../../shared/service/navbar.service";
import {Router} from "@angular/router";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  warehouses: Warehouse[]=[];

  constructor(private apiService: ApiService, public nav: NavbarService, private router: Router) {
  }

  ngOnInit(): void {
    this.getAllWarehouses();
    this.nav.hide();
  }

  getAllWarehouses() {
    this.apiService.getActiveWarehouse().subscribe(
      res => {
        this.warehouses = res;
      },
      err =>{
        this.router.navigate(['/warehouse']);
      }
    );
  }
}
