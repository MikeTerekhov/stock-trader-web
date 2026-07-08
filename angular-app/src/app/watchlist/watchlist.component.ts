import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ProfileService, Favorite } from '../profile.service';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';

@Component({
  selector: 'app-watchlist',
  standalone: true,
  imports: [
    CommonModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './watchlist.component.html',
  styleUrls: ['./watchlist.component.css']
})
export class WatchlistComponent implements OnInit, OnDestroy {
  favorites: Favorite[] = [];
  isLoading: boolean = false;
  private favoritesSub!: Subscription;

  constructor(private profileService: ProfileService, private router: Router) {}

  ngOnInit() {
    this.fetchFavorites();
  }

  fetchFavorites() {
    this.isLoading = true;
    this.favoritesSub?.unsubscribe();

    this.favoritesSub = this.profileService.favorites$.subscribe(favorites => {
      this.favorites = favorites;
      setTimeout(() => {
        this.isLoading = false; 
      }, 1000); 
    });
  }

  navigateToFavorite(ticker: string): void {
    this.router.navigate(['/search', ticker]);
  }

  ngOnDestroy() {
    this.favoritesSub.unsubscribe();
  }

  removeFavorite(ticker: string) {
    this.profileService.removeFavorite(ticker).subscribe(() => {
      console.log(`${ticker} removed from favorites.`);
      this.fetchFavorites(); 
    });
  }
}


