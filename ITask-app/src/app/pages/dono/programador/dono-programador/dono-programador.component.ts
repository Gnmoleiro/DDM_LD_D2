import { Component, OnInit } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { LoadingState } from 'src/app/services/loading-state/loading-state';
import {  GetAllProgramadores, GetAllProgramadoresAndGestores, Programador } from 'src/app/services/programador/programador';
import { LoadingComponent } from "src/app/pages/loading/loading.component";
import { IonGrid, IonRow, IonCol, IonButton, IonCard, IonCardContent, IonItem, IonLabel, AlertController, IonInput } from "@ionic/angular/standalone";
import { User } from 'src/app/services/user/user';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-dono-programador',
  templateUrl: './dono-programador.component.html',
  styleUrls: ['./dono-programador.component.scss'],
  standalone: true,
  imports: [IonLabel, IonCardContent, IonCard, IonButton, AsyncPipe, LoadingComponent, IonItem, IonGrid, IonRow, IonCol, FormsModule, IonInput],
})
export class DonoProgramadorComponent  implements OnInit {
    btnIsDisabled: boolean = true;
    gestores: GetAllProgramadoresAndGestores[] = [];
    programadores: GetAllProgramadores[] = [];
    isViewingProgramadores: boolean = false;
    gestorViewId = "";
    public loading$ = this.loadingState.loading$;
    
    searchTerm: string = '';

    constructor(
      private programadorService: Programador,
      private userService: User,
      private loadingState: LoadingState,
      private alertController: AlertController
      ) 
    { }
  
    ngOnInit() {
      this.isViewingProgramadores = false;
      this.puxarDados();
    }
    
    get filteredGestores(): GetAllProgramadoresAndGestores[] {
      if (!this.searchTerm.trim()) {
        return this.gestores;
      }

      return this.gestores.filter(user =>
        user.gestor.nome.toLowerCase().includes(this.searchTerm.toLowerCase()) || user.gestor.email.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }

    get filteredProgramadores(): GetAllProgramadores[] {
      if (!this.searchTerm.trim()) {
        return this.programadores;
      }

      return this.programadores.filter(user =>
        user.nome.toLowerCase().includes(this.searchTerm.toLowerCase()) || user.email.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
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
      this.searchTerm = '';
    }

    voltarBtn() {
      this.isViewingProgramadores = false;
      this.btnIsDisabled = true;
      this.searchTerm = '';
      this.puxarDados();
    }

    async presentAlert(header: string, message: string) {
      const alert = await this.alertController.create({
        header: header,
        message: message,
        buttons: ['Confirmar'],
      });

      await alert.present();
    }

    resetarPassword(idUser: string) {
      this.userService.reset_password(idUser).subscribe({
        next: (data) => {
          this.presentAlert("Sucesso", data.message);
        },
        error: (error) => {
          this.presentAlert("Erro", error.error.error);
        }
      });
    }
}