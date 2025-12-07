import { Component, OnInit, ViewChild } from '@angular/core';
import { LoadingComponent } from "src/app/pages/loading/loading.component";
import { LoadingState } from 'src/app/services/loading-state/loading-state';
import { AsyncPipe, CommonModule } from '@angular/common';
import { Gestor, GetAllGestores } from 'src/app/services/gestor/gestor';
import { OverlayEventDetail } from '@ionic/core';
import {
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
  IonInput, 
  IonCard, 
  IonCardContent, IonLabel } from "@ionic/angular/standalone";

@Component({
  selector: 'app-dono-eliminar-gestor',
  templateUrl: './dono-eliminar-gestor.component.html',
  styleUrls: ['./dono-eliminar-gestor.component.scss'],
  standalone: true,
  imports: [IonLabel, 
    IonCardContent, 
    IonCard, 
    CommonModule,
    IonButton,
    IonAlert,
    IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonContent, IonList, IonItem, IonInput,
    LoadingComponent, 
    AsyncPipe
  ],
})
export class DonoEliminarGestorComponent implements OnInit {
  @ViewChild(IonModal) modal!: IonModal;
  
  users: GetAllGestores[] = [];
  userToDelete: GetAllGestores | null = null;

  isAlertOpen = false;
  alertButtons = ['Confirmar'];
  alertInfo = ["", ""];

  constructor(
    private loadingState: LoadingState, 
    private gestorService: Gestor
  ) { }

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

      this.gestorService.eliminar_gestor(idParaEliminar).subscribe({
        next: (res) => {
          this.loadingState.setLoadingState(false);
          
          this.alertInfo[0] = "Sucesso";
          this.alertInfo[1] = res.message || "Gestor eliminado com sucesso.";
          this.isAlertOpen = true;

          this.userToDelete = null;
          this.get_all_gestors(); // Atualiza a lista
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

  setOpen(user: GetAllGestores | null) {
    if (user != null){
      this.userToDelete = user;
      this.modal.present();
    } else {
      this.userToDelete = null;
    }
  }
}