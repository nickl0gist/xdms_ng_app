import {Ttt} from "./ttt";
import {WarehouseManifest} from "../manifest/warehouse-manifest";

export interface TttWarehouseManifestDTO {
  ttt: Ttt,
  warehouseManifestList: WarehouseManifest[];
}
