import { Component, OnInit, ViewChild } from '@angular/core';
import { 
  IonGrid, 
  IonRow, 
  IonCol,
  IonButton, IonHeader, IonTitle, IonToolbar, IonContent, IonModal, IonButtons, IonInput, IonList, IonItem, 
  IonSelectOption, IonSelect, IonAlert, IonCard, IonCardContent, IonLabel } from "@ionic/angular/standalone";
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Departamento, DepartamentoItem } from 'src/app/services/departamento/departamento';
import { LoadingComponent } from 'src/app/pages/loading/loading.component';
import { LoadingState } from 'src/app/services/loading-state/loading-state';
import { OverlayEventDetail } from '@ionic/core';
import { Gestor, GetAllGestores } from 'src/app/services/gestor/gestor';
import { User } from 'src/app/services/user/user';

@Component({
  selector: 'app-dono-editar-gestor',
  templateUrl: './dono-editar-gestor.component.html',
  styleUrls: ['./dono-editar-gestor.component.scss'],
  standalone: true,
  imports: [IonLabel, IonCardContent, IonCard, IonAlert, IonItem, IonList, IonInput, IonButtons, IonModal, IonContent, IonToolbar, IonTitle, IonHeader,
    IonAlert,
    IonButton,
    IonSelectOption,
    IonSelect,
    CommonModule,
    FormsModule,
    LoadingComponent]
})
export class DonoEditarGestorComponent  implements OnInit {
  @ViewChild(IonModal) modal!: IonModal;
  users: GetAllGestores[] = [];
  isModalEditOpen: boolean = false;
  userToEdit: GetAllGestores | null = null;
  departamentos: DepartamentoItem[] = []

  // VARIAVIES PARA O ALERT
  isAlertOpen = false; // BOOLEAN PARA ABRIR E FECHAR O ALERT
  alertButtons = ['Confirmar']; // BUTOES DO ALERT
  alertInfo = ["", ""] // alertInfo[0] = HEADER DO ALERT, alertInfo[1] = MESSAGE DO ALERT

  constructor(private gestorService: Gestor, private departamentoService: Departamento,
    private loadingState: LoadingState, private userService: User
  ) { }

  public loading$ = this.loadingState.loading$;

  ngOnInit() {
    this.loadingState.setLoadingState(true);
    this.departamentoService.get_all_departamentos().subscribe({
      next: (res) => {
        this.departamentos = res
      },
      error: (error) => {
        console.log(error.error.error)
      }
    })

    this.geAllGestors();
  }

  geAllGestors(){
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

  reiniciarPassword(){
    this.userService.reset_password(this.userToEdit!.idUser).subscribe({
      next: (res)=>{
          this.alertInfo[0] = "Senha reiniciada";
          this.alertInfo[1] = res.message;
          this.isAlertOpen = true;
      },
      error: (error) => {
        this.alertInfo[0] = "Erro ao reiniciar a senha";
        this.alertInfo[1] = error.error.error;
        this.isAlertOpen = true;
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
      const departamento = this.userToEdit!.departamento

      this.userToEdit = null;

      
      this.loadingState.setLoadingState(true);

      this.gestorService.edit_gestor(idUser, nome, departamento).subscribe({
        next: (res) => {
          this.loadingState.setLoadingState(false);
          this.alertInfo[0] = "Gestor atualizado";
          this.alertInfo[1] = res.message;
          this.isAlertOpen = true;

          this.userToEdit = null;

          this.geAllGestors();
        },
        error: (error) => {
          this.alertInfo[0] = "Erro ao editar gestor";
          this.alertInfo[1] = error.error.error;
          this.isAlertOpen = true;

          this.geAllGestors();
        }
      })
    }
    else if(event.detail.role === 'cancel'){
      this.userToEdit = null;
      this.geAllGestors();
    }
  }

  setOpen(user: GetAllGestores | null) {
    if (user != null && this.departamentos?.length > 0){
      this.userToEdit = user;

      this.modal.backdropDismiss = false;
      this.modal.present();
    }
    else{
      this.userToEdit = null
    }
  }  
}
