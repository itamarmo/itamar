import { Component } from '@angular/core';
import {InventoryComponent} from '../inventory/inventory.component';
import {CommonModule} from '@angular/common';

@Component({
  selector: 'app-home',
  imports: [InventoryComponent, CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {

}
