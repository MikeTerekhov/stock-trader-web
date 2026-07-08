import { Injectable } from '@angular/core';
import moment from 'moment-timezone';

@Injectable({
  providedIn: 'root',
})
export class MarketStatusService {

  constructor() { }

  isMarketOpen(): boolean {
    const nyTime = moment().tz('America/New_York');
    const dayOfWeek = nyTime.day();
    const timeOfDay = nyTime.format('HH:mm');

    // NYSE is closed on weekends
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return false;
    }

    // NYSE operating hours are from 9:30 AM to 4:00 PM
    if (timeOfDay >= '09:30' && timeOfDay <= '16:00') {
      return true;
    }

    return false;
  }
}
