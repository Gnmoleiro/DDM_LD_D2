import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment.prod';

export interface CriarGestor{
  message: string,
  senha_temporaria: string,
}

@Injectable({
  providedIn: 'root'
})
export class Gestor {
  constructor(private http: HttpClient){}

  criar_gestor(email: string, nome: string, departamento: string): Observable<CriarGestor>{
    const token = localStorage.getItem("token");
    return this.http.post<CriarGestor>(`${environment.apiUrl}/change_password`, 
          { email, nome, departamento },
          { headers: { Authorization: `Bearer ${token}` }
        });
  }
}
