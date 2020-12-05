import {TttEnum} from "./ttt-enum";

export class TttStatus {
  static PENDING = new TttStatus(1, TttEnum.PENDING);
  static DELAYED = new TttStatus(2, TttEnum.DELAYED);
  static ARRIVED = new TttStatus(3, TttEnum.ARRIVED);
  static ERROR = new TttStatus(4, TttEnum.ERROR);

  readonly tttStatusID: number;
  readonly tttStatusName: TttEnum;

  private constructor(tttStatusID: number, tttStatusName: TttEnum) {
    this.tttStatusID = tttStatusID;
    this.tttStatusName = tttStatusName;
  }
}
