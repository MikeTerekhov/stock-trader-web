import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SharedService {

  private controlValueSource = new BehaviorSubject<string>('');
  controlValue$ = this.controlValueSource.asObservable();

  setControlValue(value: string): void {
    this.controlValueSource.next(value);
  }

}

