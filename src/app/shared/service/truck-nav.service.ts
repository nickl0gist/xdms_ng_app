import {Injectable} from '@angular/core';
import {Subject} from "rxjs";
import * as myGlobals from "../../global";
import {HttpBackend, HttpClient} from "@angular/common/http";
import {TttWarehouseManifestDTO} from "../../model/ttt/ttt-warehouse-manifest-dto";
import {WarehouseManifest} from "../../model/manifest/warehouse-manifest";
import {Tpa} from "../../model/tpa/tpa";

@Injectable({
  providedIn: 'root'
})
export class TruckNavService {
  warehouseUrlCode: string = '';
  currentDate: string = '';
  tttWarehouseManifestDTO: TttWarehouseManifestDTO;
  tttId: number;
  warehouseManifest: WarehouseManifest;
  whManId: number;
  tpaId: number;
  tpa: Tpa;
  private httpWithoutInterceptor: HttpClient;

  constructor(private httpClient: HttpClient, private httpBackend: HttpBackend) {
    this.httpWithoutInterceptor = new HttpClient(httpBackend);
  }
}
