import {Component, Input, OnInit} from '@angular/core';
import {NgbActiveModal} from "@ng-bootstrap/ng-bootstrap";
import {ApiService} from "../../../shared/service/api.service";
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {ManifestReference} from "../../../model/manifest/manifest-reference";
import {Tpa} from "../../../model/tpa/tpa";
import * as myGlobals from "../../../global";
import {TruckType} from "../../../model/truck/truck-type";
import {NumberFormatPipe} from "../../../shared/pipe/number-format.pipe";

@Component({
  selector: 'app-split-reference',
  templateUrl: './split-reference.component.html',
  styleUrls: ['./split-reference.component.css'],
  providers: [NumberFormatPipe]
})
export class SplitReferenceComponent implements OnInit {
  @Input() fromParent;

  public MANUALLY_ADDED_POSTFIX = myGlobals.MANUALLY_ADDED_POSTFIX;
  manifestReferenceSource: ManifestReference;
  manifestReferenceResult: ManifestReference;
  urlCode: string;
  tpa: Tpa;
  tpaList: Tpa[];
  truckType: TruckType;
  splitManifestReferenceForm: FormGroup;
  palletQtyReal: number;
  refQty: number;
  boxQty: number;
  totalWeight: number;


  constructor(public activeModal: NgbActiveModal, private apiService: ApiService,
              private fb: FormBuilder, private numberFormat: NumberFormatPipe) {
    this.splitManifestReferenceForm = this.fb.group({});
  }

  ngOnInit(): void {
    this.manifestReferenceSource = this.fromParent.manifestReference;
    this.urlCode = this.fromParent.urlCode;
    this.tpa = this.fromParent.tpa;
    this.tpaList = this.fromParent.tpaListNotClosedForCustomer;
    this.truckType = this.fromParent.truckType;
    this.initiateResult();
    this.createForm();
  }

  getLdmForManifestReference(manifestReference: ManifestReference) {
    return parseFloat((manifestReference.palletQtyReal * ((manifestReference.palletLength / 1000) * (manifestReference.palletWidth / 1000)) / this.truckType.width / manifestReference.stackability).toFixed(3));
  }

  private initiateResult() {
    this.manifestReferenceResult = new ManifestReference();
    this.manifestReferenceResult.reference = this.manifestReferenceSource.reference;
    this.manifestReferenceResult.manifest = this.manifestReferenceSource.manifest;
    this.manifestReferenceResult.palletHeight = this.manifestReferenceSource.palletHeight;
    this.manifestReferenceResult.palletWeight = this.manifestReferenceSource.palletWeight;
    this.manifestReferenceResult.palletWidth = this.manifestReferenceSource.palletWidth;
    this.manifestReferenceResult.palletLength = this.manifestReferenceSource.palletLength;
    this.manifestReferenceResult.stackability = this.manifestReferenceSource.stackability;
    this.manifestReferenceResult.qtyReal = 0;
    this.manifestReferenceResult.qtyPlanned = 0;
    this.manifestReferenceResult.palletQtyReal = 0;
    this.manifestReferenceResult.palletQtyPlanned = 0;
    this.manifestReferenceResult.grossWeightReal = 0;
    this.manifestReferenceResult.grossWeightPlanned = 0;
    this.manifestReferenceResult.boxQtyReal = 0;
    this.manifestReferenceResult.boxQtyPlanned = 0;

    this.palletQtyReal = this.manifestReferenceSource.palletQtyReal;
    this.refQty = this.manifestReferenceSource.qtyReal;
    this.boxQty = this.manifestReferenceSource.boxQtyReal;
    this.totalWeight = this.manifestReferenceSource.grossWeightReal;
  }

  private createForm() {
    this.splitManifestReferenceForm = this.fb.group({
      palletQty: [0, Validators.compose([
        Validators.pattern('^[0-9]\\d{0,2}')
      ])],

      boxQty: [0, Validators.compose([
        Validators.required,
        Validators.pattern('^[0-9]\\d{0,3}')
      ])],

      refQty: [0, Validators.compose([
        Validators.required,
        Validators.pattern('^[0-9]?\\d{0,9},?\\d{1,3}$')
      ])],

      totalWeight: [0, Validators.compose([
        Validators.required,
        Validators.pattern('^[0-9]?\\d{0,9},?\\d{1,3}$')
      ])],

      tpa: [this.tpaList[0], Validators.compose([Validators.required])]
    }, {validators: SplitReferenceComponent.PalletBoxQtyValidator(this.palletQtyReal, this.refQty, this.boxQty, this.totalWeight)})
  }

