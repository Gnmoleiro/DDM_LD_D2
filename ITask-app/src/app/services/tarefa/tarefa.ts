import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment.prod';

export interface CriarTarefa {
  message: string;
}

export interface TarefaMessage {
  message: string;
}

export interface GetAllTarefas {
  tituloTarefa: string;
  ordemExecucao: number;
  dataConclusao?: string;
}

export interface TarefaDetalhada {
  tituloTarefa: string;
  descricao: string;
  ordemExecucao: number;
  dataPrevistaInicio: string;
  dataPrevistaFim: string;
}

@Injectable({
  providedIn: 'root',
})
export class Tarefa {
  constructor(private http: HttpClient) { }

  /**
   * Cria uma nova tarefa, exige autenticação.
   * @param titulo O título da tarefa.
   * @param descricao A descrição detalhada da tarefa.
   * @param dataConclusao A data prevista para conclusão da tarefa.
   * @returns Um Observable contendo a mensagem de sucesso da criação.
   */
  
  criar_tarefa(titulo: string, descricao: string, dataConclusao: string): Observable<CriarTarefa> {
    const token = localStorage.getItem('token');
    return this.http.post<CriarTarefa>(
      `${environment.apiUrl}/criar_tarefa`,
      { titulo, descricao, dataConclusao },
      { headers: { Authorization: `Bearer ${token}` } }
    );
  }
}
