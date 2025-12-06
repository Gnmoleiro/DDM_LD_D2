import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment.prod';

/**
 * Representa a resposta da consulta da função (role) do utilizador.
 */
export interface UserRole{
  role: string;
}

/**
 * Interface para a resposta da reset password.
 */
export interface ResetPasswordMessage {
  message: string
}

/**
 * Representa a resposta após uma tentativa de alteração de palavra-passe.
 */
export interface ChangePassword{
  message: string;
}

/**
 * Representa os dados básicos do perfil do utilizador.
 */
export interface UserInfo{
  email: string,
  nome: string,
  empresa: string,
}

@Injectable({
  providedIn: 'root'
})
export class User {
  constructor (private http: HttpClient){}

  /**
   * Obtém a função (role) do utilizador autenticado a partir do servidor.
   * @returns Um Observable que emite o objeto UserRole.
   */
  user_role(): Observable<UserRole>{
    const token = localStorage.getItem("token");
    return this.http.get<UserRole>(`${environment.apiUrl}/user-role`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  /**
   * Envia uma requisição para alterar a palavra-passe do utilizador autenticado.
   * @param password A nova palavra-passe.
   * @param confPassword A confirmação da nova palavra-passe.
   * @returns Um Observable com uma mensagem de sucesso/erro.
   */
  change_password(password: string, confPassword: string): Observable<ChangePassword>{
    const token = localStorage.getItem("token");
    return this.http.post<ChangePassword>(`${environment.apiUrl}/change_password`, 
      { password, confPassword },
      { headers: { Authorization: `Bearer ${token}` }
    });
  }

  /**
   * Obtém os dados do perfil do utilizador autenticado (email, nome, empresa).
   * @returns Um Observable que emite o objeto UserInfo.
   */
  user_data(): Observable<UserInfo>{
    const token = localStorage.getItem("token");
    return this.http.get<UserInfo>(`${environment.apiUrl}/user_data`,
      { headers: { Authorization: `Bearer ${token}` }
    });
  }

  /**
   * Reinicia a palavra-passe de um utilizador, gerando uma nova senha temporária, exige autenticação.
   * @param idGestor O ID do gestor para o qual a palavra-passe será reiniciada.
   * @returns Um Observable com uma mensagem indicando o resultado do reset da senha.
   */
  reset_password(idGestor: string): Observable<ResetPasswordMessage> {
    const token = localStorage.getItem("token");
    return this.http.post<ResetPasswordMessage>(`${environment.apiUrl}/reset_password`,
      { idGestor },
      { headers: { Authorization: `Bearer ${token}` } }
    )
  }
}