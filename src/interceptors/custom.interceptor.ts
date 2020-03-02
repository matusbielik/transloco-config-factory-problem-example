import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ConfigService } from '@ngx-config/core';
import { TranslocoService } from '@ngneat/transloco';

export class HttpError extends Error {
  constructor(message: string) {
    super(message);

    this.name = 'HttpError';
  }
}

@Injectable({ providedIn: 'root' })
export class CustomHttpInterceptor implements HttpInterceptor {

  constructor(
    private readonly config: ConfigService,
    private readonly translate: TranslocoService
  ) {
    console.log('getActiveLang', this.translate);
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(this._prepareRequest(request));
  }

  private _prepareRequest(request: HttpRequest<any>): HttpRequest<any> {
    const isI18nRequest: boolean = request.url.endsWith('translations.json');
    const isConfigRequest: boolean = request.url.endsWith('config.json');

    if (isConfigRequest) {
      return this._getConfigRequest(request);
    }

    if (isI18nRequest) {
      return this._getI18nRequest(request);
    }

    return this._getRequestWithLangHeader(request);
  }

  private _getConfigRequest(request: HttpRequest<any>): HttpRequest<any> {
    return request.clone({
      setParams: {
        t: Date.now().toString()
      },
      setHeaders: {
        Accept: 'application/json'
      }
    });
  }

  private _getI18nRequest(request: HttpRequest<any>): HttpRequest<any> {
    return request.clone({
      url: request.url.replace('{lang}', this.config.getSettings('market.code', '')),
      setParams: {
        t: Date.now().toString()
      },
      setHeaders: {
        Accept: 'application/json'
      }
    });
  }

  private _getRequestWithLangHeader(request: HttpRequest<any>): HttpRequest<any> {
    return request.clone({setParams: {
        t: Date.now().toString()
      },
      setHeaders: {
        Accept: 'application/json',
        'X-App-Language' : this.translate.getActiveLang()
      }
    });
  }
}
