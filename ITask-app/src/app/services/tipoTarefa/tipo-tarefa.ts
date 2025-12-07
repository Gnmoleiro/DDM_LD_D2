import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment.prod';

export interface TipoTarefaItem{
  idTipoTarefa: string;
  nome: string;
}

export interface TipoTarefaResponse{
  message: string;
}

@Injectable({
  providedIn: 'root',
})
export class TipoTarefa {
  constructor (private http: HttpClient){}
  
  /**
   * Cria um novo tipo de tarefa na aplicação, exige autenticação.
   * @param nome O nome do tipo de tarefa a ser criado.
   * @returns Um Observable com a resposta da criação do tipo de tarefa.
   */
  criarTarefa(nome: string): Observable<TipoTarefaResponse>{
    const token = localStorage.getItem("token");
    return this.http.post<TipoTarefaResponse>(`${environment.apiUrl}/criar_tipo_tarefa`,
      { nome: nome },
      { headers: { Authorization: `Bearer ${token}` }}
    )
  }

  /**
   * Edita um tipo de tarefa existente na aplicação, exige autenticação.
   * @param idTipoTarefa O ID do tipo de tarefa a ser editado.
   * @param nome O novo nome do tipo de tarefa.
   * @returns Um Observable com a resposta da edição do tipo de tarefa.
   */
  editarTarefa(idTipoTarefa: string, nome: string): Observable<TipoTarefaResponse>{
    const token = localStorage.getItem("token");
    return this.http.post<TipoTarefaResponse>(`${environment.apiUrl}/editar_tipo_tarefa`,
      { idTipoTarefa: idTipoTarefa, nome: nome },
      { headers: { Authorization: `Bearer ${token}` }}
    )
  }

  /**
   * Obtém todos os tipos de tarefas disponíveis na aplicação, exige autenticação.
   * @returns Um Observable com um array de objetos TipoTarefaItem.
   */
  getAllTipoTarefas(): Observable<TipoTarefaItem[]>{
    const token = localStorage.getItem("token");
    return this.http.get<TipoTarefaItem[]>(`${environment.apiUrl}/get_all_tipo_tarefa`,
      { headers: { Authorization: `Bearer ${token}` }}
    )
  }
}
