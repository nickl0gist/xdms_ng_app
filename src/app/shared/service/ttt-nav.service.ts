import {Injectable} from '@angular/core';
import {Subject} from "rxjs";
import * as myGlobals from "../../global";
import {HttpBackend, HttpClient} from "@angular/common/http";
import {TttWarehouseManifestDTO} from "../../model/ttt/ttt-warehouse-manifest-dto";

@Injectable({
  providedIn: 'root'
})
export class TttNavService {
  warehouseUrlCode: string = '';
  currentDate: string = '';
  tttWarehouseManifestDTO: TttWarehouseManifestDTO;
  tttId: number;
  private httpWithoutInterceptor: HttpClient;

  constructor(private httpClient: HttpClient, private httpBackend: HttpBackend) {
    this.httpWithoutInterceptor = new HttpClient(httpBackend);
  }
}
