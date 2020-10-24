import {Warehouse} from "../warehouse/warehouse";
import {TttStatus} from "./ttt-status";
import {Manifest} from "../manifest/manifest";

export interface Ttt {
  tttID:number;
  truckName:string;
  tttArrivalDatePlan:string;
  tttArrivalDateReal:string;
  tttStatus: TttStatus;
  warehouse: Warehouse;
  isActive: boolean;
  manifestSet: Manifest[];
}
