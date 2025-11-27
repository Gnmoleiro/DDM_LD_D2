import { Component, OnInit } from '@angular/core';
import { LoadingComponent } from "src/app/pages/loading/loading.component";
import { LoadingState } from 'src/app/services/loading-state/loading-state';
import { AsyncPipe } from '@angular/common';
import { Gestor, GetAllGestores } from 'src/app/services/gestor/gestor';
import { IonRow, 
  IonCol, 
  IonGrid,
  IonButton } from "@ionic/angular/standalone";

@Component({
  selector: 'app-dono-eliminar-gestor',
  templateUrl: './dono-eliminar-gestor.component.html',
  styleUrls: ['./dono-eliminar-gestor.component.scss'],
  standalone: true,
  imports: [IonButton, 
    IonGrid, 
    IonCol, 
    IonRow, 
    LoadingComponent, 
    AsyncPipe],
})
export class DonoEliminarGestorComponent implements OnInit {
  users: GetAllGestores[] = [];
  constructor(private loadingState: LoadingState, private gestorService: Gestor) { }

  public loading$ = this.loadingState.loading$;

  ngOnInit() {
    this.loadingState.setLoadingState(true);

    this.get_all_gestors();
  }


  get_all_gestors(){
    this.gestorService.get_all_gestores().subscribe({
      next: (res) => {
        this.loadingState.setLoadingState(false);
        this.users = res;
      },
      error: (error) => {
        this.loadingState.setLoadingState(false);
        console.log(error.error.error)
      }
    })
  }

  deleteGestor(userToDelete: GetAllGestores) {
    console.clear();
    console.log(userToDelete)
  }
}
