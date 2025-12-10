import { AsyncPipe, CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { LoadingComponent } from "src/app/pages/loading/loading.component";
import { LoadingState } from 'src/app/services/loading-state/loading-state';
import { TipoTarefa, TipoTarefaItem } from 'src/app/services/tipoTarefa/tipo-tarefa';
import { IonItem, IonLabel, IonButton, IonCard, IonCardContent, IonModal, IonContent, IonInput, IonList, IonHeader, IonTitle, IonToolbar, IonButtons, AlertController } from "@ionic/angular/standalone";
import { OverlayEventDetail } from '@ionic/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-gestor-editar-tipo-tarefa',
  templateUrl: './gestor-editar-tipo-tarefa.component.html',
  styleUrls: ['./gestor-editar-tipo-tarefa.component.scss'],
  imports: [IonButtons, IonToolbar, IonTitle, IonHeader, IonList, IonInput, IonContent, IonCardContent, IonCard, IonButton, IonLabel, IonItem, LoadingComponent, 
    AsyncPipe, IonModal, CommonModule, FormsModule],
})
export class GestorEditarTipoTarefaComponent  implements OnInit {
  @ViewChild(IonModal) modal!: IonModal;
  tarefas: TipoTarefaItem[] = [];
  tipoTarefaToEdit: TipoTarefaItem | null = null;

  searchTerm: string = '';

  constructor(private loadingState: LoadingState, private tipoTarefasService: TipoTarefa,
    private alertController: AlertController
  ) { }

  public loading$ = this.loadingState.loading$;

  ngOnInit() {
    this.loadingState.setLoadingState(true);
    this.GestorTarefas();
  }

  get filteredTarefas(): TipoTarefaItem[] {
    if (!this.searchTerm.trim()) {
      return this.tarefas;
    }

    return this.tarefas.filter(user =>
      user.nome.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  GestorTarefas() {
    this.tipoTarefasService.getAllTipoTarefas().subscribe({
      next: (data: TipoTarefaItem[]) => {
        this.tarefas = data;
        this.loadingState.setLoadingState(false);
      },
      error: (error) => {
        console.error('There was an error!', error.error.error);
        this.loadingState.setLoadingState(false);
      }
    });
  }
  async presentAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header: header,
      message: message,
      buttons: ['Confirmar'],
    });

    await alert.present();
  }

  setOpen(tarefa: TipoTarefaItem) {
    this.tipoTarefaToEdit = tarefa;
    this.modal.backdropDismiss = false;
    this.modal.present();
  }

  cancel() {
    this.modal.dismiss(null, 'cancel');
  }

  confirm() {
    this.modal.dismiss(null, 'confirm');
  }

  onWillDismiss(event: CustomEvent<OverlayEventDetail>) {
    const role = event.detail.role;
    if (role === 'confirm' && this.tipoTarefaToEdit) {
      this.tipoTarefasService.editarTarefa(this.tipoTarefaToEdit.idTipoTarefa, this.tipoTarefaToEdit.nome).subscribe({
        next: (res) => {
          this.presentAlert("Sucesso", res.message || "Tipo de tarefa editado com sucesso.");
          this.GestorTarefas();
        },
        error: (error) => {
          console.error('There was an error!', error.error.error);
        }
      });
    }
    else {
      this.tipoTarefaToEdit = null;
      this.GestorTarefas();
    }
  }
}