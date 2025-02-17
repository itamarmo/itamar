import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {Inventory, InventoryMovement, OrderRequest, Transport} from '../components/reports/reports.component';

@Injectable({
  providedIn: 'root'
})
export class ReportsService {
  private readonly baseUrl = 'http://localhost:8000'; // Replace with your actual API base URL

  constructor(private http: HttpClient) {}

  getCurrentInventory(): Observable<Inventory[]> {
    return this.http.get<Inventory[]>(`${this.baseUrl}/GetInventory`);
  }

  getOrderRequests(startDate: string, endDate: string): Observable<OrderRequest[]> {
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);
    return this.http.get<OrderRequest[]>(`${this.baseUrl}/GetOrdersByDate`, { params });
  }

  getTransportStatus(): Observable<Transport[]> {
    return this.http.get<Transport[]>(`${this.baseUrl}/GetTransports`);
  }

  getInventoryMovements(): Observable<InventoryMovement[]> {
    return this.http.get<InventoryMovement[]>(`${this.baseUrl}/GetInventoryMovements`);
  }
}
