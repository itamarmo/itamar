import { Routes } from '@angular/router';
import {HomeComponent} from '../../components/home/home.component';
import {LoginComponent} from '../../components/login/login.component';
import {InventoryComponent} from '../../components/inventory/inventory.component';

export const routes: Routes = [
  { path: '', component: LoginComponent},
  { path: 'home', component: HomeComponent},
  { path: 'inventory', component: InventoryComponent}
];
