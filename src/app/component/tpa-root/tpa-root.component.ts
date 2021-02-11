import {Component, OnInit} from '@angular/core';
import {NavbarService} from "../../shared/service/navbar.service";
import {Tpa} from "../../model/tpa/tpa";
import {ApiService} from "../../shared/service/api.service";
import {NumberFormatPipe} from "../../shared/pipe/number-format.pipe";
import {SearchInListPipe} from "../../shared/pipe/search-in-list.pipe";
import {ActivatedRoute} from "@angular/router";
import {Subscription} from "rxjs";
import {TttEnum} from "../../model/ttt/ttt-enum";
import {TpaStatus} from "../../model/tpa/tpa-status";
import {TruckNavService} from "../../shared/service/truck-nav.service";
import {LocalStorageService} from "ngx-webstorage";

@Component({
  selector: 'app-tpa-root',
  templateUrl: './tpa-root.component.html',
  styleUrls: ['./tpa-root.component.css'],
  providers: [NumberFormatPipe, SearchInListPipe]
})
export class TpaRootComponent implements OnInit {

  tpaList: Tpa[] = [];
  private routeSub: Subscription;
  closed: string = TpaStatus.CLOSED.statusName;

  constructor(public nav: NavbarService, private apiService: ApiService, private numberFormat: NumberFormatPipe,
              private searchPipe: SearchInListPipe, private route: ActivatedRoute, private truckNavService: TruckNavService,
              private localStorage: LocalStorageService) {
  }

  ngOnInit(): void {
    this.nav.show();
    this.routeSub = this.route.params.subscribe(params => {
      this.nav.warehouseUrlCode = params['url_code'];
      this.nav.currentDate = params['date'];
    });
    this.nav.currentDateChangeObs.subscribe((theDate) => {
        this.getListOfTpaForCurrentDate(theDate);
      }
    );
    this.getListOfTpaForCurrentDate(this.nav.currentDate);
  }

  getListOfTpaForCurrentDate(date: string) {
    this.apiService.getTpaListByWarehouseAndDate(this.nav.warehouseUrlCode, date).subscribe(
      res => {
        this.tpaList = res;
        this.getTpaSetForWarehouseDelayed();
      },
      error => {
        console.log(`Error occurred while getting list of TPA for warehouse ${this.nav.warehouseUrlCode} for Date ${this.nav.currentDate}`);
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
    let ids = this.tpaList.map(tpa => tpa.tpaID);
    delayedTpas.forEach(delayedTpa => {
      if (ids.indexOf(delayedTpa.tpaID) === -1){
        this.tpaList.unshift(delayedTpa);
      }
    });
  }

  /**
   * assignCopy(){
    this.filteredItems = Object.assign([], this.items);
  }
   filterItem(value){
    if(!value){
      this.assignCopy();
    } // when nothing has typed
    this.filteredItems = Object.assign([], this.items).filter(
      item => item.name.toLowerCase().indexOf(value.toLowerCase()) > -1
    )
  }
   this.assignCopy();//when you fetch collection from server.
   */
  query: any;


  getDeliveryDate(tpa: Tpa) {
    let dateStart = new Date(tpa.departurePlan);
    let transit = tpa.tpaDaysSetting.transitTime;
    let transitDays = parseInt(transit.substring(transit.indexOf('P') + 1, transit.indexOf('D')));
    let transitHours = parseInt(transit.substring(transit.indexOf('T') + 1, transit.indexOf('H')));
    let transitMinutes = parseInt(transit.substring(transit.indexOf('H') + 1, transit.indexOf('M')));
    dateStart.setDate(dateStart.getDate() + transitDays);
    dateStart.setHours(dateStart.getHours() + transitHours);
    dateStart.setMinutes(dateStart.getMinutes() + transitMinutes);
    return dateStart;
  }

  getManifestQty(tpa: Tpa) {
    return tpa.manifestReferenceSet === undefined ? 0 : tpa.manifestReferenceSet.length;
  }

  getDepartureTime(tpa: Tpa) {
    return tpa.departureReal == undefined ? tpa.departurePlan.replace('T', ' ') : tpa.departureReal.replace('T', ' ');
  }

  getPalletQty(tpa: Tpa) {
    let palQty = 0;
    if (tpa.manifestReferenceSet != undefined) {
      tpa.manifestReferenceSet.forEach(m => {
        palQty += m.palletQtyReal == undefined ? m.palletQtyPlanned : m.palletQtyReal;
      });
      return palQty;
    }
    return 0;
  }

  getTotalWeight(tpa: Tpa) {
    let totalWeight = 0;
    if (tpa.manifestReferenceSet != undefined) {
      tpa.manifestReferenceSet.forEach(m => {
        totalWeight += m.grossWeightReal == undefined ? m.grossWeightPlanned : m.grossWeightReal;
      });
      return totalWeight;
    }
    return 0;
  }

  isDelayed(tpa: Tpa) {
    let now = new Date();
    let departure = new Date(tpa.departurePlan);
    return now > departure && tpa.status.statusName !== this.closed;
  }

  getTpaId(tpa: Tpa) {
    this.truckNavService.tpa = tpa;
    this.localStorage.store('tpaId', tpa.tpaID);
    this.localStorage.store('date', this.nav.currentDate);
  }
}
