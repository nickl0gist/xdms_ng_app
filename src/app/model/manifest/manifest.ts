import {Ttt} from "../ttt/ttt";
import {Tpa} from "../tpa/tpa";
import {Customer} from "../customer/customer";
import {Supplier} from "../supplier/supplier";
import {ManifestReference} from "./manifest-reference";

export interface Manifest {
  manifestID: number;
  manifestCode: string;
  palletQtyPlanned: number;
  boxQtyPlanned: number;
  totalWeightPlanned: number;
  totalLdmPlanned: number;
  palletQtyReal: number;
  boxQtyReal: number;
  totalWeightReal: number;
  totalLdmReal: number;
  customer: Customer;
  supplier: Supplier;
  manifestsReferenceSet: ManifestReference[];
  truckTimeTableSet: Ttt[];
  tpaSet: Tpa[];
}
