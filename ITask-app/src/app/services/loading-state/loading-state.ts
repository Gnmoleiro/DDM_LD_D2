import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoadingState {
  /**
   * BehaviorSubject privado que armazena o estado atual de carregamento (true/false).
   * Inicia em 'false'.
   */
  private isLoading = new BehaviorSubject<boolean>(false);

  /**
   * Observable público para que os componentes possam se inscrever
   * e reagir às mudanças do estado de carregamento.
   */
  loading$: Observable<boolean> = this.isLoading.asObservable();

  /**
   * Obtém o valor atual síncrono do estado de carregamento.
   * Não requer inscrição.
   * @returns O estado de carregamento atual (true se estiver carregando, false caso contrário).
   */
  getCurrentLoadingState(): boolean {
    return this.isLoading.value;
  }

  /**
   * Define e emite o novo estado de carregamento para todos os subscritores.
   * @param newLoading O novo estado: true para começar a carregar, false para parar.
   */
  setLoadingState(newLoading: boolean): void {
    this.isLoading.next(newLoading);
  }
}