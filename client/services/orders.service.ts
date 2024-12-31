import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';


export interface OrderRequest {
  ProductName: string;
  SKU: string;
  Quantity: number;
  SupplierName: string;
  LocationName: string;
  Notes: string;
}

@Injectable({
  providedIn: 'root'
})
export class OrdersService {

  private baseUrl = 'http://localhost:8000'; // Replace with your server's API URL

  constructor(private http: HttpClient) {}

  // Get all previous requests
  getRequests(): Observable<OrderRequest[]> {
    return this.http.get<OrderRequest[]>(`${this.baseUrl}/GetOrders`);
  }

  // Add a new order request
  addRequest(order: OrderRequest): Observable<OrderRequest> {
    return this.http.post<OrderRequest>(`${this.baseUrl}/AddOrder`, order);
  }

  // Copy request for email (optional logic here if needed on the server-side)
  copyToEmail(order: OrderRequest): Observable<any> {
    return this.http.post(`${this.baseUrl}/email`, order);
  }
}
