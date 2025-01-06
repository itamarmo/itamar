import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TransportService {
  private baseUrl = 'http://localhost:8000'; // Replace with your server's API endpoint

  constructor(private http: HttpClient) {}

  getTransports(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/GetTransports`);
  }

  addVehicle(vehicle: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/AddTransport`, vehicle);
  }

  deleteVehicle(vehicle: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/DeleteTransport`, {
      TransportID: vehicle.TransportID
    });
  }
}
