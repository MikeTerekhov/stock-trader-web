import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeSearchComponent } from './home-search/home-search.component';
import { PortfolioComponent } from './portfolio/portfolio.component';
import { WatchlistComponent } from './watchlist/watchlist.component';
import { SearchComponent } from './search/search.component';

export const routes: Routes = [
  { path: 'home/search', component: HomeSearchComponent },
  { path: '', redirectTo: '/home/search', pathMatch: 'full' },
  { path: 'watchlist', component: WatchlistComponent },
  { path: 'portfolio', component: PortfolioComponent },
  { path: 'search/:query', component: SearchComponent },
  { path: '**', redirectTo: '/home/search', pathMatch: 'full' }
  // other routes...
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
