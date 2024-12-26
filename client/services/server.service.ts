import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {map, Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ServerService {
  baseUrl: string = "http://localhost:8000";

  constructor(private http: HttpClient) {
  }

  login(username: string, password: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.baseUrl}/login/${username}/${password}`).pipe(
      map((response) => {
        return response;
      })
    )
  }
}
