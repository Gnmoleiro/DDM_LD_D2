import { Component, OnInit } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { LoadingState } from 'src/app/services/loading-state/loading-state';
import {  GetAllProgramadores, GetAllProgramadoresAndGestores, Programador } from 'src/app/services/programador/programador';
import { LoadingComponent } from "src/app/pages/loading/loading.component";
import { IonGrid, IonRow, IonCol, IonButton } from "@ionic/angular/standalone";
import { User } from 'src/app/services/user/user';

@Component({
  selector: 'app-dono-programador',
  templateUrl: './dono-programador.component.html',
  styleUrls: ['./dono-programador.component.scss'],
  standalone: true,
  imports: [IonButton, IonCol, IonRow, IonGrid, AsyncPipe, LoadingComponent],
})
export class DonoProgramadorComponent  implements OnInit {
    btnIsDisabled: boolean = true;
    gestores: GetAllProgramadoresAndGestores[] = [];
    programadores: GetAllProgramadores[] = [];
    isViewingProgramadores: boolean = false;
    gestorViewId = "";
    public loading$ = this.loadingState.loading$;
    
    constructor(
      private programadorService: Programador,
      private userService: User,
      private loadingState: LoadingState,
      ) 
    { }
  
    ngOnInit() {
      this.isViewingProgramadores = false;
      this.puxarDados();
    }
    
    puxarDados(){
      this.btnIsDisabled = true;
      this.loadingState.setLoadingState(true);
      this.programadorService.get_all_programadores_and_gestores().subscribe({
        next: (data) => {
          this.gestores = data;
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
      this.btnIsDisabled = false;
      this.programadores = this.gestores.find(g => g.gestor.idUser === this.gestorViewId)?.programadores || [];
    }

    voltarBtn() {
      this.isViewingProgramadores = false;
      this.btnIsDisabled = true;
      this.puxarDados();
    }

    resetarPassword(idUser: string) {
      this.userService.reset_password(idUser).subscribe({
        next: (data) => {
          alert(data.message);
        },
        error: (error) => {
          console.error('There was an error!', error.error.error);
          alert('Erro ao resetar a password. Tente novamente mais tarde.');
        }
      });
    }
}
