import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { importProvidersFrom } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'; 
import {routes} from './app/app.routes';
import { RouterModule } from '@angular/router';


bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom(
      HttpClientModule,
      BrowserAnimationsModule, 
      RouterModule.forRoot(routes) 
    )
  ]
}).catch(err => console.error(err));