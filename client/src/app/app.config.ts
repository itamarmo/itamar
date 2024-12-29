import {ApplicationConfig, provideZoneChangeDetection} from '@angular/core';
import {provideRouter} from '@angular/router';

import {routes} from './app.routes';
import {provideHttpClient} from '@angular/common/http';
import {LoginComponent} from '../../components/login/login.component';
import {bootstrapApplication} from '@angular/platform-browser';
import {HomeComponent} from '../../components/home/home.component';
import {InventoryComponent} from '../../components/inventory/inventory.component';
import {AppComponent} from './app.component';

export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({eventCoalescing: true}),
    provideRouter(routes), provideHttpClient(),
    provideRouter([{ path: 'Login', component: LoginComponent }]),
    provideRouter([{ path: 'Home', component: HomeComponent }]),
    provideRouter([{ path: 'inventory', component: InventoryComponent }])]
};

bootstrapApplication(AppComponent, {
  providers: [provideRouter(routes)]
}).catch(err => console.error(err));

bootstrapApplication(LoginComponent, appConfig).catch((err) =>
  console.error(err)
);

bootstrapApplication(HomeComponent, appConfig).catch((err) =>
  console.error(err)
);

bootstrapApplication(InventoryComponent, appConfig).catch((err) =>
  console.error(err)
);
