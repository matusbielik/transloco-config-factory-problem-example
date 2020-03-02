import { BrowserModule } from '@angular/platform-browser';
import { NgModule, Injectable, ApplicationRef, ComponentRef } from '@angular/core';
import { HttpClient, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';
import { ConfigModule, ConfigLoader, ConfigService } from '@ngx-config/core';
import { ConfigHttpLoader } from '@ngx-config/http-loader';
import { environment } from '../environments/environment';
import { createInputTransfer, removeNgStyles } from '@angularclass/hmr';
import {
  Translation,
  TRANSLOCO_CONFIG,
  TRANSLOCO_LOADER,
  translocoConfig,
  TranslocoConfig,
  TranslocoLoader,
  TranslocoModule,
  TranslocoService
} from '@ngneat/transloco';
import { Observable } from 'rxjs';
/*
 *  INTERCEPTORS
 */
import { CustomHttpInterceptor } from 'src/interceptors/custom.interceptor';


export function configFactory(http: HttpClient): ConfigLoader {
  return new ConfigHttpLoader(http, 'http://cdn.pelikan.sk/app/transloco-minimal-example/market-config.json'); // API ENDPOINT
}

export function customTranslateConfigFactory(config: ConfigService): TranslocoConfig {
  console.log(config.getSettings('market', {}));

  const marketLangs: ReadonlyArray<any> = config.getSettings<ReadonlyArray<any>>('market.languages', []);
  const availableLangs: Array<string> = marketLangs.map((language: any) => language.code);
  const defaultLang: string = marketLangs.reduce((prev: string, curr: any) => curr.default ? curr.code : prev, '');

  console.log({ availableLangs, defaultLang });

  return translocoConfig({
    defaultLang,
    availableLangs,
    failedRetries        : 0,
    reRenderOnLangChange : true,
    fallbackLang         : defaultLang,
    prodMode             : environment.production
  });
}

@Injectable({ providedIn: 'root' })
export class TranslocoHttpLoader implements TranslocoLoader {
  constructor(private readonly http: HttpClient) {}

  private readonly i18nUrl: string = `http://cdn.pelikan.sk/app/transloco-minimal-example/{lang}-translations.json`;

  getTranslation(): Observable<any> {
    return this.http.get<Translation>(this.i18nUrl);
  }
}


@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    AppRoutingModule,
    TranslocoModule,
    HttpClientModule,
    BrowserModule,
    ConfigModule.forRoot({
      provide: ConfigLoader,
      useFactory: (configFactory),
      deps: [HttpClient]
    }),
  ],
  providers: [
    { provide: TRANSLOCO_CONFIG, useFactory: (customTranslateConfigFactory), deps: [ConfigService] },
    { provide: TRANSLOCO_LOADER, useClass: TranslocoHttpLoader, deps: [HttpClient] },
    {
      provide  : HTTP_INTERCEPTORS,
      useClass : CustomHttpInterceptor,
      multi    : true,
      deps: [ConfigService, TranslocoService]
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
