import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment.prod';

export interface UserRole{
  role: string;
}

export interface ChangePassword{
  message: string;
}

export interface UserInfo{
  email: string,
  nome: string
}

@Injectable({
  providedIn: 'root'
})
export class User {
  constructor (private http: HttpClient){}

  user_role(): Observable<UserRole>{
    const token = localStorage.getItem("token");
    return this.http.get<UserRole>(`${environment.apiUrl}/user-role`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  change_password(password: string, confPassword: string): Observable<ChangePassword>{
    const token = localStorage.getItem("token");
    return this.http.post<ChangePassword>(`${environment.apiUrl}/change_password`, 
      { password, confPassword },
      { headers: { Authorization: `Bearer ${token}` }
    });
  }

  user_data(): Observable<UserInfo>{
    const token = localStorage.getItem("token");
    return this.http.get<UserInfo>(`${environment.apiUrl}/user_data`,
      { headers: { Authorization: `Bearer ${token}` }
    });
  }
}
