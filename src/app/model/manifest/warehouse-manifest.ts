import {Ttt} from "../ttt/ttt";
import {Manifest} from "./manifest";
import {Warehouse} from "../warehouse/warehouse";
import {Tpa} from "../tpa/tpa";
import {WarehouseManifestId} from "./warehouse-manifest-id";

export interface WarehouseManifest {
  warehouseManifestId: WarehouseManifestId;
  warehouse: Warehouse;
  manifest: Manifest;
  ttt: Ttt;
  tpa: Tpa;
  palletQty: number;
  boxQtyReal: number;
  grossWeight: number;
  netWeightReal: number;
  palletHeight: number;
  palletWidth: number;
  palletLength: number;
  kpiLabel: boolean;
  kpiDocument: boolean;
  kpiManifest: boolean;
}
