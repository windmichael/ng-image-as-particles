import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NgImageAsParticlesModule } from 'projects/ng-image-as-particles/src/public-api';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgImageAsParticlesModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
