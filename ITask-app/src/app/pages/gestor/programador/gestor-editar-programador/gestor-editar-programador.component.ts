import { Component, OnInit, ViewChild } from '@angular/core';
import {
  IonButton, IonHeader, IonTitle, IonToolbar, IonContent, IonModal, IonButtons, IonInput, IonList, IonItem, 
  IonSelectOption, IonSelect, IonAlert, IonCardContent, IonLabel, IonCard, 
  AlertController} from "@ionic/angular/standalone";
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
  imports: [IonCard, IonLabel, IonCardContent, IonItem, IonList, IonInput, IonButtons, IonModal, IonContent, IonToolbar, IonTitle, IonHeader,
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

  searchTerm: string = '';

  constructor(private programadorService: Programador, private nivelExperienciaService: NivelExperiencia,
    private loadingState: LoadingState, private alertController: AlertController
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

  get filteredUsers(): GetAllProgramadores[] {
    if (!this.searchTerm.trim()) {
      return this.users;
    }

    return this.users.filter(user =>
      user.nome.toLowerCase().includes(this.searchTerm.toLowerCase()) || user.email.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
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

  async presentAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header: header,
      message: message,
      buttons: ['Confirmar'],
    });

    await alert.present();
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
          this.presentAlert('Sucesso', res.message);

          this.userToEdit = null;

          this.get_all_programadores();
        },
        error: (error) => {
          this.presentAlert('Erro', error.error.error);
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
