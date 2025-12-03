import { Component, OnInit, ViewChild } from '@angular/core';
import { LoadingComponent } from "src/app/pages/loading/loading.component";
import { LoadingState } from 'src/app/services/loading-state/loading-state';
import { AsyncPipe, CommonModule } from '@angular/common';
import { OverlayEventDetail } from '@ionic/core';
import { Programador, GetAllProgramadores } from 'src/app/services/programador/programador';
import { 
  IonRow, 
  IonCol, 
  IonGrid, 
  IonButton, 
  IonAlert,
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonContent,
  IonList,
  IonItem,
  IonInput
} from "@ionic/angular/standalone";

@Component({
  selector: 'app-gestor-eliminar-programador',
  templateUrl: './gestor-eliminar-programador.component.html',
  styleUrls: ['./gestor-eliminar-programador.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonButton, 
    IonGrid, 
    IonCol, 
    IonRow, 
    IonAlert,
    IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonContent, IonList, IonItem, IonInput,
    LoadingComponent, 
    AsyncPipe
  ],
})
export class GestorEliminarProgramadorComponent  implements OnInit {
@ViewChild(IonModal) modal!: IonModal;
  
  users: GetAllProgramadores[] = [];
  userToDelete: GetAllProgramadores | null = null;

  isAlertOpen = false;
  alertButtons = ['Confirmar'];
  alertInfo = ["", ""];

  constructor(
    private loadingState: LoadingState, 
    private programadorService: Programador
  ) { }

  public loading$ = this.loadingState.loading$;

  ngOnInit() {
    this.loadingState.setLoadingState(true);
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
        console.log(error.error.error);
      }
    });
  }

  cancel() {
    this.modal.dismiss(null, 'cancel');
  }

  confirm() {
    this.modal.dismiss(null, 'confirm');
  }

  onWillDismiss(event: CustomEvent<OverlayEventDetail>) {
    if (event.detail.role === 'confirm' && this.userToDelete) {
      
      this.loadingState.setLoadingState(true);

      const idParaEliminar = this.userToDelete.idUser;

      this.programadorService.eliminar_programador(idParaEliminar).subscribe({
        next: (res) => {
          this.loadingState.setLoadingState(false);
          
          this.alertInfo[0] = "Sucesso";
          this.alertInfo[1] = res.message || "Programador eliminado com sucesso.";
          this.isAlertOpen = true;

          this.userToDelete = null;
          this.get_all_programadores(); // Atualiza a lista
        },
        error: (error) => {
          this.loadingState.setLoadingState(false);
          
          this.alertInfo[0] = "Erro";
          this.alertInfo[1] = error.error?.error || "Erro ao eliminar o gestor.";
          this.isAlertOpen = true;
          
          this.userToDelete = null;
        }
      });
    }
    else {
      // Se cancelar, apenas limpa a seleção
      this.userToDelete = null;
    }
  }

  setOpen(user: GetAllProgramadores | null) {
    if (user != null){
      this.userToDelete = user;
      this.modal.present();
    } else {
      this.userToDelete = null;
    }
  }
}