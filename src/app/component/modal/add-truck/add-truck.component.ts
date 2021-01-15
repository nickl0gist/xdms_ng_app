import {Component, Input, OnInit} from '@angular/core';
import {NgbActiveModal} from "@ng-bootstrap/ng-bootstrap";
import {ApiService} from "../../../shared/service/api.service";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {Warehouse} from "../../../model/warehouse/warehouse";
import {Ttt} from "../../../model/ttt/ttt";
import {DatePipe} from "@angular/common";

@Component({
  selector: 'app-add-truck',
  templateUrl: './add-truck.component.html',
  styleUrls: ['./add-truck.component.css'],
  providers: [DatePipe]
})
export class AddTruckComponent implements OnInit {

  @Input() fromParent;

  public warehouseList: Warehouse[];
  private urlCode: string;
  public newTtt: Ttt;
  addTruckForm: FormGroup;
  dateMinimum: string;
  dateMaximum: string;

  constructor(public activeModal: NgbActiveModal, private apiService: ApiService,
              private fb: FormBuilder, public datepipe: DatePipe) { }

  ngOnInit(): void {
    this.urlCode = this.fromParent.urlCode;
    this.dateMinimum = this.datepipe.transform(new Date(Date.now() - 5 * 1000 * 60), 'yyyy-MM-ddTHH:mm');
    this.dateMaximum = this.datepipe.transform(new Date(Date.now() + 28 * 24 * 60 * 1000 * 60), 'yyyy-MM-ddTHH:mm');
    this.getListOfWarehouses();
    this.createForm();
  }

  private createForm() {
    this.addTruckForm = this.fb.group({
      tttName: ['', Validators.compose([Validators.required, Validators.pattern('^[a-zA-z0-9\\-]*.{5,}$')])],
      arrivalDatePlan: ['', Validators.compose([Validators.required])],
      dispatchedFrom: ['', Validators.compose([Validators.required, Validators.pattern('^[a-zA-z0-9\\- ]*$')])],
    });
  }

  cancelButtonAction() {
    this.activeModal.dismiss();
  }

  saveAction() {
    this.newTtt = new Ttt();
    this.newTtt.truckName = this.addTruckForm.get('tttName').value;
    this.newTtt.tttArrivalDatePlan = this.addTruckForm.get('arrivalDatePlan').value;
    this.newTtt.dispatchedFrom = this.addTruckForm.get('dispatchedFrom').value;
    this.newTtt.warehouse = this.warehouseList.find(w => {return w.urlCode === this.urlCode});
    this.saveTtt();
  }

  private getListOfWarehouses() {
    this.apiService.getActiveWarehouse().subscribe(
      res => {
        this.warehouseList = res;
      },
      error => {
        console.log(`Error occurred while getting List of active Warehouses`)
      }
    )
  }

  private saveTtt() {
    this.apiService.addNewTttForWarehouseManually(this.urlCode, this.newTtt).subscribe(
      res => {
        this.activeModal.close();
      },
      error => {
        console.log(`Error occurred while adding new TTT ${this.newTtt.truckName} in Warehouse ${this.newTtt}. Error: ${error}`);
      }
    );
  }
}
