import {Reference} from "../reference/reference";

export interface Customer {
  customerID: number;
  name: string;
  customerCode: string;
  postCode: string;
  country: string;
  city: string;
  street: string;
  email: string;
  isActive: boolean;
  referenceSet: Reference[];
  timeZone: string;
}
