import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import moment from 'moment'; 
import clone from 'moment';
import { MarketStatusService } from '../market-status.service';
import { MarketCloseService } from '../marketclosetime.service';
import {Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import {AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { Subscription, interval } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import * as Highcharts from 'highcharts/highstock';
import { HighchartsChartModule } from 'highcharts-angular';
import IndicatorsCore from 'highcharts/indicators/indicators';
import VBP from 'highcharts/indicators/volume-by-price';
import More from 'highcharts/highcharts-more';
import HC_exporting from 'highcharts/modules/exporting';
import HC_exportData from 'highcharts/modules/export-data';
import AccessibilityModule from 'highcharts/modules/accessibility';
import { lastValueFrom } from 'rxjs';
import { HomeSearchComponent } from '../home-search/home-search.component';
import { ProfileService, Favorite, StockPurchase } from '../profile.service';
import { DataService } from '../data.service'; // Adjust the import path
import { TickerService } from '../ticker.service'; // Adjust the import path
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SearchService } from '../search.service'; 
import { SharedErrorService } from '../shared-error.service';
import { SharedService } from '../shared-service.service';
import { Router } from '@angular/router';
import {MarketLastOpenService} from '../market-last-open.service';
import { environment } from '../../environments/environment';

AccessibilityModule(Highcharts);
HC_exporting(Highcharts);
HC_exportData(Highcharts);
More(Highcharts);
IndicatorsCore(Highcharts);
VBP(Highcharts);


@Component({
  selector: 'app-search',
  imports: [
    CommonModule,
    HighchartsChartModule,
    HomeSearchComponent,
    FormsModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css'],
  standalone: true,
})
export class SearchComponent implements OnInit, AfterViewInit {

  Highcharts: typeof Highcharts = Highcharts;
  chartOptions1!: Highcharts.Options; 
  chartOptions2!: Highcharts.Options; 
  chartOptions3!: Highcharts.Options; 
  chartOptions4!: Highcharts.Options; 

  @ViewChild('exampleModal') modalElementRef!: ElementRef;
  @ViewChild('buyStockModal') buyStockModal!: ElementRef;
  @ViewChild('sellStockModal') sellStockModal!: ElementRef;
  @ViewChild('purchaseSuccessAlert') purchaseSuccessAlert!: ElementRef<HTMLDivElement>;
  @ViewChild('sellSuccess') sellSuccessAlert!: ElementRef<HTMLDivElement>;

  searchQuery: string = '';

  isLoading: boolean = true;
  isLoading1: boolean = true;
  isLoading2: boolean = true;
  isLoading3: boolean = true;
  isLoading4: boolean = true;
  isLoading5: boolean = true;
  isLoading6: boolean = true;
  isLoading7: boolean = true;
  isLoading8: boolean = true;

  private fetchSummaryIntervalSubscription!: Subscription;

  selectedItem: any = {};
  private modalInstance: any;

  private favoritesSub!: Subscription;
  favorites: Favorite[] = [];

  private stockPurchaseSub!: Subscription;
  stockPurchases_arr: StockPurchase[] = [];
  
  currentBalance: number = 0;
  private balanceSub!: Subscription;

  selectedQuantity: number = 0; // default value

  purchaseSuccess: boolean = false;
  sellSuccess: boolean = false;

  private errorsSubscriptions = new Subscription();
  error1: string | null = null;
  error2: string | null = null;
  isLoad: boolean = true;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private activatedRoute: ActivatedRoute,
    private http: HttpClient,
    private marketStatusService: MarketStatusService,
    private marketCloseService: MarketCloseService,
    private lastFullDayService: MarketLastOpenService,
    private profileService: ProfileService,
    private modalService: NgbModal,
    private dataService: DataService,
    private tickerService: TickerService,
    private searchService: SearchService,
    private route: ActivatedRoute,
    private sharedErrorService: SharedErrorService,
    private sharedService: SharedService,
    private router: Router,
    private marketLastOpenService: MarketLastOpenService
  ) {
    this.errorsSubscriptions.add(this.sharedErrorService.error1$.subscribe(error => {
      this.error1 = error;
    }));

    this.errorsSubscriptions.add(this.sharedErrorService.error2$.subscribe(error => {
      this.error2 = error;
    }));

    this.errorsSubscriptions.add(this.sharedErrorService.isLoad$.subscribe(isLoading => {
      this.isLoad = isLoading;
    }));
  }

  baseURL = environment.apiUrl;
  totalCost: number = 0;
  stockTicker: string | undefined;
  marketOpen: boolean = false;
  newsItems: any[] = []; 
  logoUrl: string | undefined;
  ticker: string | undefined;
  name: string | undefined;
  exchange: string | undefined;
  price: number | undefined;
  change: number | undefined;
  percentChange: number | undefined;
  timestamp: number | undefined;
  formattedDate: string | undefined;
  marketCloseTime: string | undefined;
  highPrice: number | undefined;
  lowPrice: number | undefined;
  openPrice: number | undefined;
  prevClose: number | undefined;
  ipo: string | undefined;
  industry: string | undefined;
  webpage: string | undefined;
  companyPeers: string [] | undefined;
  currentDate: string | undefined;
  yesterdayDate: string | undefined;
  marketCloseDay: string | undefined;
  oneDayBeforeClose: string | undefined;
  endpointUrl_charts2: string | undefined;
  query: string | undefined;
  lastFullDay: string | undefined;
  lastFullDayy: string | undefined;

  favoriteSuccess: boolean = false;
  favoriteSuccessRem: boolean = false;
  favoriteError: boolean = false;

  time_stamp_comp: string | undefined;

  private tickerSubscription!: Subscription;

  totalPositiveChange: number = 0;
  totalNegativeChange: number = 0;
  totalChange: number = 0;
  totalPositiveMSPR: number = 0;
  totalNegativeMSPR: number = 0;
  totalMSPR: number = 0;

  sentimentsData: any[] = [];
  

  ngOnInit() {
    this.isLoading = true; 

    this.route.params.subscribe(params => {
      const query = params['query'];
      this.sharedService.setControlValue(query);
      this.searchQuery = query;
      if (!query || query.length === 0) {
        this.error1 = "The search query cannot be empty.";
      } else {
        this.error1 = null;
      }
      
    });

    this.favoritesSub = this.profileService.favorites$.subscribe((favorites: Favorite[]) => {
      this.favorites = favorites;
    });

    this.stockPurchaseSub = this.profileService.purchasedStocks$.subscribe(purchases => {
      this.stockPurchases_arr = purchases;
    });

    this.balanceSub = this.profileService.moneyBalance$.subscribe(balance => {
      this.currentBalance = balance;
    });

    this.marketOpen = this.marketStatusService.isMarketOpen();
    if (!this.marketOpen) {
      this.marketCloseTime = this.marketCloseService.getNextMarketClose();
    }
    
    this.activatedRoute.params.subscribe(params => {
      const query = params['query']; 
      this.query = query;
      this.stockTicker = this.query?.toUpperCase();
      this.tickerService.setTicker(this.query!);

      this.fetchSummary_cache();
      this.fetchInsights();
      this.fetchNews();

      // refresh
      this.marketOpen = this.marketStatusService.isMarketOpen();
      if (!this.marketOpen) {
        this.marketCloseTime = this.marketCloseService.getNextMarketClose();
      } 
      else {
        this.restartFetchSummaryInterval();
      }

    });
  } // end NGONIT

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {

      import('bootstrap/js/dist/modal').then(({ default: Modal }) => {
        this.modalInstance = new Modal(this.modalElementRef.nativeElement);
      });
    }

    this.tickerSubscription = this.tickerService.ticker$.subscribe((ticker: string | null) => {
      if (ticker) {
        this.fetchAndUpdateChartData(ticker);
        this.fetchAndUpdateChartData2(ticker);
        this.fetchAndUpdateChartData3(ticker);
        this.fetchAndUpdateChartData4(ticker);
      }
    });

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
  } // end NG

  ngOnDestroy() {
    if (this.favoritesSub) {
      this.favoritesSub.unsubscribe();
    }
    if (this.stockPurchaseSub) {
      this.stockPurchaseSub.unsubscribe();
    }
    if (this.balanceSub) {
      this.balanceSub.unsubscribe();
    }
    if (this.fetchSummaryIntervalSubscription) {
      this.fetchSummaryIntervalSubscription.unsubscribe();
    }
    if (this.tickerSubscription) {
      this.tickerSubscription.unsubscribe();
    }
    if (this.fetchSummaryIntervalSubscription) {
      this.fetchSummaryIntervalSubscription.unsubscribe();
    }
    this.errorsSubscriptions.unsubscribe();
  }  // end ng destroy

  restartFetchSummaryInterval() {
    if (this.fetchSummaryIntervalSubscription) {
      this.fetchSummaryIntervalSubscription.unsubscribe();
    }
  
    const fetchInterval = 15000;
    this.fetchSummaryIntervalSubscription = interval(fetchInterval).subscribe(() => {
      this.fetchSummary();
    });
  }

  openModal(item: any): void {
    this.selectedItem = item;
    if (isPlatformBrowser(this.platformId) && this.modalInstance) {
      this.modalInstance.show();
    }
  }

  isStockPurchased(ticker: string): boolean {
    return this.stockPurchases_arr.some(stock => stock.ticker === ticker);
  }

  isEnoughStock(): boolean {
    const stockOwned = this.stockPurchases_arr.find(stock => stock.ticker === this.stockTicker);
    return stockOwned ? this.selectedQuantity <= stockOwned.shares : false;
  }

  onStarClick() {
  if (!this.ticker || !this.name || this.highPrice === undefined || this.change === undefined || this.percentChange === undefined) {
    console.error('Missing data for marking as favorite');
    this.favoriteError = true;
    setTimeout(() => this.favoriteError = false, 5000);
    return;
  }

  const favorite: Favorite = {
    ticker: this.ticker,
    corpName: this.name,
    highPrice: this.highPrice,
    change: this.change,
    percentChange: this.percentChange,
  };

  const isFav = this.favorites.some(fav => fav.ticker === favorite.ticker);
  
  if (isFav) {
    this.profileService.removeFavorite(favorite.ticker).subscribe({
      next: () => {
        console.log(`${favorite.ticker} removed from favorites.`);
        this.favoriteSuccessRem = true;
        setTimeout(() => this.favoriteSuccessRem = false, 5000);
      },
      error: (error) => {
        console.error('Error removing favorite:', error);
        this.favoriteError = true;
        setTimeout(() => this.favoriteError = false, 5000);
      },
    });
  } else {
    this.profileService.addFavorite(favorite).subscribe({
      next: () => {
        console.log(`${favorite.ticker} added to favorites.`);
        this.favoriteSuccess = true;
        setTimeout(() => this.favoriteSuccess = false, 5000);
      },
      error: (error) => {
        console.error('Error adding favorite:', error);
        this.favoriteError = true;
        setTimeout(() => this.favoriteError = false, 5000);
      },
    });
  }
}
  

  someMethodToUpdateTicker(newTicker: string) {
    this.sharedService.setControlValue(newTicker);
  }

  redirectToHomeSearch() {
    this.router.navigate(['/home/search']);
  }

  buyStock(): void {
    if (this.isEnoughBalance()) {
      const stockPurchase: StockPurchase = {
        ticker: this.stockTicker!,
        shares: this.selectedQuantity,
        purchasePrice: this.price!,
        currentPrice: this.price!,
        corpName: this.name!,
        totalCost: this.selectedQuantity * this.price!
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

  sellStock(): void {
    if (this.isEnoughStock()) {
      this.profileService.sellStock(this.stockTicker!, this.selectedQuantity).subscribe({
        next: () => {
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

  calculateTotal(): void {
    this.totalCost = this.selectedQuantity * this.price!;
  }

  isEnoughBalance(): boolean {
    return this.totalCost <= this.currentBalance;
  }

  update_price() {
    this.profileService.updateCurrentPriceInDb(this.stockTicker!);
  }
  
  shareOnTwitter() {
    const headline = encodeURIComponent(this.selectedItem.headline);
    const url = encodeURIComponent(this.selectedItem.url);
    const tweetUrl = `https://twitter.com/intent/tweet?text=${headline}&url=${url}`;
    window.open(tweetUrl, '_blank');
  }
  
  shareOnFacebook() {
    const url = encodeURIComponent(this.selectedItem.url);
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
    window.open(facebookUrl, '_blank');
  }

  getPeers(): string[] {
    return (this.companyPeers!).filter(peer => !peer.includes('.'));
  }
  
  navigateToPeer(peer: string): void {
    this.router.navigate(['/search', peer]);
  }

  getTodaysDate(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0'); 
    const day = today.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  getDateTwoYearsAgo(): string {
    const today = new Date();
    const twoYearsAgo = new Date();
    twoYearsAgo.setFullYear(today.getFullYear() - 2);
    const year = twoYearsAgo.getFullYear();
    const month = (twoYearsAgo.getMonth() + 1).toString().padStart(2, '0');
    const day = twoYearsAgo.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  getDateAWeekAgo(): string {
    const today = new Date();
    const aWeekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000); 
    const year = aWeekAgo.getFullYear();
    const month = (aWeekAgo.getMonth() + 1).toString().padStart(2, '0');
    const day = aWeekAgo.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // FETCH DATA

  fetchNews() {
    this.isLoading = true;
    const today = this.getTodaysDate();
    const weekAgo = this.getDateAWeekAgo();
    const endpointUrl_news = `${this.baseURL}/api/news/${this.query}/${weekAgo}/${today}`;
  
    this.dataService.fetchData(endpointUrl_news).subscribe(response => {
      if (!response) {
        console.error("No data returned from fetchNews");
        return;
      }
  
      this.newsItems = response
        .filter((item: any) => item.image && item.image.trim() !== '' && item.headline && item.headline.trim() !== '')
        .slice(0, 20)
        .map((item: any) => ({
          source: item.source,
          publishedDate: new Date(item.datetime * 1000).toISOString().split('T')[0],
          headline: item.headline,
          summary: item.summary,
          url: item.url,
          img: item.image
        }));
        this.isLoading = false;
    }, error => {
      console.error("Error fetching news:", error);
      this.isLoading = false;
    });
  }
  

  fetchInsights() {
    this.isLoading2 = true;
    const endpointUrl = `${this.baseURL}/api/insights/${this.query}`;

    this.dataService.fetchData(endpointUrl).subscribe(response => {
      if (!response) {
        console.error("No data returned from fetchInsights");
        return;
      }
  
      // Initialize totals
      this.totalPositiveChange = 0;
      this.totalNegativeChange = 0;
      this.totalChange = 0;
      this.totalPositiveMSPR = 0;
      this.totalNegativeMSPR = 0;
      this.totalMSPR = 0;
  
      const data = response.data;

      for (let item of data) {
        const change = item.change;
        const mspr = item.mspr;
  
        this.totalChange += change;
        this.totalMSPR += mspr;
  
        if (change > 0) this.totalPositiveChange += change;
        if (mspr > 0) this.totalPositiveMSPR += mspr;
  
        if (change < 0) this.totalNegativeChange += change;
        if (mspr < 0) this.totalNegativeMSPR += mspr;
      }
      this.isLoading2 = false;
    }, error => {
      console.error("Error fetching data:", error);
      this.isLoading2 = false;
    });
  }
  
  fetchSummary_cache() {
    this.isLoading3 = true;
    const endpointUrl = `${this.baseURL}/search/${this.query}`;
    
    this.dataService.fetchData(endpointUrl).subscribe(
      (response: any) => {

        if (response) {
          const { profile, quote, peers } = response;

          const quoteProperties = ['c', 'd', 'dp', 'h', 'l', 'o', 'pc'];
          const isQuoteInvalid = quoteProperties.some(prop => quote[prop] === null);

          if (isQuoteInvalid) {
            this.error2 = "Essential quote information is missing.";
            this.isLoading4 = false;
            return; 
          }

          this.logoUrl = profile.logo;
          this.ticker = profile.ticker;
          this.name = profile.name;
          this.exchange = profile.exchange;
          this.ipo = profile.ipo;
          this.industry = profile.finnhubIndustry;
          this.webpage = profile.weburl;
          this.price = quote.c;
          this.change = quote.d;
          this.percentChange = quote.dp;
          this.timestamp = quote.t;
          this.highPrice = quote.h;
          this.lowPrice = quote.l;
          this.openPrice = quote.o;
          this.prevClose = quote.pc;

          // updating time stamp (PIAZZA SAID TO DO THIS)
          const currentTimestamp = Date.now(); 
          this.time_stamp_comp = moment(currentTimestamp).format('YYYY-MM-DD HH:mm:ss');

          if (this.timestamp) {
            this.formattedDate = moment(this.timestamp * 1000).format('YYYY-MM-DD HH:mm:ss');
          }
          this.companyPeers = peers.filter((peer: string) => !peer.includes('.'));
        }
        this.isLoading3 = false;
      },
      error => {
        console.error("Error fetching data:", error);
        this.isLoading3 = false;
      }
    );
  }

  fetchSummary() {
    this.isLoading4 = true;
    const endpointUrl = `${this.baseURL}/search/${this.query}`;
    
    this.http.get<any>(endpointUrl, { headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' } }).subscribe(
      (response: any) => {
        console.log("resy", response);
        if (response) {

          const { profile, quote, peers } = response;

          const quoteProperties = ['c', 'd', 'dp', 'h', 'l', 'o', 'pc'];
          const isQuoteInvalid = quoteProperties.some(prop => quote[prop] === null);

          if (isQuoteInvalid) {
            this.error2 = "Essential quote information is missing.";
            this.isLoading4 = false;
            return; 
          }

          this.logoUrl = profile.logo;
          this.ticker = profile.ticker;
          this.name = profile.name;
          this.exchange = profile.exchange;
          this.ipo = profile.ipo;
          this.industry = profile.finnhubIndustry;
          this.webpage = profile.weburl;
          this.price = quote.c;
          this.change = quote.d;
          this.percentChange = quote.dp;
          this.timestamp = quote.t;
          this.highPrice = quote.h;
          this.lowPrice = quote.l;
          this.openPrice = quote.o;
          this.prevClose = quote.pc;
          const timestamp2 = quote.t;

          // updating time stamp (PIAZZA SAID TO DO THIS)
          const currentTimestamp = Date.now(); 
          this.time_stamp_comp = moment(currentTimestamp).format('YYYY-MM-DD HH:mm:ss');

          if (this.timestamp) {
            this.formattedDate = moment(this.timestamp * 1000).format('YYYY-MM-DD HH:mm:ss');
          }
  
          this.companyPeers = peers.filter((peer: string) => !peer.includes('.'));
        }
        this.isLoading4 = false;
      },
      error => {
        console.error("Error fetching data:", error);
        this.isLoading4 = false;
      }
    );
  }

  isFavorite(ticker: string): boolean {
      return this.favorites.some(fav => fav.ticker === ticker);
  }

  generateChartUrl(stockTicker: string): string {
    let url = '';

    const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const today = new Date();
    const dayOfWeekName = daysOfWeek[today.getDay()];
    const format = 'YYYY-MM-DD';
    const lastOpenDayMoment = this.marketLastOpenService.getLastOpenDate();
    const lastOpenDay = lastOpenDayMoment.format(format);
    const oneDayEarlier = lastOpenDayMoment.subtract(1, 'days').format(format);
    //let dayOfWeekName: string = "Tuesday";

    if (dayOfWeekName == "Sunday"){
      const from = oneDayEarlier;
      const to = lastOpenDay;
      url = `${this.baseURL}/api/charts/${stockTicker}/${from}/${to}`;
      console.log("Day of week: ", dayOfWeekName);
      console.log("from", from);
      console.log("to", to);
    }
    else if (dayOfWeekName == "Saturday") {
      const from = oneDayEarlier;
      const to = lastOpenDay;
      url = `${this.baseURL}/api/charts/${stockTicker}/${from}/${to}`;
      console.log("Day of week: ", dayOfWeekName);
      console.log("from", from);
      console.log("to", to);
    }
    else if (dayOfWeekName == "Monday") {
      const today2 = moment();
      const lastThursday = today2.clone().subtract(4, 'days').format('YYYY-MM-DD');
      const lastFriday = today2.clone().subtract(3, 'days').format('YYYY-MM-DD');
      url = `${this.baseURL}/api/charts/${stockTicker}/${lastThursday}/${lastFriday}`;
      console.log("Day of week: ", dayOfWeekName);
      console.log("last thurs", lastThursday);
      console.log(" last fri", lastFriday);
    }
    else {
      const today2 = moment().format('YYYY-MM-DD');
      if (this.marketOpen) {
        url = `${this.baseURL}/api/charts/${stockTicker}/${lastOpenDay}/${today2}`;
      } else {
        url = `${this.baseURL}/api/charts/${stockTicker}/${oneDayEarlier}/${lastOpenDay}`;
      }

      console.log("Day of week: ", dayOfWeekName);
      console.log("lastOpenDay", lastOpenDay);
      console.log("today", today2);
      console.log("oneDayearlier", oneDayEarlier);


    }
    return url;
  }

  async fetchAndUpdateChartData(stockTicker: string) {
    this.isLoading5 = true;
    
    let url = this.generateChartUrl(stockTicker);

    try {
      const response = await lastValueFrom(this.dataService.fetchData(url));
      const priceData = response.results.map((res: any) => [res.t, res.c]);
      const label = moment(this.getTodaysDate()).format('DD MMM');

      this.chartOptions1 = {
        exporting: { enabled: false },
        chart: {
          backgroundColor: '#F6F6F6'
        },
        rangeSelector: {
          enabled: false
        },
        title: {
          text: `${stockTicker.toUpperCase()} Hourly Price Variation`,
          style: {
            color: 'grey'
          }
        },
        xAxis: {
          type: 'datetime',
          tickPositioner: function () {
            const extremes = this.getExtremes();
            const dataMin = extremes.dataMin;
            const dataMax = extremes.dataMax;

            if (dataMax !== undefined && dataMin !== undefined) {
              const middle = dataMin + (dataMax - dataMin) / 2;
              let positions = this.tickPositions ? [...this.tickPositions] : [];
              const threshold = (dataMax - dataMin) / 10;
              
              positions = positions.filter(pos => Math.abs(pos - middle) >= threshold);
              positions.push(middle);
              positions.sort((a, b) => a - b);
              
              return positions;
            }

            return this.tickPositions || [];
          },
          labels: {
            formatter: function () {
              if (this.value === (this.axis.getExtremes().dataMin + (this.axis.getExtremes().dataMax - this.axis.getExtremes().dataMin) / 2)) {
                return label;
              }
              return this.axis.defaultLabelFormatter.call(this);
            }
          }
        },
        yAxis: {
          title: { text: '' },
          labels: { align: 'left' },
          opposite: true
        },
        series: [{
          name: `${stockTicker} Stock Price`,
          data: priceData,
          type: 'line',
          tooltip: { valueDecimals: 2 },
          color: this.marketOpen ? 'green' : 'red',
          marker: { enabled: false }
        }],
        navigator: { enabled: false },
        scrollbar: { enabled: true },
        credits: { enabled: true },
        legend: { enabled: false }
      };
      this.isLoading5 = false;
    } catch (error) {
      console.error("Failed to fetch and update chart data:", error);
      this.isLoading5 = false;
    }
  }

  async fetchAndUpdateChartData2(ticker: string): Promise<void> {
    this.isLoading6 = true;
    try {
      const twoYearsAgo = this.getDateTwoYearsAgo();
      const url = `${this.baseURL}/api/charts2/${ticker}/${twoYearsAgo}/${this.getTodaysDate()}`;
      const response = await lastValueFrom(this.dataService.fetchData(url));
      const ohlc = response.results.map((res: any) => [res.t, res.o, res.h, res.l, res.c]);
      const volumeData = response.results.map((res: any) => [res.t, res.v]);
      
      this.chartOptions2 = {
        chart: {
          backgroundColor: '#F6F6F6'
        },
        rangeSelector: {
          enabled: true,
          inputEnabled: false,
          selected: 2,
          buttons: [
            { type: 'month', count: 1, text: '1m' },
            { type: 'month', count: 3, text: '3m' },
            { type: 'month', count: 6, text: '6m' },
            { type: 'ytd', text: 'YTD' },
            { type: 'year', count: 1, text: '1y' },
            { type: 'all', text: 'All' }
          ], 
        },
        exporting: { enabled: false },
        title: {
            text: `${response.ticker} Historical`
        },
        subtitle: {
            text: 'With SMA and Volume by Price technical indicators'
        },
        xAxis: {
          ordinal: true,
          type: 'datetime',
          dateTimeLabelFormats: {
            day: '%e %b' 
          },
        },
        yAxis: [{
            startOnTick: false,
            endOnTick: false,
            opposite: true,
            labels: {
                align: 'left',
            },
            title: {
                text: 'OHLC'
            },
            height: '60%',
            lineWidth: 2,
            resize: {
                enabled: true
            }
        }, {
            labels: {
                align: 'left'
            },
            title: {
                text: 'Volume'
            },
            top: '65%',
            height: '35%',
            offset: 0,
            lineWidth: 2,
            opposite: true
        }],
        series: [{
            type: 'candlestick',
            name: 'AAPL',
            id: 'aapl',
            zIndex: 2,
            data: ohlc
        }, {
            type: 'column',
            name: 'Volume',
            id: 'volume',
            data: volumeData,
            yAxis: 1,
            pointPadding: 0, 
            groupPadding: 0, 
            pointRange: 24 * 3600 * 1000, 
        }, {
            type: 'vbp',
            linkedTo: 'aapl',
            params: {
                volumeSeriesID: 'volume'
            },
            dataLabels: {
                enabled: false
            },
            zoneLines: {
                enabled: false
            }
        }, {
            type: 'sma',
            linkedTo: 'aapl',
            zIndex: 1,
            marker: {
                enabled: false
            }
        }],
        navigator: {
          enabled: true
        }, 
        legend: {
          enabled: false 
        }   
      };
      this.isLoading6 = false;
    } catch (error) {
      console.error("Failed to fetch and update chart data:", error);
      this.isLoading6 = false;
    }
  }

  async fetchAndUpdateChartData3(query: string): Promise<void> {
    this.isLoading7 = true;
    try {
      const url_rec = `${this.baseURL}/api/recs/${query}`;
      const response = await lastValueFrom(this.dataService.fetchData(url_rec));
      const categories = response.map((item: any) => item.period); 
      const seriesData = response.map((item: any) => ({
        x: Date.parse(item.period), 
        y: [item.strongBuy, item.buy, item.hold, item.sell, item.strongSell]
      }));

      // Updating the chart options
      this.chartOptions3 = {
        exporting: { enabled: false },
        chart: {
          type: 'column',
          backgroundColor: '#F6F6F6'
        },
        title: {
          text: 'Recommendation Trends'
        },
        xAxis: {
          categories: categories,
          type: 'datetime',
          dateTimeLabelFormats: {
            day: '%e %b' 
          }
        },
        yAxis: {
          min: 0,
          title: {
            text: '# Analysis'
          },
          stackLabels: {
            enabled: false
          }
        },
        tooltip: {
          shared: true
        },
        plotOptions: {
          column: {
            stacking: 'normal',
            dataLabels: {
              enabled: true,
              inside: true, 
              verticalAlign: 'middle', 
            }
          }
        },
        series: [
          {
            type: 'column',
            name: 'Strong Buy',
            data: seriesData.map((data: any) => data.y[0]),
            color: '#1A6334'
          },
          {
            type: 'column',
            name: 'Buy',
            data: seriesData.map((data: any) => data.y[1]),
            color: '#25AF51'
          },
          {
            type: 'column',
            name: 'Hold',
            data: seriesData.map((data: any) => data.y[2]),
            color: '#B17E29'
          },
          {
            type: 'column',
            name: 'Sell',
            data: seriesData.map((data: any) => data.y[3]),
            color: '#F15053'
          },
          {
            type: 'column',
            name: 'Strong Sell',
            data: seriesData.map((data: any) => data.y[4]),
            color: '#752B2C'
          }
        ],
        credits: {
          enabled: false
        },
      };
      this.isLoading7 = false;
    } catch (error) {
      console.error("Failed to fetch and update chart data for query:", query, error);
      this.isLoading7 = false;
    }
  }

  async fetchAndUpdateChartData4(query: string): Promise<void> {
    this.isLoading8 = true;
    try {
      const url_earn = `${this.baseURL}/api/earn/${query}`;
      const response = await lastValueFrom(this.dataService.fetchData(url_earn));
    
      // Extract the data for the chart
      const categories = response.map((item: any) => item.period);
      const actuals = response.map((item: any) => ({
        y: item.actual || 0,
        surprisePercent: item.surprise ? item.surprise : null 
      }));
      const estimates = response.map((item: any) => item.estimate || 0);
      const surprises = response.map((point: any) => point.surprise);

      this.chartOptions4 = {
        exporting: { enabled: false },
        chart: {
          type: 'line',
          backgroundColor: '#F6F6F6'
        },
        title: {
          text: 'Historical EPS Surprises'
        },
        xAxis: {
          categories: categories,
          labels: {
              formatter: function () {
                  const index = this.pos;
                  const surpriseValue = surprises[index];
                  return `<div style="display: flex; flex-direction: column; align-items: center;">` +
          `<div>${this.value}</div>` +
          `<div>Surprise: ${surpriseValue.toFixed(4)}</div>` +
          `</div>`;
              },
              useHTML: true
          },
      },
        yAxis: {
          title: {
            text: 'Quarterly EPS'
          },
        },
        series: [{
          type: 'line',
          name: 'Actual',
          data: actuals,
          dataLabels: {
            enabled: false 
          }
        }, {
          type: 'line',
          name: 'Estimate',
          data: estimates,
          dataLabels: {
            enabled: false 
          }
        }],
        tooltip: {
          shared: true,
          pointFormatter: function () {
            const point = this as any; 
            return `<span style="color:${point.color}">${point.series.name}</span>: <b>${point.y}</b>` +
                  (point.surprisePercent ? ` (Surprise: ${point.surprisePercent}%)` : '') + '<br/>';
          },
          valueDecimals: 2
        },
        plotOptions: {
          series: {
            label: {
              connectorAllowed: false
            },
            dataLabels: {
              enabled: true,
              formatter: function () {
                const index = this.point.index;
                const surpriseValue = surprises[index];
                return `Surprise: ${surpriseValue.toFixed(4)}`;
              },
              y: 18,
              align: 'center',
              verticalAlign: 'bottom'
            }
          }
        },
        credits: {
          enabled: false
        },
      };
      this.isLoading8 = false;
    } catch (error) {
      console.error("Failed to fetch and update chart data for query:", query, error);
      this.isLoading8 = false;
    }
  }

} // END CLASS
