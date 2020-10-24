import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {Warehouse} from "../../model/warehouse/warehouse";
import * as myGlobals from "../../global";
import {Ttt} from "../../model/ttt/ttt";
import {Tpa} from "../../model/tpa/tpa";

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private ACTIVE_WAREHOUSES_URL = myGlobals.domain + '/warehouse';

  constructor(private http: HttpClient) {}

  getActiveWarehouse() : Observable<Warehouse[]> {
    return this.http.get<Warehouse[]>(this.ACTIVE_WAREHOUSES_URL);
  }

  getTttListByWarehouseAndDate(urlCode: string, date: string) : Observable<Ttt[]>{
    return this.http.get<Ttt[]>(this.ACTIVE_WAREHOUSES_URL + '/' + urlCode + '/ttt/' + date);
  }

  getTpaListByWarehouseAndDate(urlCode: string, date: string) : Observable<Tpa[]>{
    return this.http.get<Tpa[]>(this.ACTIVE_WAREHOUSES_URL + '/' + urlCode + '/tpa/' + date);
  }

  getTpaListWithStatusDelayed(urlCode: string) :Observable<Tpa[]>{
    return this.http.get<Tpa[]>(this.ACTIVE_WAREHOUSES_URL + '/' + urlCode + '/tpa/delayed');
  }
}
