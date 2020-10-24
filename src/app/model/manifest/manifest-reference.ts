import {Manifest} from "./manifest";
import {Reference} from "../reference/reference";
import {Tpa} from "../tpa/tpa";

export interface ManifestReference {
  manifestReferenceId: number;
  qtyPlanned: number;
  qtyReal: number;
  palletQtyPlanned: number;
  palletQtyReal: number;
  boxQtyPlanned: number;
  boxQtyReal: number;
  grossWeightPlanned: number;
  grossWeightReal: number;
  palletHeight: number;
  palletLength: number;
  palletWidth: number;
  palletWeight: number;
  netWeight: number;
  palletId: string;
  stackability: number;
  receptionNumber: string;
  deliveryNumber: string;
  manifest: Manifest;
  reference: Reference;
  tpa: Tpa;
}
