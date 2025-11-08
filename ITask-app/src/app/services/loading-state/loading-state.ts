import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoadingState {
  private isLoading = new BehaviorSubject<boolean>(false);

  loading$: Observable<boolean> = this.isLoading.asObservable();

  getCurrentLoadingState(): boolean {
    return this.isLoading.value;
  }

  setLoadingState(newLoading: boolean): void {
    // 3. Emite o novo valor para todos os componentes inscritos.
    this.isLoading.next(newLoading);
  }
}
