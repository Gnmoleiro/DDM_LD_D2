import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment.prod';

export interface LoginResponse {
  message: string;
  access_token: string;
}

export interface UserIsAuth{
  auth: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class Auth {
  constructor(private http: HttpClient){}

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${environment.apiUrl}/login`, { email, password });
  }

  user_auth(): Observable<UserIsAuth>{
    let token = localStorage.getItem("token");
    return this.http.get<UserIsAuth>(`${environment.apiUrl}/user-is-auth`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }
}
