import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {LoginComponent} from '../../components/login/login.component';
import {InventoryComponent} from '../../components/inventory/inventory.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'client';
}