  /**
   * Recalculation methods of LDM, BoxQty, GrossWeight, RefQty
   */
  recalculateLdm() {
    this.manifestReferenceResult.palletQtyReal = Number.isNaN(parseInt(this.splitManifestReferenceForm.get('palletQty').value)) ? 0 : parseInt(this.splitManifestReferenceForm.get('palletQty').value);
    if (this.manifestReferenceResult.palletQtyReal > -1) {
      this.manifestReferenceSource.palletQtyReal = this.palletQtyReal - this.manifestReferenceResult.palletQtyReal;
      this.getLdmForManifestReference(this.manifestReferenceResult);
    }
  }

  recalculateBoxQty() {
    this.manifestReferenceResult.boxQtyReal = Number.isNaN(parseInt(this.splitManifestReferenceForm.get('boxQty').value)) ? 0 : parseInt(this.splitManifestReferenceForm.get('boxQty').value);
    console.log(this.manifestReferenceResult.boxQtyReal);
    if (this.manifestReferenceResult.boxQtyReal > -1) {
      this.manifestReferenceSource.boxQtyReal = this.boxQty - this.manifestReferenceResult.boxQtyReal;
    }
  }

  recalculateWeight() {
    this.manifestReferenceResult.grossWeightReal = Number.isNaN(parseFloat(this.splitManifestReferenceForm.get('totalWeight').value.toString().replace(',', '.'))) ? 0
      : parseFloat(this.splitManifestReferenceForm.get('totalWeight').value.toString().replace(',', '.'));
    if (this.manifestReferenceResult.grossWeightReal > -1) {
      this.manifestReferenceSource.grossWeightReal = this.totalWeight - this.manifestReferenceResult.grossWeightReal;
      this.manifestReferenceSource.grossWeightReal = parseFloat(this.manifestReferenceSource.grossWeightReal.toFixed(3));
    }
  }

  recalculateRefQty() {
    this.manifestReferenceResult.qtyReal = Number.isNaN(parseFloat(this.splitManifestReferenceForm.get('refQty').value.toString().replace(',', '.'))) ? 0
      : parseFloat(this.splitManifestReferenceForm.get('refQty').value.toString().replace(',', '.'));
    if (this.manifestReferenceResult.qtyReal > -1) {
      this.manifestReferenceSource.qtyReal = this.refQty - this.manifestReferenceResult.qtyReal;
      this.manifestReferenceSource.qtyReal = parseFloat(this.manifestReferenceSource.qtyReal.toFixed(3));
      this.manifestReferenceResult.grossWeightReal = parseFloat((this.manifestReferenceResult.qtyReal * this.totalWeight / this.refQty).toFixed(3));
      this.splitManifestReferenceForm.get('totalWeight').setValue(this.numberFormat.transform(this.manifestReferenceResult.grossWeightReal));
      this.manifestReferenceSource.grossWeightReal = parseFloat((this.totalWeight - this.manifestReferenceResult.grossWeightReal).toFixed(3));
    }
  }
  /*********************\
   * END RECALCULATION *
   \*********************/

  /**
   * Static validator of the form. Has to validated form according to the next rules:
   * @param palletQty - has to be equal 0 or less than related value of Source manifestReference
   * @param refQty - has to be greater than 0 and less than related value of Source manifestReference
   * @param boxQty - has to be equal 0 or less than related value of Source manifestReference
   * @param totalWeight - has to be greater than 0 and less than related value of Source manifestReference
   */
  private static PalletBoxQtyValidator(palletQty: number, refQty: number, boxQty: number, totalWeight: number) {
    return (group: FormControl) => {
      if ((parseFloat(group.get('palletQty').value) >= palletQty) || (parseFloat(group.get('boxQty').value) >= boxQty) ||
        (parseFloat(group.get('totalWeight').value.toString().replace(',', '.')) >= totalWeight || parseFloat(group.get('totalWeight').value) <= 0) ||
        (parseFloat(group.get('refQty').value.toString().replace(',', '.')) >= refQty || parseFloat(group.get('refQty').value) <= 0)) {
        return {notValid: true}
      }
      return null;
    }
  }

  /**
   * Closes the modal popup without saving the results.
   */
  cancelButtonAction() {
    this.manifestReferenceSource.boxQtyReal = this.boxQty;
    this.manifestReferenceSource.qtyReal = this.refQty;
    this.manifestReferenceSource.palletQtyReal = this.palletQtyReal;
    this.manifestReferenceSource.grossWeightReal = this.totalWeight;
    this.activeModal.dismiss('cancel');
  }

  okButtonAction() {
    this.manifestReferenceResult.tpa = this.splitManifestReferenceForm.get('tpa').value;
    this.apiService.putSplitManifestReference(this.urlCode, this.tpa.tpaID, this.manifestReferenceSource.manifestReferenceId, this.manifestReferenceResult).subscribe(
      res => {
        this.activeModal.close(res);
      },
      error => {
        console.log(error.toString());
        console.log(`Error occurred while split Reference ${this.manifestReferenceSource.reference.number} in Manifest ${this.manifestReferenceSource.manifest.manifestCode}`);
      }
    );
  }
}
