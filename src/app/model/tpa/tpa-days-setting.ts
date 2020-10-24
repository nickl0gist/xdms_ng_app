import {WorkingDay} from "./working-day";
import {WhCustomer} from "./wh-customer";

export interface TpaDaysSetting {
  id: number
  workingDay: WorkingDay
  whCustomer: WhCustomer
  localTime: string
  transitTime: string
}
