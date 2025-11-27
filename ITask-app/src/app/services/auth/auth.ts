import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment.prod';

/**
 * Representa a resposta bem-sucedida da operação de login.
 * Contém o token de acesso e um indicador para alteração de senha.
 */
export interface LoginResponse {
  message: string;
  access_token: string;
  change_password: boolean;
}

/**
 * Representa o resultado da validação do token de autenticação.
 */
export interface UserIsAuth{
  auth: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class Auth {
  constructor(private http: HttpClient){}

  /**
   * Autentica o utilizador através de email e palavra-passe.
   * @param email O email fornecido pelo utilizador.
   * @param password A palavra-passe fornecida pelo utilizador.
   * @returns Um Observable com o token de acesso e o status de alteração de senha.
   */
  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${environment.apiUrl}/login`, { email, password });
  }

  /**
   * Verifica a validade do token de autenticação do utilizador, exige autenticação.
   * @returns Um Observable com um boolean que indica se o token é válido (`auth: true/false`).
   */
  user_auth(): Observable<UserIsAuth>{
    const token = localStorage.getItem("token");
    return this.http.get<UserIsAuth>(`${environment.apiUrl}/user-is-auth`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }
}