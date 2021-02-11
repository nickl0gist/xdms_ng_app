import {Component, OnInit} from '@angular/core';
import {TruckNavService} from "../../shared/service/truck-nav.service";
import {ApiService} from "../../shared/service/api.service";
import {NavbarService} from "../../shared/service/navbar.service";
import {ActivatedRoute} from "@angular/router";
import {LocalStorageService} from "ngx-webstorage";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {NumberFormatPipe} from "../../shared/pipe/number-format.pipe";
import {Tpa} from "../../model/tpa/tpa";
import {Subscription} from "rxjs";
import {TpaStatus} from "../../model/tpa/tpa-status";
import {WhType} from "../../model/warehouse/wh-type";
import {BrowserModule} from '@angular/platform-browser';
import {ManifestReference} from "../../model/manifest/manifest-reference";
import * as myGlobals from "../../global";
import {TruckType} from "../../model/truck/truck-type";
import {newArray} from "@angular/compiler/src/util";
import {saveAs} from 'file-saver';
import {FormArray, FormBuilder, FormGroup, Validators} from "@angular/forms";

@Component({
  selector: 'app-tpa',
  templateUrl: './tpa.component.html',
  styleUrls: ['./tpa.component.css'],
  providers: [NumberFormatPipe]
})
export class TpaComponent implements OnInit {

  tpaId: number;
  tpa: Tpa;
  private routeSub: Subscription;
  closed: string = TpaStatus.CLOSED.statusName;
  txdType: string = WhType.TXD.type;
  MANUALLY_ADDED_POSTFIX = myGlobals.MANUALLY_ADDED_POSTFIX;
  LOWER_BORDER_UTILIZATION = myGlobals.LOWER_BORDER_UTILIZATION;
  UPPER_BORDER_UTILIZATION = myGlobals.UPPER_BORDER_UTILIZATION;
  totalCbm = 0.0;
  totalWeight = 0.0;
  totalLdm = 0.0;
  truckTypes: TruckType[];
  chosenTruck: TruckType;
  anyNotArrived = false;
  isEditMode = false;
  changeTpaNameAndDateForm: FormGroup;
  tpaListNotClosedForCustomer: Tpa[];

  constructor(private tpaNavService: TruckNavService, private apiService: ApiService, public nav: NavbarService,
              private route: ActivatedRoute, public localStorage: LocalStorageService, private modal: NgbModal,
              private numberFormat: NumberFormatPipe, private fb: FormBuilder) {

    this.changeTpaNameAndDateForm = this.fb.group({});
  }

  ngOnInit(): void {
    this.nav.show();
    this.initTruckTypes();
    this.routeSub = this.route.params.subscribe(params => {
      this.nav.warehouseUrlCode = params['url_code'];
      this.nav.currentDate = params['date'];
    });
    this.tpaId = this.localStorage.retrieve('tpaId');
    this.getTpaById(this.tpaId);

    this.nav.currentDateChangeObs.subscribe((theDate) => {
      }
    );
  }

  private calculateKpi() {
    this.getTotalCbm();
    this.getTotalWeight();
    this.getTotalLdm();
  }

  private getTpaById(tpaId: number) {
    this.apiService.getTpaById(this.nav.warehouseUrlCode, tpaId).subscribe(
      res => {
        this.totalCbm = 0.0;
        this.totalWeight = 0.0;
        this.totalLdm = 0.0;
        this.tpa = res;
        this.createForm();
        this.mapManifestReferenceSetToForm();
        this.calculateKpi();
        this.hasAnyNotArrived();
        this.getListOfTpaNotClosedForCustomer(this.nav.warehouseUrlCode, this.tpa.tpaDaysSetting.whCustomer.customer.customerID);
      },
      error => {
        console.log(`Error occurred while getting Tpa with id=${tpaId} for Warehouse urlCode=${this.nav.warehouseUrlCode}`);
      }
    )
  }

  /**
   * Check if ManifestReference has real qty bigger than 0. Otherwise status 'Not Arrived' returns
   * @param manifestReference
   */
  isArrived(manifestReference: ManifestReference): string {
    let status = '';
    if (manifestReference.qtyReal > 0) {
      status = 'Arrived';
    } else {
      status = 'Not Arrived';
    }
    return status;
  }

  /**
   * TODO: Calculate Volume utilization using different Types of Trucks.
   * Calculates Volume utilization of the cargo
   */
  volumeUtilization() {
    return parseFloat(((this.totalCbm / this.chosenTruck.volume) * 100.0).toFixed(2));
  }

