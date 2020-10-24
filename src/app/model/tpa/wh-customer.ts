import {Customer} from "../customer/customer";
import {Warehouse} from "../warehouse/warehouse";

export interface WhCustomer {
  whCustomerID: number
  customer: Customer
  warehouse: Warehouse
  isActive: boolean
  transitTime: string
}
