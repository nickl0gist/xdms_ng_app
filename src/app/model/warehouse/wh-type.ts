enum WhTypeEnum {
  CC = 'CC',
  XD = 'XD',
  TXD = 'TXD'
}

export class WhType {

  static CC = new WhType(1, WhTypeEnum.CC);
  static XD = new WhType(2, WhTypeEnum.XD);
  static TXD = new WhType(3, WhTypeEnum.TXD);

  readonly whTypeID: number;
  readonly type: WhTypeEnum;

  private constructor(whTypeId: number, whTypeName: WhTypeEnum) {
    this.whTypeID = whTypeId;
    this.type = whTypeName;
  }

}
