enum TruckTypeEnum {
  JUMBO = "Jumbo",
  STANDART24 = "Standart 24t",
  STANDART20 = "Standart 20t",
  STANDART12 = "Standart 12t",
  AUTO1_5 = "AUTO 1,5t",
  AUTO3_5 = "AUTO 3,5t",
  AUTO5_5 = "AUTO 5.5t"
}

export class TruckType {

  static JUMBO = new TruckType(TruckTypeEnum.JUMBO, 24000, 13.6, 2.45, 96);
  static STANDART24 = new TruckType(TruckTypeEnum.STANDART24, 24000, 13.6, 2.45, 86);
  static STANDART20 = new TruckType(TruckTypeEnum.STANDART20, 20000, 13.6, 2.45, 86);
  static STANDART12 = new TruckType(TruckTypeEnum.STANDART12, 12000, 7.2, 2.4, 48.5);
  static AUTO1_5 = new TruckType(TruckTypeEnum.AUTO1_5, 1500, 3.7, 2.2, 6);
  static AUTO3_5 = new TruckType(TruckTypeEnum.AUTO3_5, 3500, 4.2, 2.4, 9);
  static AUTO5_5 = new TruckType(TruckTypeEnum.AUTO5_5, 5500, 5.5, 2.4, 18);

  readonly name: TruckTypeEnum;
  readonly payload: number;
  readonly length: number;
  readonly width: number;
  readonly volume: number;


  constructor(name: TruckTypeEnum, payload: number, length: number, width: number, volume: number) {
    this.name = name;
    this.payload = payload;
    this.length = length;
    this.width = width;
    this.volume = volume;
  }
}
