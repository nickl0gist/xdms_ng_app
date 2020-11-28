import {Component, OnInit, SecurityContext, TemplateRef} from '@angular/core';
import {NavbarService} from "../../shared/service/navbar.service";
import {ApiService} from "../../shared/service/api.service";
import {ActivatedRoute} from "@angular/router";
import {LocalStorageService} from "ngx-webstorage";
import {WarehouseManifest} from "../../model/manifest/warehouse-manifest";
import {TttNavService} from "../../shared/service/ttt-nav.service";
import {Observable, Subscription} from "rxjs";
import {HttpHeaders} from "@angular/common/http";
import * as myGlobals from "../../global";
import {NgVarDirective} from "../../shared/directives/ng-var.directive";
import {CommonModule} from '@angular/common';
import {TttEnum} from "../../model/ttt/ttt-enum";
import {ManifestReference} from "../../model/manifest/manifest-reference";
import {Ttt} from "../../model/ttt/ttt";
import {Tpa} from "../../model/tpa/tpa";
import {BrowserModule} from '@angular/platform-browser';
import {NumberFormatPipe} from "../../shared/pipe/number-format.pipe";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {AddReferenceComponent} from "../modal/add-reference/add-reference.component";
import {Manifest} from "../../model/manifest/manifest";
import {Reference} from "../../model/reference/reference";
import {AbstractControl, FormArray, FormBuilder, FormGroup, Validators} from "@angular/forms";
import {DomSanitizer, SafeHtml} from '@angular/platform-browser';

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
  MANUALLY_ADDED_POSTFIX = myGlobals.MANUALLY_ADDED_POSTFIX;
  NOT_ARRIVED = myGlobals.SYMBOL_NOT_ARRIVED;
  tpaListNotClosedForCustomer: Tpa[];
  isEditMode = false;
  receptionForm: FormGroup;

  constructor(public nav: NavbarService, private apiService: ApiService, private route: ActivatedRoute,
              public localStorage: LocalStorageService, private tttNavService: TttNavService,
              private modal: NgbModal, private fb: FormBuilder, private numberFormat: NumberFormatPipe,
              private sanitizer: DomSanitizer) {
    this.createForm();
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
      this.mapManifestReferenceSetToForm();
    }
    this.sortManifestReferenceSet();
  }

  private getWarehouseManifestByWarehouseUrlAndTttIdAndManifestId(warehouseUrlCode: string, tttId: number, manifestId: number) {
    this.apiService.getWarehouseManifestByWarehouseUrlAndTttIdAndManifestId(warehouseUrlCode, tttId, manifestId).subscribe(
      res => {
        this.warehouseManifest = res;
        this.tttNavService.warehouseManifest = res;
        this.mapManifestReferenceSetToForm();
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
        this.tpaListNotClosedForCustomer = res.sort((a, b) => a.status.statusName.localeCompare(b.status.statusName));
      },
      err => {
        console.log('The error occurred while receiving Not Closed Tpa for Customer ' + customerID);
      }
    )
  }

  onAddReferenceClick() {
    const modalRef = this.modal.open(AddReferenceComponent,
      {
        windowClass: 'myCustomModalClass',
      });

    modalRef.componentInstance.fromParent = {
      supplierId: this.warehouseManifest.manifest.supplier.supplierID,
      customerId: this.warehouseManifest.manifest.customer.customerID
    };
    modalRef.result.then((result) => {
        let manifestReferenceToAdd = this.getManifestReferenceToAdd(result);
        this.apiService.putAdditionalReferenceToManifest(this.nav.warehouseUrlCode, this.warehouseManifest.ttt.tttID, this.warehouseManifest.manifest.manifestID, manifestReferenceToAdd).subscribe(
          res => {
            this.manifestReferenceGetter.clear();
            this.warehouseManifest.manifest = res;
            this.mapManifestReferenceSetToForm();
            this.tttNavService.warehouseManifest.manifest = res;
          },
          error => {
            console.log(`Error occurred while adding new ManifestReference to ttt ${this.warehouseManifest.ttt.tttID} in Warehouse ${this.warehouseManifest.warehouse.name}. Error: ${error}`);
          }
        );
        console.log(result);
      }, (reason) => {
      }
    );
  }

  private mapManifestReferenceSetToForm() {
    this.sortManifestReferenceSet();
    this.warehouseManifest.manifest.manifestsReferenceSet.map(mR =>
      this.manifestReferenceGetter.push(this.fb.group({
        qtyReal: [mR.qtyReal === 0 ? this.NOT_ARRIVED : this.numberFormat.transform(mR.qtyReal),
          Validators.pattern('^[0-9]?\\d{0,9},?\\d{1,3}$|\\'+this.NOT_ARRIVED)],

        palletQtyReal: [mR.palletQtyReal === 0 ? this.NOT_ARRIVED : this.numberFormat.transform(mR.palletQtyReal),
          Validators.pattern('^[0-9]\\d{0,2}$|\\'+this.NOT_ARRIVED)],

        boxQtyReal: [mR.boxQtyReal === 0 ? this.NOT_ARRIVED : this.numberFormat.transform(mR.boxQtyReal),
          Validators.pattern('^[1-9]\\d{0,3}$|\\'+this.NOT_ARRIVED)],

        grossWeightReal: [this.numberFormat.transform(mR.grossWeightReal),
          Validators.pattern('^[0-9]?\\d{0,4},?\\d{1,3}$')],

        palletHeight: [mR.palletHeight, Validators.compose([Validators.pattern('^\\d{2,4}$'), Validators.required])],
        palletLength: [mR.palletLength, Validators.compose([Validators.pattern('^\\d{2,4}$'), Validators.required])],
        palletWidth: [mR.palletWidth, Validators.compose([Validators.pattern('^\\d{2,4}$'), Validators.required])],
        palletId: [mR.palletId, Validators.pattern('^[\\da-zA-Z]{1,3}$')],
        receptionNumber: [mR.receptionNumber, Validators.pattern('^\\d{1,11}$')],
        deliveryNumber: [mR.deliveryNumber, Validators.pattern('^[\\da-zA-Z\\-\\/]{1,12}$')],
        tpaIdForm: mR.tpa?.tpaID,
        mRiD: mR.manifestReferenceId
      }, {validators: ManifestComponent.QtyRealValidator}))
    );
  }

  private sortManifestReferenceSet() {
    this.warehouseManifest.manifest.manifestsReferenceSet.sort((mR1, mR2): number => {
      if (mR1.manifestReferenceId > mR2.manifestReferenceId)
        return 1;
      if (mR1.manifestReferenceId < mR2.manifestReferenceId)
        return -1;
    });
  }

  editModeActivation() {
    if (!this.isEditMode) {
      this.manifestReferenceGetter.controls.forEach(control => {
        control.get('qtyReal').setValue(control.get('qtyReal').value.toString().replace('.', ''));
        control.get('palletQtyReal').setValue(control.get('palletQtyReal').value.toString().replace('.', ''));
        control.get('boxQtyReal').setValue(control.get('boxQtyReal').value.toString().replace('.', ''));
        control.get('grossWeightReal').setValue(control.get('grossWeightReal').value.toString().replace('.', ''));
      });
    }
    this.isEditMode = !this.isEditMode;
  }

  saveClickAction() {
    let palletQtyReal = 0;
    let boxQtyReal = 0;
    this.warehouseManifest.manifest.manifestsReferenceSet.forEach((mRs, index) => {
      mRs.qtyReal = this.getQtyReal(index);
      mRs.palletQtyReal = this.getPalletQtyReal(index);
      mRs.boxQtyReal = this.getBoxQtyReal(index);
      mRs.grossWeightReal = parseFloat(this.receptionForm.get(['manifestReferenceListForm', index]).get('grossWeightReal').value.toString().replace('.', '').replace(',', '.'));
      mRs.palletHeight = parseInt(this.receptionForm.get(['manifestReferenceListForm', index]).get('palletHeight').value);
      mRs.palletLength = parseInt(this.receptionForm.get(['manifestReferenceListForm', index]).get('palletLength').value);
      mRs.palletWidth = parseInt(this.receptionForm.get(['manifestReferenceListForm', index]).get('palletWidth').value);
      mRs.palletId = this.receptionForm.get(['manifestReferenceListForm', index]).get('palletId').value;
      let reception = '';
      reception = this.receptionForm.get(['manifestReferenceListForm', index]).get('receptionNumber').value == null ? '' : this.receptionForm.get(['manifestReferenceListForm', index]).get('receptionNumber').value;
      mRs.receptionNumber = reception.length == 0 ? null: reception;
      let dn = '';
      dn = this.receptionForm.get(['manifestReferenceListForm', index]).get('deliveryNumber').value == null ? '' : this.receptionForm.get(['manifestReferenceListForm', index]).get('deliveryNumber').value;
      mRs.deliveryNumber = dn.length == 0 ? null: dn;
      let tpaToPlace = this.getTpaToPlace(index);
      mRs.tpa = tpaToPlace === undefined ? this.warehouseManifest.tpa : tpaToPlace;
      palletQtyReal += mRs.palletQtyReal;
      boxQtyReal += mRs.boxQtyReal;

      this.manifestReferenceGetter.at(index).patchValue({
        qtyReal: mRs.qtyReal === 0 ? this.NOT_ARRIVED : this.numberFormat.transform(mRs.qtyReal),
        palletQtyReal: mRs.palletQtyReal === 0 ? this.NOT_ARRIVED : this.numberFormat.transform(mRs.palletQtyReal),
        boxQtyReal: mRs.boxQtyReal === 0 ? this.NOT_ARRIVED : this.numberFormat.transform(mRs.boxQtyReal),
        grossWeightReal: this.numberFormat.transform(mRs.grossWeightReal),
      });
    });
    this.warehouseManifest.palletQty = palletQtyReal;
    this.warehouseManifest.boxQtyReal = boxQtyReal;

    this.apiService.putManifestReferenceListAfterReception(this.nav.warehouseUrlCode, this.warehouseManifest.manifest.manifestsReferenceSet).subscribe(
      res => {
        this.warehouseManifest.manifest.manifestsReferenceSet = res;
        this.sortManifestReferenceSet();
        this.apiService.putWarehouseManifestUpdate(this.nav.warehouseUrlCode, this.tttNavService.tttId, this.warehouseManifest).subscribe(
          res => {
            this.warehouseManifest = res;
            this.sortManifestReferenceSet();
          },
          error => {
            console.log(`Error occurred while sending WarehouseManifest ${error.toString()}`);
          }
        )
      },
      error => {
        console.log(`Error occurred while attempt of sending reception information to server: ${error.toString()}`);
      }
    );
    this.editModeActivation();
  }

  private getBoxQtyReal(index: number) {
    return (this.receptionForm.get(['manifestReferenceListForm', index]).get('boxQtyReal').value.toString() === this.NOT_ARRIVED ||
    this.receptionForm.get(['manifestReferenceListForm', index]).get('boxQtyReal').value.toString() === '') ? 0
      : parseInt(this.receptionForm.get(['manifestReferenceListForm', index]).get('boxQtyReal').value);
  }

  private getPalletQtyReal(index: number) {
    return (this.receptionForm.get(['manifestReferenceListForm', index]).get('palletQtyReal').value.toString() === this.NOT_ARRIVED ||
      this.receptionForm.get(['manifestReferenceListForm', index]).get('palletQtyReal').value.toString() === '') ? 0
      : parseInt(this.receptionForm.get(['manifestReferenceListForm', index]).get('palletQtyReal').value);
  }

  private getQtyReal(index: number) {
    return (this.receptionForm.get(['manifestReferenceListForm', index]).get('qtyReal').value.toString() === this.NOT_ARRIVED ||
      this.receptionForm.get(['manifestReferenceListForm', index]).get('qtyReal').value.toString() === '') ? 0
      : parseFloat(this.receptionForm.get(['manifestReferenceListForm', index]).get('qtyReal').value.toString().replace('.', '').replace(',', '.'));
  }

  private getTpaToPlace(index: number) {
    if (this.receptionForm.get(['manifestReferenceListForm', index]).get('qtyReal').value.toString() === this.NOT_ARRIVED ||
      this.receptionForm.get(['manifestReferenceListForm', index]).get('qtyReal').value.toString() == 0) {
      return null;
    } else {
      return this.tpaListNotClosedForCustomer.find(tpa => {
        if (tpa.tpaID == this.receptionForm.get(['manifestReferenceListForm', index]).get('tpaIdForm').value)
          return true;
      });
    }
  }

  getGrossTotal() {
    let gross = 0.0;
    this.warehouseManifest.manifest.manifestsReferenceSet.forEach(manifestReference => {
      if (manifestReference.grossWeightReal === 0) {
        gross += Math.floor(manifestReference.grossWeightPlanned * 100);
      } else {
        gross += Math.floor(manifestReference.grossWeightReal * 100);
      }
    });
    gross /= 100;
    return gross.toFixed(2);
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

  private getManifestReferenceToAdd(result: any) {
    let reference: Reference = result[0];
    let palletQty = result[1];
    let boxQty = result[2];
    let pcsQty = result[3];

    let manifestReference = {} as ManifestReference;
    manifestReference.manifest = this.warehouseManifest.manifest;
    manifestReference.reference = reference;
    manifestReference.palletQtyPlanned = palletQty;
    manifestReference.boxQtyPlanned = boxQty;
    manifestReference.qtyPlanned = pcsQty.toString().replace(',', '.');
    manifestReference.tpa = this.warehouseManifest.tpa;
    manifestReference.grossWeightPlanned = reference.weight * pcsQty + reference.palletWeight * palletQty + reference.weightOfPackaging * boxQty;
    manifestReference.grossWeightReal = manifestReference.grossWeightPlanned;
    manifestReference.palletHeight = reference.palletHeight;
    manifestReference.palletLength = reference.palletLength;
    manifestReference.palletWidth = reference.palletWidth;
    manifestReference.palletWeight = reference.palletWeight;
    manifestReference.netWeight = reference.weight * pcsQty;
    manifestReference.palletId = null;
    manifestReference.stackability = reference.stackability;
    return manifestReference;
  }

  private createForm() {
    this.receptionForm = this.fb.group({
      manifestReferenceListForm: this.fb.array([])
    });
  }

  get manifestReferenceGetter() {
    return this.receptionForm.get("manifestReferenceListForm") as FormArray;
  }

  /**
   * Fires Up when user hits cancel button while ReceptionForm is in edit mode.
   */
  cancelClickAction() {
    this.warehouseManifest.manifest.manifestsReferenceSet.map((mR, index) => {
      this.manifestReferenceGetter.at(index).get('qtyReal').markAsPristine();
      this.manifestReferenceGetter.at(index).get('palletQtyReal').markAsPristine();
      this.manifestReferenceGetter.at(index).get('boxQtyReal').markAsPristine();
      this.manifestReferenceGetter.at(index).get('grossWeightReal').markAsPristine();
      this.manifestReferenceGetter.at(index).get('palletHeight').markAsPristine();
      this.manifestReferenceGetter.at(index).get('palletLength').markAsPristine();
      this.manifestReferenceGetter.at(index).get('palletWidth').markAsPristine();
      this.manifestReferenceGetter.at(index).get('palletId').markAsPristine();
      this.manifestReferenceGetter.at(index).get('receptionNumber').markAsPristine();
      this.manifestReferenceGetter.at(index).get('deliveryNumber').markAsPristine();
      this.manifestReferenceGetter.at(index).get('tpaIdForm').markAsPristine();

      this.manifestReferenceGetter.at(index).patchValue({
        qtyReal: mR.qtyReal === 0 ? this.NOT_ARRIVED : this.numberFormat.transform(mR.qtyReal),
        palletQtyReal: mR.palletQtyReal === 0 ? this.NOT_ARRIVED : this.numberFormat.transform(mR.palletQtyReal),
        boxQtyReal: mR.boxQtyReal === 0 ? this.NOT_ARRIVED : this.numberFormat.transform(mR.boxQtyReal),
        grossWeightReal: this.numberFormat.transform(mR.grossWeightReal),
        palletHeight: mR.palletHeight,
        palletLength: mR.palletLength,
        palletWidth: mR.palletWidth,
        palletId: mR.palletId,
        receptionNumber: mR.receptionNumber,
        deliveryNumber: mR.deliveryNumber,
        tpaIdForm: mR.tpa?.tpaID,
      })
    });
    this.editModeActivation();
  }

  checkIfRowHasAnyTouchedDirtyInvalidControls(abstractControl: AbstractControl) {
    return ((abstractControl.invalid && (abstractControl.touched || abstractControl.invalid))||
      (abstractControl.get('qtyReal').invalid && (abstractControl.get('qtyReal').touched || abstractControl.get('qtyReal').dirty)) ||
      (abstractControl.get('palletQtyReal').invalid && (abstractControl.get('palletQtyReal').touched || abstractControl.get('palletQtyReal').dirty)) ||
      (abstractControl.get('boxQtyReal').invalid && (abstractControl.get('boxQtyReal').touched || abstractControl.get('boxQtyReal').dirty)) ||
      (abstractControl.get('grossWeightReal').invalid && (abstractControl.get('grossWeightReal').touched || abstractControl.get('grossWeightReal').dirty)) ||
      (abstractControl.get('palletHeight').invalid && (abstractControl.get('palletHeight').touched || abstractControl.get('palletHeight').dirty)) ||
      (abstractControl.get('palletLength').invalid && (abstractControl.get('palletLength').touched || abstractControl.get('palletLength').dirty)) ||
      (abstractControl.get('palletWidth').invalid && (abstractControl.get('palletWidth').touched || abstractControl.get('palletWidth').dirty)) ||
      (abstractControl.get('palletId').invalid && (abstractControl.get('palletId').touched || abstractControl.get('palletId').dirty)) ||
      (abstractControl.get('receptionNumber').invalid && (abstractControl.get('receptionNumber').touched || abstractControl.get('receptionNumber').dirty)) ||
      (abstractControl.get('deliveryNumber').invalid && (abstractControl.get('deliveryNumber').touched || abstractControl.get('deliveryNumber').dirty)));
  }

  getMessageAboutMadeError(abstractControl: AbstractControl) {
    let message = '';
    if(abstractControl.hasError('notValid'))
      message += `<p><strong>QTY REAL: </strong>The Box Qty and Pallet Qty cannot be inputted if Pcs Qty is = 0</p>`;

    if (abstractControl.get('qtyReal').hasError('pattern'))
      message += `<p><strong>QTY REAL: </strong>Only Numbers are Allowed with comma as delimiter</p>`;

    if (abstractControl.get('palletQtyReal').hasError('pattern'))
      message += `<p><strong>PALLET QTY: </strong>Only Numbers are Allowed</p>`;

    if (abstractControl.get('boxQtyReal').hasError('pattern'))
      message += `<p><strong>BOX QTY: </strong>Only Numbers are Allowed</p>`;

    if (abstractControl.get('grossWeightReal').hasError('pattern'))
      message += `<p><strong>Gross Weight: </strong>Only Numbers are Allowed with comma as delimiter</p>`;

    if (abstractControl.get('palletHeight').hasError('pattern') ||
      abstractControl.get('palletLength').hasError('pattern') ||
      abstractControl.get('palletWidth').hasError('pattern'))
      message += `<p><strong>Pallet Size: </strong>Only Numbers are Allowed.</p>`;

    if (abstractControl.get('palletId').hasError('pattern'))
      message += `<p><strong>Pallet Id: </strong>Only Numbers and Letters are Allowed.</p>`;

    if (abstractControl.get('receptionNumber').hasError('pattern'))
      message += `<p><strong>Reception Number: </strong>Only Numbers are Allowed.</p>`;

    if (abstractControl.get('deliveryNumber').hasError('pattern'))
      message += `<p><strong>Delivery Note: </strong>Only Numbers, Letters and special characters: ${this.NOT_ARRIVED} and \'/\'are Allowed.</p>`;

    return this.sanitizer.bypassSecurityTrustHtml(message);
  }

  ifRowHasErrors(abstractControl: AbstractControl) {
    return abstractControl.hasError('notValid') ||
      abstractControl.get('qtyReal').hasError('pattern') ||
      abstractControl.get('palletQtyReal').hasError('pattern') ||
      abstractControl.get('boxQtyReal').hasError('pattern') ||
      abstractControl.get('grossWeightReal').hasError('pattern') ||
      abstractControl.get('palletHeight').hasError('pattern') ||
      abstractControl.get('palletId').hasError('pattern') ||
      abstractControl.get('receptionNumber').hasError('pattern') ||
      abstractControl.get('deliveryNumber').hasError('pattern');
  }

  private static QtyRealValidator(group: FormGroup) {
    if ((group.get('qtyReal').value === 0 || group.get('qtyReal').value === myGlobals.SYMBOL_NOT_ARRIVED) &&
      (group.get('palletQtyReal').value > 0 || group.get('boxQtyReal').value > 0)){
      return {notValid: true}
    }
    return null;
  }
}
