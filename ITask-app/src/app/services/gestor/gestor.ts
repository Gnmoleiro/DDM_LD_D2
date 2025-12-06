import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment.prod';

/**
 * Interface para a resposta da criação de um novo gestor.
 */
export interface CriarGestor {
  message: string,
  senha_temporaria: string,
}

/**
 * Interface para a resposta da edição de um gestor.
 */
export interface GestorMessage {
  message: string
}

/**
 * Interface para os dados de cada gestor retornados na listagem.
 */
export interface GetAllGestores {
  idUser: string,
  email: string,
  nome: string,
  departamento: string
}

@Injectable({
  providedIn: 'root'
})
export class Gestor {
  constructor(private http: HttpClient) { }

  /**
   * Cria um novo gestor, exige autenticação.
   * @param email O endereço de email do novo gestor.
   * @param nome O nome completo do gestor.
   * @param departamento O departamento ao qual o gestor será associado.
   * @returns Um Observable contendo a mensagem de sucesso e a senha temporária gerada.
   */
  criar_gestor(email: string, nome: string, departamento: string): Observable<CriarGestor> {
    const token = localStorage.getItem("token");
    return this.http.post<CriarGestor>(`${environment.apiUrl}/criar_gestor`,
      { email, nome, departamento },
      { headers: { Authorization: `Bearer ${token}` } }
    );
  }

  /**
   * Obtém uma lista de todos os gestores associados ao utilizador atual, exige autenticação.
   * @returns Um Observable com um array de objetos GetAllGestores.
   */
  get_all_gestores(): Observable<GetAllGestores[]> {
    const token = localStorage.getItem("token");
    return this.http.get<GetAllGestores[]>(`${environment.apiUrl}/get_all_gestores`,
      { headers: { Authorization: `Bearer ${token}` } }
    )
  }

  /**
   * Edita os dados de um gestor existente (nome e/ou departamento), exige autenticação.
   * @param id O ID do gestor a ser editado.
   * @param nome O novo nome a ser atribuído.
   * @param departamento O novo departamento selecionado.
   * @returns Um Observable com a mensagem de sucesso/erro da operação.
   */
  edit_gestor(id: string, nome: string, departamento: string): Observable<GestorMessage> {
    const token = localStorage.getItem("token");
    return this.http.post<GestorMessage>(`${environment.apiUrl}/editar_gestor`,
      { id, nome, departamento },
      { headers: { Authorization: `Bearer ${token}` } }
    )
  }

  eliminar_gestor(id: string): Observable<GestorMessage>{
    const token = localStorage.getItem("token");
    return this.http.post<GestorMessage>(`${environment.apiUrl}/eliminar_gestor`,
      { id },
      { headers: { Authorization: `Bearer ${token}` } }
    )
  }
}