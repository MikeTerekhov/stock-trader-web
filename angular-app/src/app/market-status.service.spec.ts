import { TestBed } from '@angular/core/testing';

import { MarketStatusService } from './market-status.service';

describe('MarketStatusService', () => {
  let service: MarketStatusService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MarketStatusService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
