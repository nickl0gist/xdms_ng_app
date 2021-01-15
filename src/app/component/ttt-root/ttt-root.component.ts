import {Component, OnDestroy, OnInit} from '@angular/core';
import {ApiService} from "../../shared/service/api.service";
import {NavbarService} from "../../shared/service/navbar.service";
import {ActivatedRoute} from "@angular/router";
import {Subscription} from "rxjs";
import {Ttt} from "../../model/ttt/ttt";
import {Manifest} from "../../model/manifest/manifest";
import {WarehouseManifest} from "../../model/manifest/warehouse-manifest";
import {TttEnum} from "../../model/ttt/ttt-enum";
import {TttWarehouseManifestDTO} from "../../model/ttt/ttt-warehouse-manifest-dto";
import { CommonModule } from '@angular/common';
import {TttNavService} from "../../shared/service/ttt-nav.service";
import {LocalStorageService} from "ngx-webstorage";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {AddManifestComponent} from "../modal/add-manifest/add-manifest.component";
import {AddTruckComponent} from "../modal/add-truck/add-truck.component";
@Component({
  selector: 'app-ttt-root',
  templateUrl: './ttt-root.component.html',
  styleUrls: ['./ttt-root.component.css'],
})
export class TttRootComponent implements OnInit, OnDestroy{

  tttWarehouseManifestDTOSet: TttWarehouseManifestDTO[] = [];
  arrived: string = TttEnum.ARRIVED;
  private routeSub: Subscription;

  constructor(private apiService: ApiService, public nav: NavbarService, private route: ActivatedRoute,
              private tttNavService: TttNavService, private localStorage:LocalStorageService,
              private modal: NgbModal,) {
  }

  ngOnInit(): void {
    this.nav.show();
    this.routeSub = this.route.params.subscribe(params => {
      this.nav.warehouseUrlCode = params['url_code'];
      this.nav.currentDate = params['date'];
    });
    this.nav.currentDateChangeObs.subscribe((theDate) => {
      this.getTttWarehouseManifestsDtoSet(theDate);
      }
    );
    this.getTttWarehouseManifestsDtoSet(this.nav.currentDate);
  }

  ngOnDestroy(): void {
  }

  getPlannedQtyOfPalletsForTtt(manifestSet: Manifest[]) {
    let num = 0;
    if (manifestSet === undefined)
      return num;

    manifestSet.forEach(function (value) {
      num += value.palletQtyPlanned;
    });
    return num;
  }

  getPlannedTotalWeightTtt(manifestSet: Manifest[]) {
    let qty = 0;
    if (manifestSet === undefined)
      return qty;
    manifestSet.forEach(function (value) {
      qty += value.totalWeightPlanned;
    });
    return qty;
  }

  getRealTotalLdmTtt(manifestSet: Manifest[]): number {
    let ldm = 0;
    if (manifestSet === undefined)
      return ldm;
    manifestSet.forEach(function (value) {
      ldm += value.totalLdmPlanned;
    });
    return ldm;
  }

  getRealTotalWeightTtt(manifestSet: Manifest[]) {
    let weight = 0;
    if (manifestSet === undefined)
      return weight;
    manifestSet.forEach(function (value) {
      weight += value.totalWeightPlanned;
    });
    return weight;
  }
  getTttWarehouseManifestsDtoSet(date: string){
      this.apiService.getListWarehouseManifestForCertainWarehouseAndTtt(this.nav.warehouseUrlCode, date).subscribe(
        res => {
          this.tttWarehouseManifestDTOSet = res;
        },
        err => {
          console.log('Something went wrong while getting TttWarehouseManifestsSet!');
        }
      );
  }
  getRealQtyOfManifestsInTtt(warehouseManifestList: WarehouseManifest[]) : number{
    let counter = 0;
    if (warehouseManifestList === undefined) {
      return counter;
    }
    warehouseManifestList.forEach(function (warehouseManifest){
      if(warehouseManifest.palletQty !== undefined && warehouseManifest.boxQtyReal !== undefined && warehouseManifest.palletQty > 0 || warehouseManifest.boxQtyReal > 0){
        counter++;
      }
    });
    return counter;
  }

  /**
   * Return TRUE if Truck delayed
   * @param ttt
   */
  isDelayed(ttt: Ttt): boolean {
    let now = new Date();
    let arrival = new Date(ttt.tttArrivalDatePlan);
    return now > arrival && ttt.tttStatus.tttStatusName !== this.arrived;
  }

  getChosenTttId(tttWarehouseManifestDTO: TttWarehouseManifestDTO){
    this.tttNavService.tttWarehouseManifestDTO = tttWarehouseManifestDTO;
    this.localStorage.store('tttId', tttWarehouseManifestDTO.ttt.tttID);
    this.localStorage.store('date', this.nav.currentDate);
  }

  addTruckPopup() {
    const addTruckModal = this.modal.open(AddTruckComponent,
      {
        windowClass: 'addTruckClass',
      });
    addTruckModal.componentInstance.fromParent = {
      urlCode: this.nav.warehouseUrlCode
    };
    addTruckModal.result.then((result) => {
      this.getTttWarehouseManifestsDtoSet(this.nav.currentDate);
    }, reason => {
      console.log(`Error occurred while adding new manifest in Warehouse ${this.nav.warehouseUrlCode}`);
    })
  }
}
