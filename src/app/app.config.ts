import { ApplicationConfig, provideZonelessChangeDetection, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { HttpClientModule, provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { environment } from '../environments/environment';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideZonelessChangeDetection(),
    importProvidersFrom(HttpClientModule),
    provideHttpClient(
      withFetch(),
      withInterceptors([
        (req, next) => {
          // Adjunta Authorization Bearer si existe en localStorage
          const token = localStorage.getItem('accessToken');
          if (token) {
            req = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
          }
          // Asegura withCredentials true para nuestro API
          const isApi = req.url.startsWith(environment.apiUrl);
          if (isApi && !req.withCredentials) {
            req = req.clone({ withCredentials: true });
          }
          return next(req);
        }
      ])
    ),
    provideCharts(withDefaultRegisterables())
  ]
};
