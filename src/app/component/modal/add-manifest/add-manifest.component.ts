import {Component, Input, OnInit} from '@angular/core';
import {Ttt} from "../../../model/ttt/ttt";
import {NgbActiveModal} from "@ng-bootstrap/ng-bootstrap";
import {ApiService} from "../../../shared/service/api.service";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {Supplier} from "../../../model/supplier/supplier";
import {Customer} from "../../../model/customer/customer";
import {Manifest} from "../../../model/manifest/manifest";
import {Tpa} from "../../../model/tpa/tpa";
import {ManifestReference} from "../../../model/manifest/manifest-reference";
import * as myGlobals from "../../../global";

@Component({
  selector: 'app-add-manifest',
  templateUrl: './add-manifest.component.html',
  styleUrls: ['./add-manifest.component.css']
})
export class AddManifestComponent implements OnInit {
  @Input() fromParent;

  ttt: Ttt;
  supplierList: Supplier[];
  customerList: Customer[];
  manifest: Manifest;
  tpaList: Tpa[];

  private MANUALLY_ADDED_POSTFIX = myGlobals.MANUALLY_ADDED_POSTFIX;
  private urlCode: string;

  addManifestForm: FormGroup;

  constructor(public activeModal: NgbActiveModal, private apiService: ApiService,
              private fb: FormBuilder) {
  }

  ngOnInit(): void {
    this.ttt = this.fromParent.ttt;
    this.urlCode = this.fromParent.urlCode;
    this.obtainCustomerAndSupplierLists();
    this.obtainListOfNotClosedTpa();
    this.createForm();
  }

  private createForm() {
    this.addManifestForm = this.fb.group({
      manifestCode: ['', Validators.compose([Validators.required, Validators.pattern('^[a-zA-z0-9\\-]*$')])],
      supplier: [null, Validators.compose([Validators.required])],
      customer: [null, Validators.compose([Validators.required])],
      palletQty: ['', Validators.compose([Validators.required, Validators.pattern('^\\d{1,3}$')])],
      totalLdm: ['', Validators.compose([Validators.required, Validators.pattern('^[0-9]?\\d{0,9},?\\d{1,3}$')])],
      totalWeight: ['', Validators.compose([Validators.required, Validators.pattern('^[0-9]?\\d{0,9},?\\d{1,3}$')])],
      tpa: [null, Validators.compose([Validators.required])]
    });
  }

  private obtainCustomerAndSupplierLists() {
    this.apiService.getActiveSuppliers().subscribe(
      res => {
        this.supplierList = res;
      },
      error => {
        console.log('Error occurred while getting list of Active suppliers.');
      });

    this.apiService.getActiveCustomers().subscribe(
      res => {
        this.customerList = res;
      },
      error => {
        console.log('Error occurred while getting list of Active customers.');
      }
    )
  }

  saveAction() {
    this.manifest = new Manifest ();
    this.manifest.manifestCode = this.addManifestForm.get('manifestCode').value + this.MANUALLY_ADDED_POSTFIX;
    this.manifest.supplier = this.addManifestForm.get('supplier').value;
    this.manifest.customer = this.addManifestForm.get('customer').value;
    this.manifest.palletQtyPlanned = parseInt(this.addManifestForm.get('palletQty').value);
    this.manifest.totalLdmPlanned = parseFloat(this.addManifestForm.get('totalLdm').value.toString().replace('.', '').replace(',', '.'));
    this.manifest.totalWeightPlanned = parseFloat(this.addManifestForm.get('totalWeight').value.toString().replace('.', '').replace(',', '.'));
    this.manifest.tpaSet = [];
    this.manifest.tpaSet.push(this.addManifestForm.get('tpa').value);
    this.saveManifest();
  }

  saveManifest(){
    this.apiService.addManifestToCurrentTttAndWarehouse(this.urlCode, this.ttt, this.manifest).subscribe(
      res => {
        this.activeModal.close();
      },
      error => {
        //this.activeModal.close(false);
        console.log(`Error occurred while adding new manifest ${this.manifest.manifestCode} in TTT ${this.ttt.truckName} for Warehouse ${this.urlCode}. Error: ${error}`);
      }
    );
  }

  cancelButtonAction() {
    this.activeModal.dismiss();
  }

  private obtainListOfNotClosedTpa() {
    this.apiService.getListOfTpaNotClosedForWarehouse(this.urlCode).subscribe(
      res =>{
        this.tpaList = res;
      },
      error => {
        console.log(`Error occurred while getting List of not closed TPA for Warehouse ${this.urlCode}. Error: ${error}`);
      }
    )
  }
}
