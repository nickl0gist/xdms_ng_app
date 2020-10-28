import {Injectable} from '@angular/core';
import {HttpBackend, HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {Warehouse} from "../../model/warehouse/warehouse";
import * as myGlobals from "../../global";
import {Ttt} from "../../model/ttt/ttt";
import {Tpa} from "../../model/tpa/tpa";
import {WarehouseManifest} from "../../model/manifest/warehouse-manifest";
import {TttWarehouseManifestDTO} from "../../model/ttt/ttt-warehouse-manifest-dto";

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private ACTIVE_WAREHOUSES_URL = myGlobals.domain + '/warehouse';
  private httpWithoutInterceptor: HttpClient;

  constructor(private httpClient: HttpClient, private httpBackend: HttpBackend) {
    this.httpWithoutInterceptor = new HttpClient(httpBackend);
  }

  getActiveWarehouse(): Observable<Warehouse[]> {
    return this.httpClient.get<Warehouse[]>(this.ACTIVE_WAREHOUSES_URL);
  }

  getTttListByWarehouseAndDate(urlCode: string, date: string): Observable<Ttt[]> {
    return this.httpClient.get<Ttt[]>(this.ACTIVE_WAREHOUSES_URL + '/' + urlCode + '/ttt/' + date);
  }

  getTpaListByWarehouseAndDate(urlCode: string, date: string): Observable<Tpa[]> {
    return this.httpClient.get<Tpa[]>(this.ACTIVE_WAREHOUSES_URL + '/' + urlCode + '/tpa/' + date);
  }

  getTpaListWithStatusDelayed(urlCode: string): Observable<Tpa[]> {
    return this.httpClient.get<Tpa[]>(this.ACTIVE_WAREHOUSES_URL + '/' + urlCode + '/tpa/delayed');
  }

  getListWarehouseManifestForCertainWarehouseAndTtt(urlCode: string, date: string): Observable<TttWarehouseManifestDTO[]> {
    return this.httpWithoutInterceptor.get<TttWarehouseManifestDTO[]>(this.ACTIVE_WAREHOUSES_URL + '/' + urlCode + '/ttt/full/' + date);
  }
}