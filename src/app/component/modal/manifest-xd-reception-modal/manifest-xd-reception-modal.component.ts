import {Component, OnInit, Output, EventEmitter, Input, ChangeDetectionStrategy} from '@angular/core';
import {NgbActiveModal} from "@ng-bootstrap/ng-bootstrap";
import {ApiService} from "../../../shared/service/api.service";
import {AbstractControl, FormBuilder, FormGroup, Validators} from "@angular/forms";
import {WarehouseManifest} from "../../../model/manifest/warehouse-manifest";
import * as myGlobals from "../../../global";
import {NumberFormatPipe} from "../../../shared/pipe/number-format.pipe";
import {Ttt} from "../../../model/ttt/ttt";
import {TttEnum} from "../../../model/ttt/ttt-enum";
import {DatePipe} from '@angular/common';
import {TttStatus} from "../../../model/ttt/ttt-status";
import {TttWarehouseManifestDTO} from "../../../model/ttt/ttt-warehouse-manifest-dto";

@Component({
  selector: 'app-manifest-xd-reception-modal',
  templateUrl: './manifest-xd-reception-modal.component.html',
  styleUrls: ['./manifest-xd-reception-modal.component.css'],
  providers: [NumberFormatPipe]
})
export class ManifestXdReceptionModalComponent implements OnInit {

  @Input() fromParent;
  warehouseManifest: WarehouseManifest;
  MANUALLY_ADDED_POSTFIX = myGlobals.MANUALLY_ADDED_POSTFIX;
  SYMBOL_NOT_ARRIVED = myGlobals.SYMBOL_NOT_ARRIVED;

  arrived = TttStatus.ARRIVED;

  palletQtyReal: number;
  boxQtyReal: number;
  weightReal: number;
  ttt: Ttt;
  private urlCode: string;
  updatedTttWarehouseManifestDTO: TttWarehouseManifestDTO;

  kpiLabel: boolean;
  kpiDocument: boolean;
  kpiManifest: boolean;

  receptionForm: FormGroup;

  constructor(public activeModal: NgbActiveModal, private apiService: ApiService,
              private fb: FormBuilder, private numberFormat: NumberFormatPipe) {
  }

  ngOnInit(): void {
    this.warehouseManifest = this.fromParent.warehouseManifest;
    this.ttt = this.fromParent.ttt;
    this.urlCode = this.fromParent.urlCode;

    this.kpiLabel = this.warehouseManifest.kpiLabel;
    this.kpiDocument = this.warehouseManifest.kpiDocument;
    this.kpiManifest = this.warehouseManifest.kpiManifest;
    this.createForm();
  }

  cancelButtonAction() {
    this.activeModal.dismiss('cancel');
  }

  changeKpiLabel() {
    this.kpiLabel = !this.kpiLabel;
  }

  changeKpiDocument() {
    this.kpiDocument = !this.kpiDocument;
  }

  changeKpiManifest() {
    this.kpiManifest = !this.kpiManifest;
  }

  private createForm() {
    this.receptionForm = this.fb.group({
      palletQtyReal: [this.warehouseManifest.palletQty, Validators.compose([Validators.pattern('^\\d{0,3}$'), Validators.required])],
      boxQtyReal: [this.warehouseManifest.boxQtyReal, Validators.compose([Validators.pattern('^\\d{0,3}$'), Validators.required])],
      weightReal: [this.warehouseManifest.grossWeight * 1000, Validators.compose([Validators.pattern('^[0-9]?\\d{0,9},?\\d{1,3}$'), Validators.required])]
    });
  }

  planToReal() {
    this.kpiLabel = true;
    this.kpiDocument = true;
    this.kpiManifest = true;
    this.receptionForm.get('palletQtyReal').setValue(this.warehouseManifest.manifest.palletQtyPlanned);
    this.receptionForm.get('boxQtyReal').setValue(this.warehouseManifest.manifest.boxQtyPlanned);
    this.receptionForm.get('weightReal').setValue(this.warehouseManifest.manifest.totalWeightPlanned);
  }

  saveButtonAction() {
    this.warehouseManifest.kpiLabel = this.kpiLabel;
    this.warehouseManifest.kpiDocument = this.kpiDocument;
    this.warehouseManifest.kpiManifest = this.kpiManifest;
    this.warehouseManifest.palletQty = this.getRealQty(this.receptionForm.get('palletQtyReal'));
    this.warehouseManifest.boxQtyReal = this.getRealQty(this.receptionForm.get('boxQtyReal'));
    this.warehouseManifest.grossWeight = this.getRealQty(this.receptionForm.get('weightReal')) / 1000;

    this.apiService.putWarehouseManifestUpdate(this.urlCode, this.ttt.tttID, this.warehouseManifest).subscribe(
      res => {
        this.warehouseManifest = res;
        this.apiService.getTttWarehouseManifestDtoByWarehouseAndTtt(this.urlCode, this.ttt.tttID).subscribe(
          updatedTttWarehouseManifestDTO => {
            this.activeModal.close(updatedTttWarehouseManifestDTO);
          },
          error => {
            console.log(`Error occurred while getting TTT name=${this.ttt.truckName}`);
          }
        );
      },
      error => {
        console.log(`Error occurred while updating Manifest ${this.warehouseManifest.manifest.manifestCode}: ${error.toString()}`);
        this.activeModal.close();
      }
    );
  }

  private getRealQty(realQty: AbstractControl) {
    if (realQty.value == null)
      return 0;
    return parseInt(realQty.value.toString());
  }

  private updateTtt(): TttWarehouseManifestDTO | void {
    this.apiService.getTttWarehouseManifestDtoByWarehouseAndTtt(this.urlCode, this.ttt.tttID).subscribe(
      res => {
        this.updatedTttWarehouseManifestDTO = res;
      },
      error => {
        console.log(`Error occurred while getting TTT name=${this.ttt.truckName}`);
      }
    );
  }

  getBoxQty() {
    return this.warehouseManifest.manifest.boxQtyPlanned == undefined ?  this.SYMBOL_NOT_ARRIVED : this.numberFormat.transform(this.warehouseManifest.manifest.boxQtyPlanned);
  }
}
