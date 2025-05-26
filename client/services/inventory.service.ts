// inventory.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class InventoryService {
  private apiUrl = 'http://localhost:8000';

  constructor(private http: HttpClient) {}

  getInventory(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/GetInventory`);
  }

  addInventory(item: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/AddInventory`, item);
  }

  deleteInventory(id: number): Observable<any> {
    //return this.http.delete(`${this.apiUrl}/DeleteInventory/${id}`);
	return this.http.post<any>(`${this.apiUrl}/DeleteInventory`, {
      ProductID: id
    });
  }

  editInventory(item: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/EditInventory`, {
      ProductName: item.ProductName,
      SKU: item.SKU,
      Quantity: item.Quantity,
      Location: item.ItemLocation,
      LastUpdatedDate: item.LastUpdatedDate?.toISOString().split('T')[0],
      ExpiryDate: item.ExpiryDate?.toISOString().split('T')[0],
      Notes: item.Notes
    });
  }
}
