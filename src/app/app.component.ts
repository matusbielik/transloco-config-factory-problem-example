import { Component } from '@angular/core';
import { TranslocoService } from '@ngneat/transloco';
import { ConfigService } from '@ngx-config/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'transloco-config-factory-problem-example';

  constructor(
    private readonly config: ConfigService,
    private readonly translate: TranslocoService) {
      this._setUpI18n();
  }

  private _setUpI18n(): void {
    const marketCode: string = this.config.getSettings('market.code', '');
    const languages: ReadonlyArray<string> = this.config.getSettings('market.languages', []).map((language: any) => language.code);
    const defaultLang: string = this.config.getSettings('market.languages', [])
      .reduce((prev: string, curr: any) => curr.default ? curr.code : prev, '');

    const availableLangs = this.config.getSettings('market.languages', [])
      .map((language: any) => language.code);

    console.log({ availableLangs, defaultLang });

    this.translate.setAvailableLangs(availableLangs);
    this.translate.setDefaultLang(defaultLang);
    this.translate.setActiveLang(defaultLang);

  }
}
