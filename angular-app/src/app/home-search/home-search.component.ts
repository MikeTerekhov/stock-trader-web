import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, catchError, tap, map, startWith } from 'rxjs/operators';
import { Router } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { TickerService } from '../ticker.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { SearchService } from '../search.service'; 
import { ActivatedRoute, Params } from '@angular/router';
import { Input } from '@angular/core';
import { OnChanges, SimpleChanges } from '@angular/core';
import { SharedErrorService } from '../shared-error.service';
import { Subscription } from 'rxjs';
import { SharedService } from '../shared-service.service';
import { ChangeDetectorRef } from '@angular/core';
import { environment } from '../../environments/environment';



@Component({
  selector: 'app-home-search',
  templateUrl: './home-search.component.html',
  styleUrls: ['./home-search.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatAutocompleteModule,
    MatIconModule,
    HttpClientModule,
    RouterModule,
    MatProgressSpinnerModule
  ],
})
export class HomeSearchComponent implements OnInit {

  @Input() searchQuery: string = ''
  private subscriptions = new Subscription();
  myControl = new FormControl();

  ngOnChanges(changes: SimpleChanges) {
    if (changes['searchQuery'] && changes['searchQuery'].currentValue) {
      this.myControl.patchValue(changes['searchQuery'].currentValue);
      console.log("MC", this.myControl.value);
    }
  }

  options: string[] = []; 
  filteredOptions!: Observable<string[]>;

  currentQuery: string = ''; 

  searchResults: any[] = [];
  isLoading = false;
  baseURL = environment.apiUrl;
  error1: string | null = null;
  error2: string | null = null; 
  

  constructor(private http: HttpClient, private router: Router, private tickerService: TickerService, private searchService: SearchService, private route: ActivatedRoute, private sharedErrorService: SharedErrorService, private sharedService: SharedService, private cdr: ChangeDetectorRef) {}

  ngOnInit() { 
    this.route.params.subscribe(params => {
      this.currentQuery = params['query']; 
    });

    this.filteredOptions = this.myControl.valueChanges.pipe(
      startWith(''),
      debounceTime(300),
      distinctUntilChanged(),
      tap(() => this.isLoading = true),
      tap(query => this.currentQuery = query), 
      switchMap(query => {
        if (query.trim().length === 0) {
          this.isLoading = false;
          return of([]);
        }
        const endpointUrl = `${this.baseURL}/api/autocomplete/${query}`;
        return this.http.get<any>(endpointUrl).pipe(
          tap(() => this.isLoading = false),
          catchError(error => {
            console.error('Error fetching data:', error);
            this.isLoading = false;
            return of([]); 
          }),
          map(response => response.result || []), 
          map(items => items.filter((item: any) => item.type === "Common Stock")),
          map(items => items.filter((item: any) => !item.symbol.includes('.'))), 
          map(filteredItems => filteredItems.map((item: any) => `${item.symbol} | ${item.description}`)), 
          tap(symbolsArray => {
            this.searchResults = symbolsArray; 
          })
        );
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  clear() {
    this.myControl.setValue('');
    this.sharedErrorService.clearErrors();
    this.router.navigate(['home/search']);
  }

  search() {
    this.sharedErrorService.clearErrors();
    this.router.navigate(['/search', this.currentQuery]);
  }
  
  onOptionSelected(event: MatAutocompleteSelectedEvent) {
    this.myControl.setValue(event.option.value);
    this.search();
  }

} // end class

