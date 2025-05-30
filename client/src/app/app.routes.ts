import { Routes } from '@angular/router';
import {HomeComponent} from '../../components/home/home.component';
import {LoginComponent} from '../../components/login/login.component';
import {InventoryComponent} from '../../components/inventory/inventory.component';
import {OrdersComponent} from '../../components/orders/orders.component';
import {TransportComponent} from '../../components/transport/transport.component';
import {ReportsComponent} from '../../components/reports/reports.component';

export const routes: Routes = [
  { path: '', component: LoginComponent},
  { path: 'home', component: HomeComponent},
  { path: 'inventory', component: InventoryComponent},
  { path: 'orders', component: OrdersComponent},
  { path: 'transport', component: TransportComponent},
  { path: 'reports', component: ReportsComponent}
];
