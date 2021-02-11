import {Component, OnInit} from '@angular/core';
import {NavbarService} from "../../shared/service/navbar.service";
import {ApiService} from "../../shared/service/api.service";
import {Ttt} from "../../model/ttt/ttt";
import * as myGlobals from "../../global";
import {Tpa} from "../../model/tpa/tpa";
import {ActivatedRoute} from "@angular/router";
import {Subscription} from "rxjs";
import {CommonModule} from '@angular/common';
import {LocalStorageService} from "ngx-webstorage";
import {TruckNavService} from "../../shared/service/truck-nav.service";

@Component({
  selector: 'app-warehouse',
  templateUrl: './warehouse.component.html',
  styleUrls: ['./warehouse.component.css']
})
export class WarehouseComponent implements OnInit {
  tttList: Ttt[] = [];
  tpaListByDate: Tpa[] = [];
  tpaListDelayed: Tpa[] = [];
  private symbolNotArrived = myGlobals.SYMBOL_NOT_ARRIVED;
  private routeSub: Subscription;

  constructor(private apiService: ApiService, public nav: NavbarService,
              private route: ActivatedRoute, private localStorage: LocalStorageService,
              private truckNavService: TruckNavService) {
  }

  ngOnInit(): void {
    this.nav.show();
    this.routeSub = this.route.params.subscribe(params => {
      this.nav.warehouseUrlCode = params['url_code'];
    });
    this.nav.currentDateChangeObs.subscribe((theDate) => {
        this.getTttSetForWarehouseByDate(theDate);
        this.getTpaSetForWarehouseByDate(theDate);
      }
    );
    if (this.nav.currentDate === undefined)
      this.nav.currentDate = this.localStorage.retrieve('date');
    this.getTttSetForWarehouseByDate(this.nav.currentDate);
    this.getTpaSetForWarehouseByDate(this.nav.currentDate);
  }

  getTttSetForWarehouseByDate(theDate: string) {
    this.apiService.getTttListByWarehouseAndDate(this.nav.warehouseUrlCode, theDate).subscribe(
      res => {
        this.tttList = res;
      },
      err => {
        console.log('Something went wrong while getting TTT list by Date!');
      }
    );
  }

  getTpaSetForWarehouseByDate(theDate: string) {
    this.apiService.getTpaListByWarehouseAndDate(this.nav.warehouseUrlCode, theDate).subscribe(
      res => {
        this.tpaListByDate = res;
        this.getTpaSetForWarehouseDelayed();
      },
      err => {
        console.log('Something went wrong while getting TPA list by Date!');
      }
    );
  }

  getTpaSetForWarehouseDelayed() {
    this.apiService.getTpaListWithStatusDelayed(this.nav.warehouseUrlCode).subscribe(
      res => {
        this.unshiftDelayedTpa(res);
      },
      err => {
        console.log('Something went wrong with getting TPA with status DELAYED!');
      }
    );
  }

  private unshiftDelayedTpa(delayedTpas: Tpa[]) {
    let ids = this.tpaListByDate.map(tpa => tpa.tpaID);
    delayedTpas.forEach(delayedTpa => {
      if (ids.indexOf(delayedTpa.tpaID) === -1) {
        this.tpaListByDate.unshift(delayedTpa);
      }
    });
  }

  getTpaId(tpa: Tpa) {
    this.truckNavService.tpa = tpa;
    this.localStorage.store('tpaId', tpa.tpaID);
    this.localStorage.store('date', this.nav.currentDate);
  }
}
