import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReportsService {
  private apiUrl = 'http://localhost:8000';

  constructor(private http: HttpClient) {}

  // Fetch report data
  getReportData(reportType: string, productFilter: string): Observable<any> {
    const url = `${this.apiUrl}/report/${reportType}`;  // Example endpoint
    return this.http.get<any>(url, { params: { productFilter } });
  }

  // Fetch available products list
  getProductList(): Observable<any[]> {
    const url = `${this.apiUrl}/GetInventory/`;  // Example endpoint for fetching products
    return this.http.get<any[]>(url);
  }
}
