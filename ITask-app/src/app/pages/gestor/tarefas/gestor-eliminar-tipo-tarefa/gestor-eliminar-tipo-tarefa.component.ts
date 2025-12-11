import { AsyncPipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { LoadingComponent } from 'src/app/pages/loading/loading.component';
import { IonCardContent, IonCard, AlertController, IonModal, IonItem, IonLabel, IonButton, IonContent, IonHeader, IonButtons, IonToolbar, IonTitle, IonList, IonInput } from "@ionic/angular/standalone";
import { LoadingState } from 'src/app/services/loading-state/loading-state';
import { TipoTarefa, TipoTarefaItem } from 'src/app/services/tipoTarefa/tipo-tarefa';
import { OverlayEventDetail } from '@ionic/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-gestor-eliminar-tipo-tarefa',
  templateUrl: './gestor-eliminar-tipo-tarefa.component.html',
  styleUrls: ['./gestor-eliminar-tipo-tarefa.component.scss'],
  standalone: true,
  imports: [IonInput, IonList, IonTitle, IonToolbar, IonButtons, 
    IonHeader, IonContent, IonButton, IonLabel, 
    IonItem, IonCard, IonCardContent, AsyncPipe, LoadingComponent, IonModal, FormsModule],
})
export class GestorEliminarTipoTarefaComponent implements OnInit {
  @ViewChild(IonModal) modal!: IonModal;

  tarefas: TipoTarefaItem[] = [];
  tipoTarefaDelete: TipoTarefaItem | null = null;
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
        this.presentAlert('ERRO', error.error.error);
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
    this.tipoTarefaDelete = tarefa;
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
    if (role === 'confirm' && this.tipoTarefaDelete) {
      this.tipoTarefasService.eliminarTarefa(this.tipoTarefaDelete.idTipoTarefa).subscribe({
        next: (res) => {
          this.presentAlert("Sucesso", res.message || "Tipo de tarefa eliminado com sucesso.");
          this.GestorTarefas();
        },
        error: (error) => {
          this.presentAlert('ERRO', error.error.error);
        }
      });
    }
    else {
      this.tipoTarefaDelete = null;
      this.GestorTarefas();
    }
  }
}
