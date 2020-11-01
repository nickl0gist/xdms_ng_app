import { TestBed } from '@angular/core/testing';

import { TttNavService } from './ttt-nav.service';

describe('TttNavService', () => {
  let service: TttNavService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TttNavService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
