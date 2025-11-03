import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment.prod';

export interface CriarGestor{
  message: string,
  senha_temporaria: string,
}

export interface GetAllGestores{
  idUser: string,
  email: string,
  nome: string,
  departamento: string
}

@Injectable({
  providedIn: 'root'
})
export class Dono {
  constructor (private http: HttpClient){}

  criar_gestor(email: string, nome: string, departamento: string): Observable<CriarGestor>{
    const token = localStorage.getItem("token");
    return this.http.post<CriarGestor>(`${environment.apiUrl}/criar_gestor`, 
      { email, nome, departamento },
      { headers: { Authorization: `Bearer ${token}` }
    });
  }

  get_all_gestores(): Observable<GetAllGestores>{
    const token = localStorage.getItem("token");
    return this.http.get<GetAllGestores>(`${environment.apiUrl}/get_all_gestores`,
      { headers: { Authorization: `Bearer ${token}` }
    })
  }
}
