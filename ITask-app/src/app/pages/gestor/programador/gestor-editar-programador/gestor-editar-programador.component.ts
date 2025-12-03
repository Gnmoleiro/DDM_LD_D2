import { Component, OnInit, ViewChild } from '@angular/core';
import { 
  IonGrid, 
  IonRow, 
  IonCol,
  IonButton, IonHeader, IonTitle, IonToolbar, IonContent, IonModal, IonButtons, IonInput, IonList, IonItem, 
  IonSelectOption, IonSelect, IonAlert } from "@ionic/angular/standalone";
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LoadingComponent } from 'src/app/pages/loading/loading.component';
import { LoadingState } from 'src/app/services/loading-state/loading-state';
import { OverlayEventDetail } from '@ionic/core';
import { Programador, GetAllProgramadores } from 'src/app/services/programador/programador';
import { NivelExperiencia, NivelExperienciaItem } from 'src/app/services/nivelExperiencia/nivel-experiencia';

@Component({
  selector: 'app-gestor-editar-programador',
  templateUrl: './gestor-editar-programador.component.html',
  styleUrls: ['./gestor-editar-programador.component.scss'],
  standalone: true,
  imports: [IonAlert, IonItem, IonList, IonInput, IonButtons, IonModal, IonContent, IonToolbar, IonTitle, IonHeader, 
    IonCol,
    IonAlert,
    IonRow, 
    IonGrid,
    IonButton,
    IonSelectOption,
    IonSelect,
    CommonModule,
    FormsModule,
    LoadingComponent]
})
export class GestorEditarProgramadorComponent  implements OnInit {
@ViewChild(IonModal) modal!: IonModal;
  users: GetAllProgramadores[] = [];
  isModalEditOpen: boolean = false;
  userToEdit: GetAllProgramadores | null = null;
  nivelExperiencia: NivelExperienciaItem[] = []

  // VARIAVIES PARA O ALERT
  isAlertOpen = false; // BOOLEAN PARA ABRIR E FECHAR O ALERT
  alertButtons = ['Confirmar']; // BUTOES DO ALERT
  alertInfo = ["", ""] // alertInfo[0] = HEADER DO ALERT, alertInfo[1] = MESSAGE DO ALERT

  constructor(private programadorService: Programador, private nivelExperienciaService: NivelExperiencia,
    private loadingState: LoadingState
  ) { }

  public loading$ = this.loadingState.loading$;

  ngOnInit() {
    this.loadingState.setLoadingState(true);
    this.nivelExperienciaService.get_all_nivel_experiencia().subscribe({
      next: (res) => {
        this.nivelExperiencia = res
      },
      error: (error) => {
        console.log(error.error.error)
      }
    })

    this.get_all_programadores();
  }

  get_all_programadores(){
    this.programadorService.get_all_programadores().subscribe({
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

  cancel() {
    this.modal.dismiss(null, 'cancel');
  }

  confirm() {
    this.modal.dismiss(null, 'confirm');
  } 

  onWillDismiss(event: CustomEvent<OverlayEventDetail>) {
    if (event.detail.role === 'confirm'){
      const idUser = this.userToEdit!.idUser
      const nome = this.userToEdit!.nome
      const nivelExperiencia = this.userToEdit!.nivelExperiencia

      this.userToEdit = null;

      
      this.loadingState.setLoadingState(true);

      this.programadorService.edit_programador(idUser, nome, nivelExperiencia).subscribe({
        next: (res) => {
          this.loadingState.setLoadingState(false);
          this.alertInfo[0] = "Programador atualizado";
          this.alertInfo[1] = res.message;
          this.isAlertOpen = true;

          this.userToEdit = null;

          this.get_all_programadores();
        },
        error: (error) => {
          this.alertInfo[0] = "Erro ao editar programador";
          this.alertInfo[1] = error.error.error;
          this.isAlertOpen = true;

          this.get_all_programadores();
        }
      })
    }
    else if(event.detail.role === 'cancel'){
      this.userToEdit = null;
      this.get_all_programadores();
    }
  }

  setOpen(user: GetAllProgramadores | null) {
    if (user != null && this.nivelExperiencia?.length > 0){
      this.userToEdit = user;

      this.modal.backdropDismiss = false;
      this.modal.present();
    }
    else{
      this.userToEdit = null
    }
  }
}
