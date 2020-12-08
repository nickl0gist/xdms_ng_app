import {Injectable} from '@angular/core';
import {HttpBackend, HttpClient, HttpHeaders} from "@angular/common/http";
import {Observable} from "rxjs";
import {Warehouse} from "../../model/warehouse/warehouse";
import * as myGlobals from "../../global";
import {Ttt} from "../../model/ttt/ttt";
import {Tpa} from "../../model/tpa/tpa";
import {WarehouseManifest} from "../../model/manifest/warehouse-manifest";
import {TttWarehouseManifestDTO} from "../../model/ttt/ttt-warehouse-manifest-dto";
import {Reference} from "../../model/reference/reference";
import {ManifestReference} from "../../model/manifest/manifest-reference";
import {Manifest} from "../../model/manifest/manifest";
import {Supplier} from "../../model/supplier/supplier";
import {Customer} from "../../model/customer/customer";

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private ACTIVE_WAREHOUSES_URL = myGlobals.domain + '/warehouse/';
  private COORDINATOR_REFERENCE_URL = myGlobals.domain + '/coordinator/references';
  private COORDINATOR_SUPPLIERS = myGlobals.domain + '/coordinator/suppliers';
  private COORDINATOR_CUSTOMERS = myGlobals.domain + '/coordinator/customers';
  private httpWithoutInterceptor: HttpClient;

  constructor(private httpClient: HttpClient, private httpBackend: HttpBackend) {
    this.httpWithoutInterceptor = new HttpClient(httpBackend);
  }

  getActiveWarehouse(): Observable<Warehouse[]> {
    return this.httpClient.get<Warehouse[]>(this.ACTIVE_WAREHOUSES_URL);
  }

  getTttListByWarehouseAndDate(urlCode: string, date: string): Observable<Ttt[]> {
    return this.httpClient.get<Ttt[]>(this.ACTIVE_WAREHOUSES_URL + urlCode + '/ttt/' + date);
  }

  getTpaListByWarehouseAndDate(urlCode: string, date: string): Observable<Tpa[]> {
    return this.httpClient.get<Tpa[]>(this.ACTIVE_WAREHOUSES_URL + urlCode + '/tpa/' + date,);
  }

  getTpaListWithStatusDelayed(urlCode: string): Observable<Tpa[]> {
    return this.httpClient.get<Tpa[]>(this.ACTIVE_WAREHOUSES_URL + urlCode + '/tpa/delayed');
  }

  getListWarehouseManifestForCertainWarehouseAndTtt(urlCode: string, date: string): Observable<TttWarehouseManifestDTO[]> {
    return this.httpWithoutInterceptor.get<TttWarehouseManifestDTO[]>(this.ACTIVE_WAREHOUSES_URL + urlCode + '/ttt/full/' + date);
  }

  getTttWarehouseManifestDtoByWarehouseAndTtt(urlCode: string, tttId: number): Observable<TttWarehouseManifestDTO> {
    return this.httpWithoutInterceptor.get<TttWarehouseManifestDTO>(this.ACTIVE_WAREHOUSES_URL + urlCode + '/ttt/' + tttId);
  }

  getWarehouseManifestByWarehouseUrlAndTttIdAndManifestId(urlCode: any, tttId: number, manifestId: number) {
    return this.httpClient.get<WarehouseManifest>(this.ACTIVE_WAREHOUSES_URL + urlCode + '/ttt/' + tttId + '/manifest/' + manifestId, {headers: {'truck': 'ttt'}});
  }

  getListOfTpaNotClosedForCustomer(urlCode: string, customerID: number) {
    return this.httpWithoutInterceptor.get<Tpa[]>(this.ACTIVE_WAREHOUSES_URL + urlCode + '/tpa/customer/' + customerID);
  }

  getReferenceListByCustomerAndSupplier(supplierId: number, customerId: number) {
    return this.httpWithoutInterceptor.get<Reference[]>(this.COORDINATOR_REFERENCE_URL + '/supplier/' + supplierId +'/customer/' + customerId);
  }

  putAdditionalReferenceToManifest(urlCode: string, tttId: number, manifestId: number, manifestReference: ManifestReference){
    return this.httpWithoutInterceptor.put<Manifest>(this.ACTIVE_WAREHOUSES_URL + urlCode + '/ttt/' + tttId + '/manifest/' + manifestId + '/addReference', manifestReference);
  }

  putManifestReferenceListAfterReception(urlCode: string, manifestReferenceList: ManifestReference[]){
    return this.httpWithoutInterceptor.put<ManifestReference[]>(this.ACTIVE_WAREHOUSES_URL + urlCode + '/man_ref/reception', manifestReferenceList);
  }

  putWarehouseManifestUpdate(urlCode: string, tttId: number, warehouseManifestUpdated: WarehouseManifest){
    return this.httpWithoutInterceptor.put<WarehouseManifest>(`${this.ACTIVE_WAREHOUSES_URL}${urlCode}/ttt/${tttId}/manifest/update`, warehouseManifestUpdated);
  }

  getActiveCustomers() {
    return this.httpWithoutInterceptor.get<Customer[]>(`${this.COORDINATOR_CUSTOMERS}/active`);
  }

  getActiveSuppliers() {
    return this.httpWithoutInterceptor.get<Supplier[]>(`${this.COORDINATOR_SUPPLIERS}/active`);
  }

  addManifestToCurrentTttAndWarehouse(urlCode: string, ttt: Ttt, manifest: Manifest) {
    return this.httpWithoutInterceptor.post<Manifest>(`${this.ACTIVE_WAREHOUSES_URL}${urlCode}/ttt/${ttt.tttID}`, manifest);
  }

  putUpdateTruckTimeTable(urlCode: string, ttt: Ttt){
    return this.httpWithoutInterceptor.put<Ttt>(`${this.ACTIVE_WAREHOUSES_URL}${urlCode}/ttt/update`, ttt);
  }

  getTttByWarehouseAndTttId(urlCode: string, tttID: number) {
    return this.httpWithoutInterceptor.get<Ttt>(`${this.ACTIVE_WAREHOUSES_URL}${urlCode}/ttt/${tttID}`);
  }

   /*******************\
    * EXCEL ENDPOINTS *
   \*******************/
  getExcelWithManifestReferencesForReception(urlCode: string, tttId: number){
     return this.httpWithoutInterceptor.get<any>(`${this.ACTIVE_WAREHOUSES_URL}${urlCode}/ttt/${tttId}/reception.xlsx`,  { responseType: 'arraybuffer' as 'json' });
   }

  postExcelWithManifestReferencesForReception(urlCode: string, tttId: number, formData: FormData){
    return this.httpWithoutInterceptor.post<any>(`${this.ACTIVE_WAREHOUSES_URL}${urlCode}/ttt/${tttId}/uploadFile`,  formData, {});
  }
}
