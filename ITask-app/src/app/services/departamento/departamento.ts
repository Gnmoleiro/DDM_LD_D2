import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment.prod';

export interface DepartamentoItem{
  departamento: string
}

@Injectable({
  providedIn: 'root'
})
export class Departamento {
  constructor (private http: HttpClient){}
  
  get_all_departamentos(): Observable<DepartamentoItem[]>{
    const token = localStorage.getItem("token");
    return this.http.get<DepartamentoItem[]>(`${environment.apiUrl}/get_all_departamentos`,
      { headers: { Authorization: `Bearer ${token}` }}
    )
  }
}
