import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withFetch()),
    // El sitio se sirve prerenderizado (angular.json → outputMode: "static"). Sin hidratación
    // Angular DESCARTA ese HTML y reconstruye el DOM entero: medido en prod, el <app-root> se
    // vaciaba a los 6,1 s en móvil (LCP 6,4 s, CLS 0,39 en escritorio) y hasta el video ya
    // descargado se volvía a pedir. withEventReplay reproduce los clics hechos antes de que la
    // app quede interactiva, que hasta ahora se perdían.
    provideClientHydration(withEventReplay())
  ]
};
