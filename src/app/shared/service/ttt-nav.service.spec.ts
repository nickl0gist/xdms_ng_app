import { TestBed } from '@angular/core/testing';

import { TruckNavService } from './truck-nav.service';

describe('TttNavService', () => {
  let service: TruckNavService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TruckNavService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
