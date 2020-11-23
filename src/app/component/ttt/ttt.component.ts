import {Component, OnInit, TemplateRef, ViewChild} from '@angular/core';
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
import { BrowserModule } from '@angular/platform-browser';
import { saveAs } from 'file-saver';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {NgbTooltip} from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: 'app-ttt',
  templateUrl: './ttt.component.html',
  styleUrls: ['./ttt.component.css']
})
export class TttComponent implements OnInit {
  @ViewChild('t') toolTipReception: NgbTooltip;
  @ViewChild('toolTipOk') toolTipOk: TemplateRef<string>;
  @ViewChild('toolTipNok') toolTipNok: TemplateRef<string>;
  tttId: number;
  tttWarehouseManifestDTO: TttWarehouseManifestDTO;
  private routeSub: Subscription;
  arrived: string = TttEnum.ARRIVED;
  MANUALLY_ADDED_POSTFIX = myGlobals.MANUALLY_ADDED_POSTFIX;
  SYMBOL_NOT_ARRIVED = myGlobals.SYMBOL_NOT_ARRIVED;
  uploadReceptionForm = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.minLength(3)]),
    file: new FormControl('', [Validators.required]),
    fileSource: new FormControl('', [Validators.required])
  });
  uploading = true;
  uploadingResult: boolean;

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

  getExcelReceptionFile(){
    this.apiService.getExcelWithManifestReferencesForReception(this.nav.warehouseUrlCode, this.tttWarehouseManifestDTO.ttt.tttID).subscribe(
      res => {
        const blob = new Blob([res], {type: 'application/vnd.ms-excel'});
        const file = new File([blob], `reception-${Date.now()}.xlsx`, { type: 'application/vnd.ms.excel' });
        saveAs(file);
      },
      error => {
        console.log(`Error occurred while getting Excel file with reception information Warehouse: ${this.nav.warehouseUrlCode} TTT id:${this.tttWarehouseManifestDTO.ttt.tttID}`);
      }
    )
  }

  get f(){
    return this.uploadReceptionForm.controls;
  }

  onFileChange(event) {
    const formData = new FormData();
    if (event.target.files.length > 0) {
      this.uploading = false;
      const file = event.target.files[0];
      this.uploadReceptionForm.patchValue({
        fileSource: file
      });
      formData.append('file', this.uploadReceptionForm.get('fileSource').value);
      this.apiService.postExcelWithManifestReferencesForReception(this.nav.warehouseUrlCode, this.tttWarehouseManifestDTO.ttt.tttID, formData).subscribe(
        res=>{
          console.log(res);
          this.toolTipReception.ngbTooltip = this.toolTipOk;
          this.toolTipReception.open();

          this.uploading = true;
          this.uploadingResult = true;
          this.getTttWarehouseManifestDtoByWarehouseUrlAndTttId(this.localStorage.retrieve('tttId'));
        },
        error => {
          console.log(`Error: ${error}`);
          this.toolTipReception.ngbTooltip = this.toolTipNok;
          this.toolTipReception.open();
          this.uploading = true;
          this.uploadingResult = false;
        }
      );
    }
  }
}
