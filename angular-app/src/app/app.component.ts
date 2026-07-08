import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TickerService } from './ticker.service';
import { Router, NavigationEnd, Event as RouterEvent } from '@angular/router';
import { filter } from 'rxjs/operators';
import { SearchService } from './search.service'; 
import { SharedService } from './shared-service.service';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  standalone: true,
  imports: [
    RouterModule,
    CommonModule
  ],
})
export class AppComponent implements OnInit {
  title = 'angular-app';

  ticker: string = '';
  activeLink: string = '';
  isActiveSearchRoute: boolean = false;

  constructor(private tickerService: TickerService, private router: Router, private searchService: SearchService, private sharedService: SharedService) {
      this.router.events.pipe(
        filter((event: RouterEvent): event is NavigationEnd => event instanceof NavigationEnd)
      ).subscribe((event: NavigationEnd) => {
        this.isActiveSearchRoute = event.urlAfterRedirects.startsWith('/search') || event.urlAfterRedirects.startsWith('/home/search');
      });
    }

  ngOnInit() {
    this.tickerService.ticker$.subscribe(ticker => {
      if (ticker) {
        this.ticker = ticker.toUpperCase();
      }
    });


  } // end onit

  

  navigateToSearch() {
    if (this.ticker) {
      this.sharedService.setControlValue(this.ticker);
      this.router.navigate(['/search', this.ticker]);
    }
  }

}
