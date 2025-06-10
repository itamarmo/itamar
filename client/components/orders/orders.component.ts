import { Component } from '@angular/core';
import {OrderRequest, OrdersService} from '../../services/orders.service';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {CommonModule, NgForOf} from '@angular/common';
import {MatInputModule} from '@angular/material/input';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {BrowserModule} from '@angular/platform-browser';
import {map, Observable, startWith} from 'rxjs';
import { FormControl } from '@angular/forms';
import {InventoryService} from '../../services/inventory.service';
import {Inventory} from '../reports/reports.component';

@Component({
  selector: 'app-orders',
  imports: [
    FormsModule,
    NgForOf,
    CommonModule,
    ReactiveFormsModule,
    MatAutocompleteModule,
    MatInputModule
  ],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.css'
})
export class OrdersComponent {
  previousRequests: OrderRequest[] = [];
  inventory: any[] = [];
  productName = '';
  SKU = '';
  quantity: number | null = null;
  supplier = '';
  location = '';
  notes = '';
  locations = ['מגידו', 'קדמה'];
  myControl = new FormControl();
  SKUOptions: string[] = [];
  filteredOptions!: Observable<string[]>;

  constructor(private orderService: OrdersService, private inventoryService: InventoryService) {}

  ngOnInit(): void {
    this.loadPreviousRequests();
    this.loadInventory();
    this.filteredOptions = this.myControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value))
    );
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.SKUOptions.filter(option => option.toLowerCase().includes(filterValue));
  }

  loadPreviousRequests() {
    this.orderService.getRequests().subscribe({
      next: (requests) => {
        this.previousRequests = requests;
      },
      error: (err) => {
        console.error('Failed to load requests', err);
      },
    });
  }

  loadInventory(){
    this.inventoryService.getInventory().subscribe({
      next: (inventory) => {
        this.inventory = inventory;
        this.SKUOptions = inventory.map(i => i.SKU);
      },
      error: (err) => {
        console.error('Failed to load requests', err);
      },
    });
  }

  createOrderRequest() {
    if (!this.productName || !this.SKU || !this.quantity || !this.supplier || !this.location) {
      alert('יש למלא את כל השדות פרט לשדה הערות.');
      return;
    }

    const newRequest: OrderRequest = {
      ProductName: this.productName,
      SKU: this.SKU,
      Quantity: this.quantity!,
      SupplierName: this.supplier,
      LocationName: this.location,
      Notes: this.notes,
    };

    this.orderService.addRequest(newRequest).subscribe({
      next: (response) => {
        this.previousRequests.push(response);
        this.resetForm();
      },
      error: (err) => {
        console.error('Failed to create request', err);
      },
    });
  }

  copyToEmail() {
    const newRequest: OrderRequest = {
      ProductName: this.productName,
      SKU: this.SKU,
      Quantity: this.quantity!,
      SupplierName: this.supplier,
      LocationName: this.location,
      Notes: this.notes,
    };

    const orderRequestJson = JSON.stringify(newRequest);

    navigator.clipboard.writeText(orderRequestJson).then(() => {
      alert('הבקשה הועתקה למייל.');
    });
  }

  resetForm() {
    this.productName = '';
    this.SKU = '';
    this.quantity = null;
    this.supplier = '';
    this.location = '';
    this.notes = '';
  }

  openEmailClient() {
    const newRequest: OrderRequest = {
      ProductName: this.productName,
      SKU: this.SKU,
      Quantity: this.quantity!,
      SupplierName: this.supplier,
      LocationName: this.location,
      Notes: this.notes,
    };

    const orderRequestJson = JSON.stringify(newRequest);
    window.location.href = `mailto:?subject=בקשה להזמנת רכש&body=${encodeURIComponent(orderRequestJson)}`;
  }

  skuSelected(event : any){
    this.SKU = event.option.value;
    this.productName = this.inventory.find(i => i.SKU == this.SKU).ProductName;
  }
}
