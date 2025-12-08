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
  
  criarTarefa(titulo: string, descricao: string, ordemExecucao: number, storyPoints: number, estadoTarefa: string, dataPrevistaInicio: string, 
    dataPrevistaTermino: string, dataRealInicio: string, dataRealTermino: string): Observable<CriarTarefa> {
    const token = localStorage.getItem('token');
    return this.http.post<CriarTarefa>(
      `${environment.apiUrl}/criar_tarefa`,
      { titulo, descricao, ordemExecucao, storyPoints, estadoTarefa, dataPrevistaInicio, dataPrevistaTermino, dataRealInicio, dataRealTermino },
      { headers: { Authorization: `Bearer ${token}` } }
    );
  }
}
