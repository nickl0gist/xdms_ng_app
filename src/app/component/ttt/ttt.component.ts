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
import {BrowserModule} from '@angular/platform-browser';
import {saveAs} from 'file-saver';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {NgbModal, NgbTooltip} from "@ng-bootstrap/ng-bootstrap";
import {AddReferenceComponent} from "../modal/add-reference/add-reference.component";
import {ManifestXdReceptionModalComponent} from "../modal/manifest-xd-reception-modal/manifest-xd-reception-modal.component";
import {NumberFormatPipe} from "../../shared/pipe/number-format.pipe";
import {TpaStatus} from "../../model/tpa/tpa-status";
import {AddManifestComponent} from "../modal/add-manifest/add-manifest.component";

@Component({
  selector: 'app-ttt',
  templateUrl: './ttt.component.html',
  styleUrls: ['./ttt.component.css'],
  providers: [NumberFormatPipe]
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
  closed = TpaStatus.CLOSED;

  uploadReceptionForm = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.minLength(3)]),
    file: new FormControl('', [Validators.required]),
    fileSource: new FormControl('', [Validators.required])
  });

  uploading = true;
  uploadingResult: boolean;

  constructor(private tttNavService: TttNavService, private apiService: ApiService, public nav: NavbarService,
              private route: ActivatedRoute, public localStorage: LocalStorageService, private modal: NgbModal,
              private numberFormat: NumberFormatPipe) {
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

  /**
   * Used to calculate readable DateTimeStamp of the moment when the Manifest has to be delivered to the next
   * warehouse?
   * @param warehouseManifest - WarehouseManifest entity.
   */
  getDeliveryDate(warehouseManifest: WarehouseManifest) {
    if(warehouseManifest.tpa != null){
      let dateOfDeparture = new Date(warehouseManifest.tpa.departurePlan);
      let transit = warehouseManifest.tpa.tpaDaysSetting.transitTime;
      let transitDays = transit.substring(1, transit.indexOf('D'));
      let transitHours = transit.substring(transit.indexOf('T') + 1, transit.indexOf('H'));
      let transitMinutes = transit.substring(transit.indexOf('H') + 1, transit.indexOf('M'));
      let dateOfDelivery = new Date(dateOfDeparture.getFullYear(), dateOfDeparture.getMonth(), dateOfDeparture.getDate() + (+transitDays),
        dateOfDeparture.getHours() + (+transitHours), dateOfDeparture.getMinutes() + (+transitMinutes));
      return dateOfDelivery.toLocaleDateString() + ' ' + dateOfDelivery.getHours() + ':' + dateOfDelivery.getMinutes();
    }
    return myGlobals.SYMBOL_NOT_ARRIVED;
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

  /**
   * Calculates conditional class for each row in template. If departure Date is planned for current day it will return
   * 'today" class. If Departure Date is less than current day and related TPA not closed 'wrong_qty' will be returned
   * @param warehouseManifest
   */
  getClassForRow(warehouseManifest: WarehouseManifest) {
    let tagClass = '';
    let currentDate = new Date();
    if(warehouseManifest.tpa != null){
      let departDate = new Date(warehouseManifest.tpa.departurePlan);
      if (currentDate.getDate() === departDate.getDate() && currentDate.getMonth() === departDate.getMonth() && currentDate.getFullYear() === departDate.getFullYear()) {
        tagClass = 'today';
      }
      if (departDate < currentDate && warehouseManifest.tpa.status.statusName !== this.closed.statusName) {
        tagClass = 'wrong_qty';
      }
    } else {
      tagClass = 'wrong_qty';
    }
    return tagClass;
  }

  /**
   * Calculates total amount of pallets and boxes for the TTT,
   */
  getTotalAmountOfPalletsAndBoxes() {
    let palletsQty = 0;
    let boxesQty = 0;
    this.tttWarehouseManifestDTO.warehouseManifestList.forEach(warehouseManifest => {
      palletsQty += warehouseManifest.palletQty;
      boxesQty += warehouseManifest.boxQtyReal;
    });
    return boxesQty > 0 ? palletsQty + 'p ' + boxesQty + 'b' : palletsQty + 'p';
  }

  /**
   * Calculates Total Gross weight of the TTT by adding the total real weight of each manifest. If real weight not provided
   * the planned weight will be taken.
   */
  getTotalWeight() {
    let totalWeightReal = 0;
    let totalWeightPlan = 0;
    this.tttWarehouseManifestDTO.warehouseManifestList.forEach(warehouseManifest => {
      totalWeightReal += warehouseManifest.grossWeight;
      totalWeightPlan += warehouseManifest.manifest.totalWeightPlanned;
    });
    return totalWeightReal > 0 ? this.numberFormat.transform(totalWeightReal) + ' t' : this.numberFormat.transform(totalWeightPlan) + ' t';
  }

  /**
   * Keeps actual 'manifestId' and 'customerId' where the manifest goes to in LocalStorage.
   * @param warehouseManifest
   */
  getChosenWarehouseManifestId(warehouseManifest: WarehouseManifest) {
    this.tttNavService.warehouseManifest = warehouseManifest;
    this.localStorage.store('manifestId', warehouseManifest.manifest.manifestID);
    this.localStorage.store('customerId', warehouseManifest.manifest.customer.customerID);
  }

  /**
   * Called when user tries to get file with information for reception
   */
  getExcelReceptionFile() {
    this.apiService.getExcelWithManifestReferencesForReception(this.nav.warehouseUrlCode, this.tttWarehouseManifestDTO.ttt.tttID).subscribe(
      res => {
        const blob = new Blob([res], {type: 'application/vnd.ms-excel'});
        const file = new File([blob], `reception-${Date.now()}.xlsx`, {type: 'application/vnd.ms.excel'});
        saveAs(file);
      },
      error => {
        console.log(`Error occurred while getting Excel file with reception information Warehouse: ${this.nav.warehouseUrlCode} TTT id:${this.tttWarehouseManifestDTO.ttt.tttID}`);
      }
    )
  }

  // get f() {
  //   return this.uploadReceptionForm.controls;
  // }

  /**
   * Serves for uploading Excel reception file back to server
   * @param event
   */
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
        res => {
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

  /**
   * Shows popup form for reception of the manifest.
   * @param warehouseManifest
   */
  onReceiptManifestClick(warehouseManifest: WarehouseManifest) {
    const manifestReceptionModal = this.modal.open(ManifestXdReceptionModalComponent,
      {
        windowClass: 'myCustomModalClass',
      });
    manifestReceptionModal.componentInstance.fromParent = {
      warehouseManifest: warehouseManifest,
      ttt: this.tttWarehouseManifestDTO.ttt,
      urlCode: this.nav.warehouseUrlCode
    };
    manifestReceptionModal.result.then((result) => {
      console.log(result);
      this.tttWarehouseManifestDTO = result;
    });
  }

  onAddManifestClick() {
    const addManifestModal = this.modal.open(AddManifestComponent,
      {
        windowClass: 'addManifestClass',
      });
    addManifestModal.componentInstance.fromParent = {
      ttt: this.tttWarehouseManifestDTO.ttt,
      urlCode: this.nav.warehouseUrlCode
    };
    addManifestModal.result.then((result) => {
        this.getTttWarehouseManifestDtoByWarehouseUrlAndTttId(this.tttId);
    }, reason => {
      console.log(`Error occurred while adding new manifest in TTT ${this.tttWarehouseManifestDTO.ttt.truckName}`);
    })
  }
}
