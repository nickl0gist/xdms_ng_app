import {WhType} from "./wh-type";

export interface Warehouse {
  warehouseID: number;
  name: string;
  postCode: string;
  country: string;
  city: string;
  street: string;
  email: string;
  isActive: boolean;
  whType: WhType;
  urlCode: string;
  timeZone: string;
}
