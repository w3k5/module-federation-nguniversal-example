import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { RendererModule, TransferHttpCacheModule } from '@nguniversal/common/clover';
import { ModuleFederationModule } from './federation-utils/module-federation.module';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule.withServerTransition({ appId: 'appId' }),
    AppRoutingModule,
    RendererModule.forRoot(),
    TransferHttpCacheModule,
    ModuleFederationModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
