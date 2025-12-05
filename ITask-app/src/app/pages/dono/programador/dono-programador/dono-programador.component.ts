import { Component, OnInit } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { LoadingState } from 'src/app/services/loading-state/loading-state';
import {  GetAllProgramadoresAndGestores, Programador } from 'src/app/services/programador/programador';
import { LoadingComponent } from "src/app/pages/loading/loading.component";
import { IonGrid, IonRow, IonCol, IonButton } from "@ionic/angular/standalone";

@Component({
  selector: 'app-dono-programador',
  templateUrl: './dono-programador.component.html',
  styleUrls: ['./dono-programador.component.scss'],
  standalone: true,
  imports: [IonButton, IonCol, IonRow, IonGrid, AsyncPipe, LoadingComponent],
})
export class DonoProgramadorComponent  implements OnInit {
  constructor(
      private programadorService: Programador,
      private loadingState: LoadingState
      ) 
      { }
  
    programadores: GetAllProgramadoresAndGestores[] = [];
    isViewingProgramadores: boolean = false;
    gestorViewId = "";
    public loading$ = this.loadingState.loading$;
  
    ngOnInit() {
      this.isViewingProgramadores = false;
      this.loadingState.setLoadingState(true);
      this.programadorService.get_all_programadores_and_gestores().subscribe({
        next: (data) => {
          this.programadores = data;
          this.loadingState.setLoadingState(false);
        },
        error: (error) => {
          console.error('There was an error!', error.error.error);
          this.loadingState.setLoadingState(false);
        }
      });
    }
    
    setOpen(programador: GetAllProgramadoresAndGestores) {
      this.gestorViewId = programador.gestor.idUser;
      this.isViewingProgramadores = true;
    }
}