  getClassForUtilization(volumeUtil: number) {
    let colorClass = '';
    if (volumeUtil > this.UPPER_BORDER_UTILIZATION)
      colorClass = 'green_alert';
    if (volumeUtil < this.UPPER_BORDER_UTILIZATION || volumeUtil == this.UPPER_BORDER_UTILIZATION)
      colorClass = 'yellow_alert';
    if (volumeUtil < this.LOWER_BORDER_UTILIZATION || volumeUtil == this.LOWER_BORDER_UTILIZATION) {
      colorClass = 'red_alert';
    }
    return colorClass;
  }

  /**
   * TODO: Calculate LDM using different Types of Trucks.
   * Calculates LDM with formula { (palletWidth * palletLength) / [loading width of truck] / stackability }
   * @param manifestReference
   */
  getLdmForManifestReference(manifestReference: ManifestReference) {
    return parseFloat((manifestReference.palletQtyReal * ((manifestReference.palletLength / 1000) * (manifestReference.palletWidth / 1000)) / this.chosenTruck.width / manifestReference.stackability).toFixed(3));
  }

  /**
   * TODO: Calculate Weight Utilization using different Types of Trucks.
   */
  getWeightUtilization() {
    return parseFloat(((this.totalWeight / this.chosenTruck.payload) * 100.0).toFixed(2));
  }

  private getTotalLdm() {
    this.tpa.manifestReferenceSet.forEach(manifest => {
      this.totalLdm += this.getLdmForManifestReference(manifest);
    });
    this.totalLdm = parseFloat(this.totalLdm.toFixed(3));
  }

  private getTotalWeight() {
    this.tpa.manifestReferenceSet.forEach(manifestReference => {
      this.totalWeight += manifestReference.grossWeightReal;
    });
    this.totalWeight = parseFloat(this.totalWeight.toFixed(2));
  }

  private getTotalCbm() {
    let result = 0.0;
    this.tpa.manifestReferenceSet.forEach(manifestReference => {
      result += manifestReference.palletQtyReal * (manifestReference.palletWidth / 1000) * (manifestReference.palletLength / 1000) * (manifestReference.palletHeight / 1000);
    });
    this.totalCbm = parseFloat(result.toFixed(2));
  }

  getLdmUtilization() {
    return parseFloat(((this.totalLdm / this.chosenTruck.length) * 100.0).toFixed(2));
  }

  getTotalPalletQtyAndBoxesQty() {
    let palletQty = 0;
    let boxesQty = 0;
    this.tpa.manifestReferenceSet.forEach(manifest => {
      palletQty += manifest.palletQtyReal;
      boxesQty += manifest.boxQtyReal;
    });

    if (boxesQty > 0)
      return `${palletQty}p ${boxesQty}b`;

    return palletQty;
  }

  private initTruckTypes() {
    this.chosenTruck = TruckType.JUMBO;
    this.truckTypes = [];
    this.truckTypes.push(TruckType.JUMBO);
    this.truckTypes.push(TruckType.STANDART12);
    this.truckTypes.push(TruckType.STANDART20);
    this.truckTypes.push(TruckType.STANDART24);
    this.truckTypes.push(TruckType.AUTO1_5);
    this.truckTypes.push(TruckType.AUTO3_5);
    this.truckTypes.push(TruckType.AUTO5_5);
  }

  setTruckType(truckType: TruckType) {
    this.chosenTruck = truckType;
  }

  /**
   * Method which fires up when user wants to get Excel Packing List for closed TPA.
   */
  getExcelPackingList() {
    this.apiService.getExcelPackingListForTpa(this.nav.warehouseUrlCode, this.tpa.tpaID).subscribe(
      res => {
        const blob = new Blob([res], {type: 'application/vnd.ms-excel'});
        const file = new File([blob], `packing_list-${Date.now()}.xlsx`, {type: 'application/vnd.ms.excel'});
        saveAs(file);
      },
      error => {
        console.log(`Error occurred while getting Excel file with Packing List for TPA ${this.tpa.name} in Warehouse: ${this.nav.warehouseUrlCode}`);
      }
    )
  }

  /**
   * Check if there any manifestReference entities has status 'Not Arrived'
   */
  hasAnyNotArrived() {
    this.tpa.manifestReferenceSet.forEach(manifest => {
      if (this.isArrived(manifest) === 'Not Arrived') {
        this.anyNotArrived = true;
      }
    });
  }

  closeTpa() {
    alert("close TPA request!");
  }

