import { TestBed } from '@angular/core/testing';

import { MarketLastOpenService } from './market-last-open.service';

describe('MarketLastOpenService', () => {
  let service: MarketLastOpenService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MarketLastOpenService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
