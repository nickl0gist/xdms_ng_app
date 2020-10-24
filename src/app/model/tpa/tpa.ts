import {Manifest} from "../manifest/manifest";
import {TpaStatus} from "./tpa-status";
import {TpaDaysSetting} from "./tpa-days-setting";
import {ManifestReference} from "../manifest/manifest-reference";

export interface Tpa {
  tpaID: number;
  name: string;
  departurePlan: string;
  departureReal: string;
  status: TpaStatus;
  tpaDaysSetting: TpaDaysSetting;
  manifestReferenceSet: ManifestReference[];
  manifestSet: Manifest[];
}