  updateNameAndPlannedDeparture() {
    this.tpa.manifestReferenceSet.forEach((mRs, index) => {
      mRs.grossWeightReal = parseFloat(this.changeTpaNameAndDateForm.get(['manifestReferenceListForm', index]).get('grossWeightReal').value.toString().replace('.', '').replace(',', '.'));
      mRs.palletId = this.changeTpaNameAndDateForm.get(['manifestReferenceListForm', index]).get('palletId').value;
      mRs.stackability = parseInt(this.changeTpaNameAndDateForm.get(['manifestReferenceListForm', index]).get('stackability').value);
      let tpaToPlace = this.getTpaToPlace(index);
      mRs.tpa = tpaToPlace === undefined ? this.tpa : tpaToPlace;
    });

    this.tpa.name = this.changeTpaNameAndDateForm.get('tpaName').value;
    this.tpa.departurePlan = this.changeTpaNameAndDateForm.get('plannedDispatch').value;
    this.apiService.updateTpaNameAndDepartureDatePlan(this.nav.warehouseUrlCode, this.tpa).subscribe(
      res => {
        this.tpa = res;
        this.updateManifestReferenceWithinTpa();
      },
      error => {
        console.log(`Error occurred while updating TPA name and Departure Date for TPA ${this.tpa.name} in Warehouse: ${this.nav.warehouseUrlCode}`);
        alert(`Error occurred while updating TPA name and Departure Date for TPA ${this.tpa.name} in Warehouse: ${this.nav.warehouseUrlCode}`);
        this.updateManifestReferenceWithinTpa();
      })
  }

  private updateManifestReferenceWithinTpa(){
    this.apiService.putManifestReferenceListAfterReception(this.nav.warehouseUrlCode, this.tpa.manifestReferenceSet).subscribe(
      res => {
        this.tpa.manifestReferenceSet = res;
        this.getTpaById(this.tpaId);
        this.editModeActivation();
      },
      error => {
        alert(`Error occurred while updating ManifestReferences TPA ${this.tpa.name} in Warehouse: ${this.nav.warehouseUrlCode}`);
        this.cancelAction();
      }
    )
  }

  editModeActivation() {
    if (!this.isEditMode) {
      this.manifestReferenceGetter.controls.forEach(control => {
        control.get('grossWeightReal').setValue(control.get('grossWeightReal').value.toString().replace('.', ''));
      });
    }
    this.isEditMode = !this.isEditMode;
  }

  private createForm() {
    this.changeTpaNameAndDateForm = this.fb.group({
      tpaName: [this.tpa?.name, Validators.compose([
        Validators.required,
        Validators.pattern('^[0-9A-Za-z\\-_]+')
      ])],
      plannedDispatch: [this.tpa?.departurePlan, Validators.compose([
        Validators.required,
        Validators.pattern('^20[0-9]{2}-[0-1][0-9]-[0-3][0-9]T[0-2][0-9]:[0-5][0-9](:[0-5][0-9])?$')
      ])],
      truckType: [this.chosenTruck, Validators.required],
      manifestReferenceListForm: this.fb.array([])
    });
  }

  get manifestReferenceGetter() {
    return this.changeTpaNameAndDateForm.get("manifestReferenceListForm") as FormArray;
  }

  private mapManifestReferenceSetToForm() {
    this.tpa.manifestReferenceSet.map(mR =>
      this.manifestReferenceGetter.push(this.fb.group({
        grossWeightReal: [this.numberFormat.transform(mR.grossWeightReal),
          Validators.pattern('^[0-9]?\\d{0,4},?\\d{1,3}$')],
        palletId: [mR.palletId, Validators.pattern('^[\\da-zA-Z]{1,3}$')],
        stackability: [mR.stackability, Validators.pattern('^[0-3]$')],
        tpaIdForm: [mR.tpa?.tpaID, Validators.required]
      })));
  }

  private getListOfTpaNotClosedForCustomer(urlCode: string, customerID: number) {
    this.apiService.getListOfTpaNotClosedForCustomer(urlCode, customerID).subscribe(
      res => {
        this.tpaListNotClosedForCustomer = res.sort((a, b) => a.status.statusName.localeCompare(b.status.statusName));
      },
      err => {
        console.log('The error occurred while receiving Not Closed Tpa for Customer ' + customerID);
      }
    )
  }

  cancelAction() {
    this.tpa.manifestReferenceSet.map((mR, index) => {
      this.manifestReferenceGetter.at(index).get('grossWeightReal').markAsPristine();
      this.manifestReferenceGetter.at(index).get('palletId').markAsPristine();
      this.manifestReferenceGetter.at(index).get('stackability').markAsPristine();
      this.manifestReferenceGetter.at(index).get('tpaIdForm').markAsPristine();

      this.manifestReferenceGetter.at(index).patchValue({
        grossWeightReal: this.numberFormat.transform(mR.grossWeightReal),
        palletId: mR.palletId,
        stackability: mR.stackability,
        tpaIdForm: mR.tpa?.tpaID,
      });
    });
    this.editModeActivation()
  }

  private getTpaToPlace(index: number) {
      return this.tpaListNotClosedForCustomer.find(tpa => {
        if (tpa.tpaID == this.changeTpaNameAndDateForm.get(['manifestReferenceListForm', index]).get('tpaIdForm').value)
          return true;
      });
    }
}
