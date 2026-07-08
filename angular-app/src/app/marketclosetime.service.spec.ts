import { TestBed } from '@angular/core/testing';

import { MarketclosetimeService } from './marketclosetime.service';

describe('MarketclosetimeService', () => {
  let service: MarketclosetimeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MarketclosetimeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
