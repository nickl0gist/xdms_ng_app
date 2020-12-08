import {Component, OnInit, Output, EventEmitter, Input} from '@angular/core';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {ManifestReference} from "../../../model/manifest/manifest-reference";
import {Reference} from "../../../model/reference/reference";
import {getRtlScrollAxisType} from "@angular/cdk/platform";
import {ApiService} from "../../../shared/service/api.service";
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";

@Component({
  selector: 'app-add-reference',
  templateUrl: './add-reference.component.html',
  styleUrls: ['./add-reference.component.css']
})
export class AddReferenceComponent implements OnInit {

  referenceToAdd: Reference;
  palletQty: number;
  boxQty: number;
  pcsQty: number;

  referenceList: Reference[];
  @Input() fromParent;
  customerId: number;
  supplierId: number;
  referenceSelectionForm: FormGroup;

  @Output() public getUserData: EventEmitter<ManifestReference> = new EventEmitter();

  constructor(public activeModal: NgbActiveModal, private apiService: ApiService, private fb: FormBuilder) {
    this.createForm();
  }

  ngOnInit(): void {
    this.customerId = this.fromParent.customerId;
    this.supplierId = this.fromParent.supplierId;
    this.getReferenceListByCustomerAndSupplier();
  }

  okButtonAction() {
    this.palletQty = parseInt(this.referenceSelectionForm.get('palletQty').value);
    this.boxQty = parseInt(this.referenceSelectionForm.get('boxQty').value);
    this.pcsQty = parseFloat(this.referenceSelectionForm.get('pcsQty').value.replace(',', '.'));
    this.activeModal.close([this.referenceToAdd, this.palletQty, this.boxQty, this.pcsQty]);
  }

  cancelButtonAction() {
    this.activeModal.dismiss('cancel');
  }

  getReferenceListByCustomerAndSupplier() {
    this.apiService.getReferenceListByCustomerAndSupplier(this.supplierId, this.customerId).subscribe(
      res => {
        this.referenceList = res;
        this.referenceToAdd = this.referenceList[0];
      },
      error => {
        console.log(error.toString());
        console.log(`Error occurred while getting List of references for Customer with ID: ${this.customerId} and Supplier with ID: ${this.supplierId}`);
      }
    );
  }

  setPickedRef(reference: Reference) {
    this.referenceToAdd = reference;
  }

  private createForm() {
    this.referenceSelectionForm = this.fb.group({
      reference: [null, Validators.required],
      palletQty: ['', Validators.pattern('^[1-9]\\d{0,2}')],
      boxQty: ['', Validators.compose([
        Validators.required,
        Validators.pattern('^[1-9]\\d{0,3}')
      ])],
      pcsQty: ['', Validators.compose([
        Validators.required,
        Validators.pattern('^[0-9]?\\d{0,9},?\\d{1,3}$')
      ])]
    });
  }
}
