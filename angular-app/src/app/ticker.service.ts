import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TickerService {

  constructor() { }

  private tickerSource = new BehaviorSubject<string | null>(null);
  
  ticker$ = this.tickerSource.asObservable();

  setTicker(ticker: string) {
    this.tickerSource.next(ticker);
  }
  get currentTicker(): string | null {
    return this.tickerSource.getValue();
  }
}
