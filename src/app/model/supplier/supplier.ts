import {Reference} from "../reference/reference";

export interface Supplier {
  supplierID: number;
  name: string;
  vendorCode: string;
  postCode: string;
  country: string;
  city: string;
  street: string;
  email: string;
  isActive: boolean;
  referenceSet: Reference[];
}
