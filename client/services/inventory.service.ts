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
    return this.http.delete(`${this.apiUrl}/DeleteInventory/${id}`);
  }

  editInventory(id: number, item: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/EditInventory/${id}`, item);
  }
}
