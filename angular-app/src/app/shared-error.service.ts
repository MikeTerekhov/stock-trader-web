import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SharedErrorService {
  private error1Source = new BehaviorSubject<string | null>(null);
  private error2Source = new BehaviorSubject<string | null>(null);
  private isLoad = new BehaviorSubject<boolean>(false);

  // Observable streams
  error1$ = this.error1Source.asObservable();
  error2$ = this.error2Source.asObservable();
  isLoad$ = this.isLoad.asObservable();

  clearErrors(): void {
    this.error1Source.next(null);
    this.error2Source.next(null);
    this.isLoad.next(false);
  }

}

