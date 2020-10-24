enum TpaEnum {
  CLOSED = "CLOSED",
  DELAYED = "DELAYED",
  IN_PROGRESS = "IN_PROGRESS",
  BUFFER = "BUFFER",
  ERROR = "ERROR"
}

export interface TpaStatus {
  statusID: number
  statusName: TpaEnum
}
