import { Injectable } from '@angular/core';
import moment from 'moment-timezone';

@Injectable({
  providedIn: 'root',
})
export class MarketCloseService {

  getNextMarketClose(): string {
    const nyTime = moment().tz('America/New_York');
    const dayOfWeek = nyTime.day();
    let closingTime = nyTime.clone().set({ hour: 16, minute: 0, second: 0 }); // 4:00 PM NY time

    // If it's before 4:00 PM NY time, consider the previous day's close.
    if (nyTime.isBefore(closingTime)) {
      nyTime.subtract(1, 'days'); // Go back one day
    }

    // Adjust for weekends
    // If it's Sunday or Monday before the market opens, set to the previous Friday
    if (nyTime.day() === 0 || (nyTime.day() === 1 && nyTime.isBefore(closingTime))) {
      // Go back to the previous Friday
      closingTime.subtract(nyTime.day() + 2, 'days');
    }
    // If it's Saturday, go back to Friday
    else if (nyTime.day() === 6) {
      closingTime.subtract(1, 'days');
    }
    // For other days, just set to the previous day if it's before market open
    else if (nyTime.isBefore(closingTime)) {
      closingTime.subtract(1, 'days');
    }

    return closingTime.format('YYYY-MM-DD HH:mm:ss');
  }
}
