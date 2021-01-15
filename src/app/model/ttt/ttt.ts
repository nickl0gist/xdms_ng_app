import {Warehouse} from "../warehouse/warehouse";
import {TttStatus} from "./ttt-status";
import {Manifest} from "../manifest/manifest";
import {WarehouseManifest} from "../manifest/warehouse-manifest";

export class Ttt {
  tttID:number;
  truckName:string;
  dispatchedFrom: string;
  tttArrivalDatePlan:string;
  tttArrivalDateReal:string;
  tttStatus: TttStatus;
  warehouse: Warehouse;
  isActive: boolean;
  manifestSet: Manifest[];
  warehouseManifestSet: WarehouseManifest[];

  constructor() {
  }
}
