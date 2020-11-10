import {Component, OnInit} from '@angular/core';
import {NavbarService} from "../../shared/service/navbar.service";
import {ApiService} from "../../shared/service/api.service";
import {ActivatedRoute} from "@angular/router";
import {LocalStorageService} from "ngx-webstorage";
import {WarehouseManifest} from "../../model/manifest/warehouse-manifest";
import {TttNavService} from "../../shared/service/ttt-nav.service";
import {Subscription} from "rxjs";
import {HttpHeaders} from "@angular/common/http";
import * as myGlobals from "../../global";
import {NgVarDirective} from "../../shared/directives/ng-var.directive";
import {CommonModule} from '@angular/common';
import {TttEnum} from "../../model/ttt/ttt-enum";
import {ManifestReference} from "../../model/manifest/manifest-reference";
import {Ttt} from "../../model/ttt/ttt";
import {Tpa} from "../../model/tpa/tpa";
import { BrowserModule } from '@angular/platform-browser';
import {NumberFormatPipe} from "../../shared/pipe/number-format.pipe";

@Component({
  selector: 'app-manifest',
  templateUrl: './manifest.component.html',
  styleUrls: ['./manifest.component.css'],
  providers: [NumberFormatPipe]
})
export class ManifestComponent implements OnInit {
  arrived: string = TttEnum.ARRIVED;
  warehouseManifest: WarehouseManifest;
  private routeSub: Subscription;
  manually_added_postfix = myGlobals.MANUALLY_ADDED_POSTFIX;
  tpaListNotClosedForCustomer: Tpa[];
  isEditMode = false;

  constructor(public nav: NavbarService, private apiService: ApiService, private route: ActivatedRoute,
              public localStorage: LocalStorageService, private tttNavService: TttNavService, private formatPipe: NumberFormatPipe) {
  }

  ngOnInit(): void {
    this.nav.show();
    this.warehouseManifest = this.tttNavService.warehouseManifest;
    this.routeSub = this.route.params.subscribe(params => {
      this.nav.warehouseUrlCode = params['url_code'];
      this.tttNavService.tttId = this.localStorage.retrieve('tttId');
    });
    if (this.warehouseManifest === undefined) {
      this.getWarehouseManifestByWarehouseUrlAndTttIdAndManifestId(this.nav.warehouseUrlCode, this.localStorage.retrieve('tttId'), this.localStorage.retrieve('manifestId'));
      this.getListOfTpaNotClosedForCustomer(this.nav.warehouseUrlCode, this.localStorage.retrieve('customerId'));
    } else {
      this.getListOfTpaNotClosedForCustomer(this.nav.warehouseUrlCode, this.warehouseManifest.manifest.customer.customerID);
    }
  }

  private getWarehouseManifestByWarehouseUrlAndTttIdAndManifestId(warehouseUrlCode: string, tttId: number, manifestId: number) {
    let headers = new HttpHeaders().set('truck', 'ttt');

    this.apiService.getWarehouseManifestByWarehouseUrlAndTttIdAndManifestId(warehouseUrlCode, tttId, manifestId, headers).subscribe(
      res => {
        this.warehouseManifest = res;
      },
      err => {
        console.log('The error occurred while receiving WarehouseManifest');
      }
    )
  }

  getClassForRow(manifestReference: ManifestReference, ttt: Ttt) {
    let result = '';
    if (ttt.tttStatus.tttStatusName === this.arrived) {
      if (manifestReference.qtyPlanned > manifestReference.qtyReal)
        result = 'red_row';
      if (manifestReference.qtyPlanned < manifestReference.qtyReal)
        result = 'yellow_row';
      if (manifestReference.qtyPlanned === manifestReference.qtyReal)
        result = 'green_row';
    }
    return result;
  }

  private getListOfTpaNotClosedForCustomer(urlCode: string, customerID: number) {
    this.apiService.getListOfTpaNotClosedForCustomer(urlCode, customerID).subscribe(
      res => {
        this.tpaListNotClosedForCustomer = res.sort( (a, b) => a.status.statusName.localeCompare(b.status.statusName));
        console.log("THe customer id " + customerID);
      },
       err=> {
         console.log('The error occurred while receiving Not Closed Tpa for Customer ' + customerID);
       }
    )
  }

  editModeActivation() {
    this.isEditMode = !this.isEditMode;
  }

  getGross() {
    let gross = 0;
    this.warehouseManifest.manifest.manifestsReferenceSet.forEach( manifestReference => {
      gross += manifestReference.grossWeightPlanned;
    });
    return gross;
  }

  changeKpiLabel() {
    this.warehouseManifest.kpiLabel = !this.warehouseManifest.kpiLabel;
  }

  changeKpiDocument() {
    this.warehouseManifest.kpiDocument = !this.warehouseManifest.kpiDocument;
  }

  changeKpiManifest() {
    this.warehouseManifest.kpiManifest = !this.warehouseManifest.kpiManifest;
  }
}
