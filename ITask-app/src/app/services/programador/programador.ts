import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment.prod';

/**
 * Interface para a resposta da criação de um novo programador.
 */
export interface CriarProgramador {
  message: string,
  senha_temporaria: string,
}

/**
 * Interface para a resposta da edição de um programador.
 */
export interface ProgramadorMessage {
  message: string
}

/**
 * Interface para os dados de cada programador retornados na listagem.
 */
export interface GetAllProgramadores {
  idUser: string,
  email: string,
  nome: string,
  nivelExperiencia: string
}

/**
 * Interface para os dados de cada gestor e do seus respetivos programadores retornados na listagem.
 */
export interface GetAllProgramadoresAndGestores {
  gestor: {
    idUser: string,
    email: string,
    nome: string,
    departamento: string
  },
  programadores: GetAllProgramadores[]
}

@Injectable({
  providedIn: 'root'
})
export class Programador {
  constructor(private http: HttpClient) { }

  /**
   * Cria um novo gestor, exige autenticação.
   * @param email O endereço de email do novo gestor.
   * @param nome O nome completo do gestor.
   * @param nivelExperiencia O Nível Experiencia ao qual o gestor será associado.
   * @returns Um Observable contendo a mensagem de sucesso e a senha temporária gerada.
   */
  criarProgramador(email: string, nome: string, nivelExperiencia: string): Observable<CriarProgramador> {
    const token = localStorage.getItem("token");
    return this.http.post<CriarProgramador>(`${environment.apiUrl}/criar_programador`,
      { email, nome, nivelExperiencia },
      { headers: { Authorization: `Bearer ${token}` } }
    );
  }

  /**
   * Obtém uma lista de todos os gestores associados ao utilizador atual, exige autenticação.
   * @returns Um Observable com um array de objetos GetAllProgramadores.
   */
  getAllProgramadores(): Observable<GetAllProgramadores[]> {
    const token = localStorage.getItem("token");
    return this.http.get<GetAllProgramadores[]>(`${environment.apiUrl}/get_all_programadores`,
      { headers: { Authorization: `Bearer ${token}` } }
    )
  }

  /**
   * Obtém uma lista de todos os gestores e os seus respetivos programadores, exige autenticação.
   * @returns Um Observable com um array de objetos GetAllProgramadoresAndGestores.
   */
  getAllProgramadoresAndGestores(): Observable<GetAllProgramadoresAndGestores[]> {
    const token = localStorage.getItem("token");
    return this.http.get<GetAllProgramadoresAndGestores[]>(`${environment.apiUrl}/get_all_programadores_and_gestores`,
      { headers: { Authorization: `Bearer ${token}` } }
    )
  }

  /**
   * Edita os dados de um gestor existente (nome e/ou departamento), exige autenticação.
   * @param id O ID do gestor a ser editado.
   * @param nome O novo nome a ser atribuído.
   * @param nivelExperiencia O novo nível de experiência selecionado.
   * @returns Um Observable com a mensagem de sucesso/erro da operação.
   */
  editProgramador(id: string, nome: string, nivelExperiencia: string): Observable<ProgramadorMessage> {
    const token = localStorage.getItem("token");
    return this.http.post<ProgramadorMessage>(`${environment.apiUrl}/editar_programador`,
      { id, nome, nivelExperiencia },
      { headers: { Authorization: `Bearer ${token}` } }
    )
  }

  eliminarProgramador(id: string): Observable<ProgramadorMessage>{
    const token = localStorage.getItem("token");
    return this.http.post<ProgramadorMessage>(`${environment.apiUrl}/eliminar_programador`,
      { id },
      { headers: { Authorization: `Bearer ${token}` } }
    )
  }
}