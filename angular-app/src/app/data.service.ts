import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, shareReplay } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class DataService {

  private cache = new Map<string, Observable<any>>();

  constructor(private http: HttpClient) {}

  fetchData(url: string): Observable<any> {
    if (this.cache.has(url)) {
      return this.cache.get(url)!;
    }

    const response = this.http.get(url).pipe(
      shareReplay(1), 
      catchError(error => {
        console.error('Failed to fetch data', error);
        return of(null); 
      })
    );

    this.cache.set(url, response);
    return response;
  }

} // end class

