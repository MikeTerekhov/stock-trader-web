import { Component, OnInit } from '@angular/core';
import { ProfileService, StockPurchase } from '../profile.service'; 
import { CommonModule } from '@angular/common';
import { DataService } from '../data.service'; 
import { TickerService } from '../ticker.service'; 
import {ViewChild, ElementRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AbsPipe } from '../abs.pipe';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-portfolio',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    AbsPipe,
    MatProgressSpinnerModule
  ],
  templateUrl: './portfolio.component.html',
  styleUrls: ['./portfolio.component.css'] 
})
export class PortfolioComponent implements OnInit {
  profileData: any;

  isLoading: boolean = true;
  totalCost: number = 0;
  baseURL = environment.apiUrl;
  balance: number = 0;
  stocksPurchased: StockPurchase[] = [];
  selectedQuantity: number = 0; 
  purchaseSuccess: boolean = false;
  sellSuccess: boolean = false;
  errorMessage: string = '';
  ticker: string = '';
  curr_price: number = 0;
  name: string = '';
  selectedStock: StockPurchase | null = null;

  @ViewChild('buyStockModal') buyStockModal!: ElementRef;
  @ViewChild('sellStockModal') sellStockModal!: ElementRef;

  constructor(private profileService: ProfileService, private dataService: DataService, private tickerService: TickerService) {}

  ngOnInit(): void {
    this.isLoading = true;
    this.fetchData();
  }

  ngAfterViewInit(): void {
    this.buyStockModal.nativeElement.addEventListener('hidden.bs.modal', () => {
      if (this.purchaseSuccess) {
        this.purchaseSuccess = false; 
      }
    });

    if (this.sellStockModal && this.sellStockModal.nativeElement) {
      this.sellStockModal.nativeElement.addEventListener('hidden.bs.modal', () => {
        if (this.sellSuccess) {
          this.sellSuccess = false; 
        }
      });
    }
  }

  fetchData(): void {
    this.profileService.moneyBalance$.subscribe(balance => {
      this.balance = balance;
    });

    this.profileService.purchasedStocks$.subscribe(stocks => {
      this.stocksPurchased = stocks;
      setTimeout(() => this.isLoading = false, 1000);
    });

    this.tickerService.ticker$.subscribe(ticker => {
      if (ticker) {
        this.ticker = ticker.toUpperCase();
      }
    });

  }
  

  calculateTotal(): void {
    this.totalCost = this.selectedQuantity * this.curr_price;
  }

  selectStock(stock: StockPurchase): void {
    this.profileService.updateCurrentPriceInDb(stock.ticker); 
    this.selectedStock = stock;
    this.ticker = stock.ticker;
  }

  isEnoughBalance(num: number): boolean {
    return num <= this.balance;
  }

  isStockPurchased(ticker: string): boolean {
    return this.stocksPurchased.some(stock => stock.ticker === ticker);
  }

  isEnoughStock(ticker: string, selected_quantity: number): boolean {
    const stockOwned = this.stocksPurchased.find(stock => stock.ticker === ticker);
    return stockOwned ? selected_quantity <= stockOwned.shares : false;
  }

  buyStock(selected_quantity: number, stock: StockPurchase): void {
    const price = stock.currentPrice * selected_quantity;
    if (this.isEnoughBalance(price)) {
      const stockPurchase: StockPurchase = {
        ticker: stock.ticker,
        shares: selected_quantity,
        purchasePrice: stock.currentPrice,
        currentPrice: stock.currentPrice,
        corpName: stock.corpName,
        totalCost: stock.currentPrice * selected_quantity
      };
      this.profileService.buyStock(stockPurchase).subscribe({
        next: () => {
          this.purchaseSuccess = true;
          setTimeout(() => {
            this.purchaseSuccess = false;
          }, 5000);
        },
        error: (error) => {
          console.error('Purchase failed:', error);
        }
      });
    }
  }

  sellStock(selected_quantity: number, stock: StockPurchase): void {
    const ticker = stock.ticker;
    if (this.isEnoughStock(ticker, selected_quantity)) {
      // Call the ProfileService's sellStock method with the required parameters
      this.profileService.sellStock(ticker, selected_quantity).subscribe({
        next: () => {
          console.log('Stock sold successfully');
          this.selectedQuantity = 0;
          this.sellSuccess = true;
          setTimeout(() => {
            this.sellSuccess = false;
          }, 5000);
        },
        error: (error) => {
          console.error('Failed to sell stock:', error);
        }
      });
    } else {
      console.error('Not enough stock to sell');
    }
  }

}



