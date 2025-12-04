import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment.prod';
export interface TipoTarefaItem{
  tarefa: string;
}

@Injectable({
  providedIn: 'root',
})
export class TipoTarefa {
  constructor (private http: HttpClient){}
  
  /**
   * Obtém todos os tipos de tarefas disponíveis na aplicação, exige autenticação.
   * @returns Um Observable com um array de objetos TipoTarefaItem.
   */
  get_all_tipo_tarefa(): Observable<TipoTarefaItem[]>{
    const token = localStorage.getItem("token");
    return this.http.get<TipoTarefaItem[]>(`${environment.apiUrl}/get_all_tipo_tarefa`,
      { headers: { Authorization: `Bearer ${token}` }}
    )
  }
}
