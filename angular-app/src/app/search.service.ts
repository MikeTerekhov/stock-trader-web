import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private searchTerm = new BehaviorSubject<string>('');

  setSearchTerm(term: string) {
    this.searchTerm.next(term);
  }

  getSearchTerm() {
    return this.searchTerm.asObservable();
  }
}

