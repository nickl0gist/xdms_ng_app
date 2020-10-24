import {Customer} from "../customer/customer";
import {Supplier} from "../supplier/supplier";
import {StorageLocation} from "../storage-location/storage-location";

export interface Reference {
  referenceID: number;
  ref_number: string;
  name: string;
  hsCode: string;
  weight: number;
  weightOfPackaging: number;
  stackability: number;
  pcsPerPU: number;
  puPerHU: number;
  palletWeight:number;
  palletHeight:number;
  palletLength:number;
  palletWidth:number;
  isActive: boolean;
  designationEN: string;
  designationDE: string;
  designationRU:string;
  supplierAgreement: string;
  customerAgreement: string;
  customer: Customer;
  supplier: Supplier;
  storageLocation: StorageLocation;
}
