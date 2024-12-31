import { Component } from '@angular/core';
import {OrderRequest, OrdersService} from '../../services/orders.service';
import {FormsModule} from '@angular/forms';
import {NgForOf} from '@angular/common';

@Component({
  selector: 'app-orders',
  imports: [
    FormsModule,
    NgForOf
  ],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.css'
})
export class OrdersComponent {
  previousRequests: OrderRequest[] = [];
  productName = '';
  SKU = '';
  quantity: number | null = null;
  supplier = '';
  location = '';
  notes = '';
  locations = ['מגידו', 'קדמה'];

  constructor(private orderService: OrdersService) {}

  ngOnInit(): void {
    this.loadPreviousRequests();
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
}
