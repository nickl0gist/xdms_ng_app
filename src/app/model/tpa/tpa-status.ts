enum TpaEnum {
  CLOSED = "CLOSED",
  DELAYED = "DELAYED",
  IN_PROGRESS = "IN_PROGRESS",
  BUFFER = "BUFFER",
  ERROR = "ERROR"
}

export class TpaStatus {
  static CLOSED = new TpaStatus(1, TpaEnum.CLOSED);
  static DELAYED = new TpaStatus(2, TpaEnum.DELAYED);
  static IN_PROGRESS = new TpaStatus(3, TpaEnum.IN_PROGRESS);
  static BUFFER = new TpaStatus(4, TpaEnum.BUFFER);
  static ERROR = new TpaStatus(5, TpaEnum.ERROR);

  readonly statusID: number;
  readonly statusName: TpaEnum;


  private constructor(statusID: number, statusName: TpaEnum) {
    this.statusID = statusID;
    this.statusName = statusName;
  }

}
