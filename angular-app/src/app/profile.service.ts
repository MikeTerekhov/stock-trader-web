import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { environment } from '../environments/environment';

export interface StockPurchase {
  ticker: string;
  shares: number;
  purchasePrice: number;
  currentPrice: number;
  corpName: string;
  totalCost: number;
}

export interface Favorite {
  ticker: string;
  corpName: string;
  highPrice: number;
  change: number;
  percentChange: number;
}

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private apiUrl = environment.apiUrl;
  private _purchasedStocks = new BehaviorSubject<StockPurchase[]>([]);
  private _favoritesSource = new BehaviorSubject<Favorite[]>([]);
  private _moneyBalanceSource = new BehaviorSubject<number>(1000); // Start with an assumed initial balance

  constructor(private http: HttpClient) {
    this.fetchInitialData();
  }

  private fetchInitialData(): void {
    this.fetchFavorites().subscribe(); // Fetch and cache favorites upon service initialization
    this.fetchPurchasedStocks().subscribe(); // Fetch and cache purchased stocks
    this.fetchBalance().subscribe(); // Fetch and cache account balance
  }

  get purchasedStocks$(): Observable<StockPurchase[]> {
    return this._purchasedStocks.asObservable();
  }

  get favorites$(): Observable<Favorite[]> {
    return this._favoritesSource.asObservable();
  }

  get moneyBalance$(): Observable<number> {
    return this._moneyBalanceSource.asObservable();
  }

  fetchFavorites(): Observable<Favorite[]> {
    return this.http.get<Favorite[]>(`${this.apiUrl}/favorites`).pipe(
      tap(favorites => this._favoritesSource.next(favorites))
    );
  }

  addFavorite(favorite: Favorite): Observable<Favorite> {
    return this.http.post<Favorite>(`${this.apiUrl}/favorites`, favorite).pipe(
      tap(() => this.fetchFavorites().subscribe()) // Refresh the cached favorites after adding
    );
  }

  removeFavorite(ticker: string): Observable<any> {
    const url = `${this.apiUrl}/favorites/del/${ticker}`;
    console.log('Deleting favorite:', url); 
    return this.http.delete(url).pipe(
      tap(() => this.fetchFavorites().subscribe())
    );
  }

  fetchPurchasedStocks(): Observable<StockPurchase[]> {
    return this.http.get<StockPurchase[]>(`${this.apiUrl}/stockPurchases`).pipe(
      tap(purchases => this._purchasedStocks.next(purchases))
    );
  }

  fetchBalance(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/balance`).pipe(
      tap(balance => this._moneyBalanceSource.next(balance))
    );
  }

  updateBalance(balance: number): Observable<number> {
    return this.http.post<number>(`${this.apiUrl}/balance/update`, { balance }).pipe(
      tap(() => this.fetchBalance().subscribe()) 
    );
  }
  
  buyStock(stockPurchase: StockPurchase): Observable<any> {
    const url = `${this.apiUrl}/buyStock`;
    return this.http.post(url, stockPurchase).pipe(
      tap(() => {
        this.fetchPurchasedStocks().subscribe(); 
        this.fetchBalance().subscribe(); 
      })
    );
  }

  sellStock(ticker: string, sharesToSell: number): Observable<any> {
    // Construct the request payload. Assume you only need ticker and shares for this example.
    const payload = { ticker, sharesToSell };

    // URL to your backend endpoint for selling stock
    const url = `${this.apiUrl}/sellStock`;

    return this.http.post(url, payload).pipe(
      tap(() => {
        // After a successful sell, update the local cache of purchased stocks and balance
        this.fetchPurchasedStocks().subscribe(); // Re-fetch the purchased stocks to update local cache
        this.fetchBalance().subscribe(); // Update the balance
      })
    );
}

update_curr_price(ticker: string) {
  const endpointUrl = `${this.apiUrl}/search/${ticker}`;
  
  this.http.get<any>(endpointUrl).subscribe(
    (response) => {
      if (response) {
        const currentPrice = response.quote.c;
        console.log(`Current price for ${ticker} is ${currentPrice}`);
      }
    },
    error => {
      console.error("Error fetching data:", error);
    }
  );
}

updateCurrentPriceInDb(ticker: string): void {
  const endpointUrl = `${this.apiUrl}/search/${ticker}`;
  this.http.get<any>(endpointUrl).subscribe(
    (response) => {
      if (response && response.quote && response.quote.c) {
        const currentPrice = response.quote.c;
        this.http.post(`${this.apiUrl}/updateCurrentPrice`, { ticker, currentPrice }).subscribe(
          () => console.log(`Updated current price for ${ticker} in the database.`),
          error => console.error("Error updating current price in database:", error)
        );
      }
    },
    error => console.error("Error fetching current price:", error)
  );
}

updateFavoriteStockInfo(ticker: string): void {
  // Fetch stock information from the API
  const endpointUrl = `${this.apiUrl}/search/${ticker}`;
  this.http.get<any>(endpointUrl).subscribe(
    (response) => {
      if (response) {
        const corpName = response.profile.name;
        const highPrice = response.quote.h; 
        const change = response.quote.d; 
        const percentChange = response.quote.dp; 

        this.http.post(`${this.apiUrl}/updateFavorite`, { ticker, corpName, highPrice, change, percentChange }).subscribe(
          () => console.log(`Updated favorite stock information for ${ticker} in the database.`),
          error => console.error("Error updating favorite stock information in database:", error)
        );
      }
    },
    error => console.error("Error fetching stock information:", error)
  );
}


} // end class
