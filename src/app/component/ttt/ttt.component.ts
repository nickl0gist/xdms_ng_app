import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {TttNavService} from "../../shared/service/ttt-nav.service";
import {TttWarehouseManifestDTO} from "../../model/ttt/ttt-warehouse-manifest-dto";
import {ApiService} from "../../shared/service/api.service";
import {NavbarService} from "../../shared/service/navbar.service";
import {ActivatedRoute} from "@angular/router";
import {interval, Subscription} from "rxjs";
import {LocalStorageService} from "ngx-webstorage";
import {TttEnum} from "../../model/ttt/ttt-enum";
import {WarehouseManifest} from "../../model/manifest/warehouse-manifest";
import {NgVarDirective} from "../../shared/directives/ng-var.directive";
import {Ttt} from "../../model/ttt/ttt";
import * as myGlobals from "../../global";

@Component({
  selector: 'app-ttt',
  templateUrl: './ttt.component.html',
  styleUrls: ['./ttt.component.css']
})
export class TttComponent implements OnInit {
  tttId: number;
  tttWarehouseManifestDTO: TttWarehouseManifestDTO;
  private routeSub: Subscription;
  arrived: string = TttEnum.ARRIVED;
  manually_added_postfix = myGlobals.MANUALLY_ADDED_POSTFIX;

  constructor(private tttNavService: TttNavService, private apiService: ApiService, public nav: NavbarService, private route: ActivatedRoute, public localStorage: LocalStorageService) {
  }

  ngOnInit(): void {
    this.nav.show();
    this.tttWarehouseManifestDTO = this.tttNavService.tttWarehouseManifestDTO;
    this.routeSub = this.route.params.subscribe(params => {
      this.nav.warehouseUrlCode = params['url_code'];
      this.nav.currentDate = params['date'];
    });
    if (this.tttWarehouseManifestDTO === undefined) {
      this.getTttWarehouseManifestDtoByWarehouseUrlAndTttId(this.localStorage.retrieve('tttId'));
    }
    this.nav.currentDateChangeObs.subscribe((theDate) => {
      }
    );
  }

  getTttWarehouseManifestDtoByWarehouseUrlAndTttId(tttId: number) {
    this.apiService.getTttWarehouseManifestDtoByWarehouseAndTtt(this.nav.warehouseUrlCode, tttId).subscribe(
      res => {
        this.tttWarehouseManifestDTO = res;
      },
      err => {
        console.log('The error occurred while receiving TttWarehouseManifestDto');
      }
    )
  }

  getDeliveryDate(warehouseManifest: WarehouseManifest) {
    let dateOfDeparture = new Date(warehouseManifest.tpa.departurePlan);
    let transit = warehouseManifest.tpa.tpaDaysSetting.transitTime;
    let transitDays = transit.substring(1, transit.indexOf('D'));
    let transitHours = transit.substring(transit.indexOf('T') + 1, transit.indexOf('H'));
    let transitMinutes = transit.substring(transit.indexOf('H') + 1, transit.indexOf('M'));
    let dateOfDelivery = new Date(dateOfDeparture.getFullYear(), dateOfDeparture.getMonth(), dateOfDeparture.getDate() + (+transitDays),
      dateOfDeparture.getHours() + (+transitHours), dateOfDeparture.getMinutes() + (+transitMinutes));
    return dateOfDelivery.toLocaleDateString() + ' ' + dateOfDelivery.getHours() + ':' + dateOfDelivery.getMinutes();
  }

  /**
   * @param warehouseManifest - WarehouseManifest entity which has to be checked.
   * @param ttt - Ttt for current WarehouseManifest
   * @param byWeight boolean - true for checking by weight, false - to check by qty of pallets
   */
  getAppropriateClass(warehouseManifest: WarehouseManifest, ttt: Ttt, byWeight: boolean) {
    let tagClass = '';
    if ((byWeight && ttt.tttStatus.tttStatusName === this.arrived && warehouseManifest.grossWeight !== warehouseManifest.manifest.totalWeightPlanned) ||
      (!byWeight && ttt.tttStatus.tttStatusName === this.arrived && warehouseManifest.palletQty !== warehouseManifest.manifest.palletQtyPlanned)) {
      tagClass = 'wrong_qty';
    }
    return tagClass;
  }

  getClassForRow(warehouseManifest: WarehouseManifest) {
    let tagClass = '';
    let currentDate = new Date();
    let departDate = new Date(warehouseManifest.tpa.departurePlan);
    if (currentDate.getDate() === departDate.getDate() && currentDate.getMonth() === departDate.getMonth() && currentDate.getFullYear() === departDate.getFullYear()) {
      tagClass = 'today';
    }
    if (departDate < currentDate) {
      tagClass = 'wrong_qty';
    }
    return tagClass;
  }

  getTotalAmountOfPalletsAndBoxes() {
    let palletsQty = 0;
    let boxesQty = 0;
    this.tttWarehouseManifestDTO.warehouseManifestList.forEach(warehouseManifest => {
      palletsQty += warehouseManifest.palletQty;
      boxesQty += warehouseManifest.boxQtyReal;
    });
    return boxesQty > 0 ? palletsQty + 'p ' + boxesQty + 'b' : palletsQty + 'p';
  }

  getTotalWeight() {
    let totalWeightReal = 0;
    let totalWeightPlan = 0;
    this.tttWarehouseManifestDTO.warehouseManifestList.forEach(warehouseManifest => {
      totalWeightReal += warehouseManifest.grossWeight;
      totalWeightPlan += warehouseManifest.manifest.totalWeightPlanned;
    });
    return totalWeightReal > 0 ? totalWeightReal + ' t' : totalWeightPlan + ' t';
  }

  getChosenWarehouseManifestId(warehouseManifest: WarehouseManifest) {
    this.tttNavService.warehouseManifest = warehouseManifest;
    this.localStorage.store('manifestId', warehouseManifest.manifest.manifestID);
    this.localStorage.store('customerId', warehouseManifest.manifest.customer.customerID);
  }
}
