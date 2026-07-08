import { Injectable } from '@angular/core';
import moment from 'moment-timezone';

@Injectable({
  providedIn: 'root',
})
export class MarketLastOpenService {

  constructor() { }

  getLastOpenDate(): moment.Moment {
    // Adjust to NY timezone if needed and start of the day
    let lastOpenDate = moment().tz('America/New_York').startOf('day');

    // Check the day of the week; 0 is Sunday, 6 is Saturday
    let dayOfWeek = lastOpenDate.day();

    // If today is Sunday, go back to Friday
    if (dayOfWeek === 0) {
      lastOpenDate.subtract(2, 'days');
    }
    // If today is Monday, go back to Friday
    else if (dayOfWeek === 1) {
      lastOpenDate.subtract(3, 'days');
    }
    // If today is Saturday, go back to Friday
    else if (dayOfWeek === 6) {
      lastOpenDate.subtract(1, 'days');
    }
    // If it's any other day of the week, just go back to the previous day (Tuesday to Friday)
    else {
      lastOpenDate.subtract(1, 'days');
    }

    // Return the date of the last open market day
    return lastOpenDate;
  }
}


