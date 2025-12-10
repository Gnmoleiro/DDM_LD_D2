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

export interface EstadoTarefaResponse {
  estadoTarefa: string;
}

export interface TipoTarefaItem {
  idTipoTarefa: string;
  nome: string;
}

export interface ProgramadorItem {
  idUser: string;
  nome: string;
}

export interface TarefaDetalhada {
  idTarefa: string;
  tituloTarefa: string;
  descricao: string;
  ordemExecucao: number;
  storyPoint: number;
  estadoTarefa: EstadoTarefaResponse;
  dataPrevistaInicio: string;
  dataPrevistaFim: string;
  dataRealInicio?: string;
  dataRealFim?: string;
  dataCriacao: string; 
  tipoTarefa?: TipoTarefaItem;
  programador?: ProgramadorItem;
}

@Injectable({
  providedIn: 'root',
})
export class Tarefa {
  constructor(private http: HttpClient) { }
  
  /**
   * Obtém os estados das tarefas disponíveis.
   * @returns Um Observable que emite uma lista de estados de tarefas.
   */
  getEstadosTarefas(): Observable<EstadoTarefaResponse[]> {
    const token = localStorage.getItem('token');
    return this.http.get<EstadoTarefaResponse[]>(
      `${environment.apiUrl}/estados_tarefa`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
  }

  /**
   * Cria uma nova tarefa com os detalhes fornecidos.
   * @param titulo O título da tarefa.
   * @param descricao A descrição da tarefa.
   * @param ordemExecucao A ordem de execução da tarefa.
   * @param storyPoints Os story points da tarefa.
   * @param estadoTarefa O estado inicial da tarefa.
   * @param dataPrevistaInicio A data prevista de início da tarefa.
   * @param dataPrevistaTermino A data prevista de término da tarefa.
   * @param idProgramador O ID do programador atribuído à tarefa.
   * @param idTipoTarefa O ID do tipo de tarefa.
   * @returns Um Observable que emite a resposta da criação da tarefa.
   */
  criarTarefa(titulo: string, descricao: string, ordemExecucao: number, storyPoints: number, estadoTarefa: string, dataPrevistaInicio: string, 
    dataPrevistaTermino: string, idProgramador: string, idTipoTarefa: string): Observable<CriarTarefa> {
    const token = localStorage.getItem('token');
    return this.http.post<CriarTarefa>(
      `${environment.apiUrl}/criar_tarefa`,
      { titulo, descricao, ordemExecucao, storyPoints, estadoTarefa, dataPrevistaInicio, dataPrevistaTermino, idProgramador, idTipoTarefa },
      { headers: { Authorization: `Bearer ${token}` } }
    );
  }

  editTarefa(idTarefa: string, titulo: string, descricao: string, 
    ordemExecucao: number, storyPoints: number, estadoTarefa: string, 
    dataPrevistaInicio: string, 
    dataPrevistaTermino: string, idProgramador: string, idTipoTarefa: string): Observable<TarefaMessage> {
    const token = localStorage.getItem('token');
    return this.http.post<TarefaMessage>(
      `${environment.apiUrl}/editar_tarefa`,
      { idTarefa, titulo, descricao, ordemExecucao, storyPoints, estadoTarefa, dataPrevistaInicio, dataPrevistaTermino, idProgramador, idTipoTarefa },
      { headers: { Authorization: `Bearer ${token}` } }
    );
  }

  /**
   * Obtém a lista detalhada de tarefas.
   * @returns Um Observable que emite uma lista de tarefas detalhadas.
   */
  getTarefas(): Observable<TarefaDetalhada[]> {
    const token = localStorage.getItem('token');
    return this.http.get<TarefaDetalhada[]>(
      `${environment.apiUrl}/get_tarefas`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
  }
}
