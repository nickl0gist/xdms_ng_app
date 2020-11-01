import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {TttNavService} from "../../shared/service/ttt-nav.service";
import {TttWarehouseManifestDTO} from "../../model/ttt/ttt-warehouse-manifest-dto";
import {ApiService} from "../../shared/service/api.service";
import {NavbarService} from "../../shared/service/navbar.service";
import {ActivatedRoute} from "@angular/router";
import {Subscription} from "rxjs";
import {LocalStorageService} from "ngx-webstorage";
import {TttEnum} from "../../model/ttt/ttt-enum";

@Component({
  selector: 'app-ttt',
  templateUrl: './ttt.component.html',
  styleUrls: ['./ttt.component.css']
})
export class TttComponent implements OnInit {
  tttId: number;
  tttWarehouseManifestDTO: TttWarehouseManifestDTO;
  private routeSub: Subscription;
  arrived: string = TttEnum.ARRIVED;;

  constructor(private tttNavService: TttNavService, private apiService: ApiService, public nav: NavbarService, private route: ActivatedRoute, private localStorage:LocalStorageService) { }

  ngOnInit(): void {
    this.nav.show();
    this.tttWarehouseManifestDTO = this.tttNavService.tttWarehouseManifestDTO;
    this.routeSub = this.route.params.subscribe(params => {
      this.nav.warehouseUrlCode = params['url_code'];
      this.nav.currentDate = params['date'];
    });
    if(this.tttWarehouseManifestDTO === undefined){
      this.getTttWarehouseManifestDtoByWarehouseUrlAndTttId(this.localStorage.retrieve('tttId'));
    }
    this.nav.currentDateChangeObs.subscribe((theDate) => {

      }
    );
  }

  getTttWarehouseManifestDtoByWarehouseUrlAndTttId(tttId: number){
    console.log('We are in method getTttWarehouseManifestDtoByWarehouseUrlAndTttId ' + tttId);
    this.apiService.getTttWarehouseManifestDtoByWarehouseAndTtt(this.nav.warehouseUrlCode, tttId).subscribe(
      res => {
        console.log('getTttWarehouseManifestDtoByWarehouseUrlAndTttId ' + tttId);
        this.tttWarehouseManifestDTO = res;
      },
      err =>{
        console.log('The error occurred while receiving TttWarehouseManifestDto');
      }
    )
  }
}
