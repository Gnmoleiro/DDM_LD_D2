import { AsyncPipe, CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AlertController, IonModal, IonHeader, IonToolbar, IonTitle, 
  IonInput, IonItem, IonCard, IonButton, IonCardContent, IonLabel, IonGrid, IonRow, IonCol, IonSelect, IonSelectOption, IonButtons, IonContent, IonList } from '@ionic/angular/standalone';
import { OverlayEventDetail } from '@ionic/core';
import { forkJoin } from 'rxjs';
import { LoadingComponent } from 'src/app/pages/loading/loading.component';
import { LoadingState } from 'src/app/services/loading-state/loading-state';
import { GetAllProgramadores, Programador } from 'src/app/services/programador/programador';
import { EstadoTarefaResponse, Tarefa, TarefaDetalhada, TipoTarefaItem } from 'src/app/services/tarefa/tarefa';
import { TipoTarefa } from 'src/app/services/tipoTarefa/tipo-tarefa';

@Component({
  selector: 'app-gestor-eliminar-tarefa',
  templateUrl: './gestor-eliminar-tarefa.component.html',
  styleUrls: ['./gestor-eliminar-tarefa.component.scss'],
  standalone: true,
  imports: [IonList, IonContent, IonButtons, IonRow, IonGrid, IonLabel, IonCardContent, IonButton, FormsModule,
    IonCard, LoadingComponent, IonModal, IonHeader, IonToolbar, IonTitle, IonInput, IonItem, AsyncPipe, CommonModule, IonCol, IonSelect, IonSelectOption],
})
export class GestorEliminarTarefaComponent implements OnInit {
  @ViewChild(IonModal) modal!: IonModal;

  tarefas: TarefaDetalhada[] = [];
  tarefaDelete: TarefaDetalhada | null = null;

  searchTerm: string = '';
  filtroTipoTarefa: string = "";
  filtroProgramador: string = "";
  filtroEstadoTarefa: string = "";

  
  programadores: GetAllProgramadores[] = [];
  tipoTarefas: TipoTarefaItem[] = [];
  estadoTarefas: EstadoTarefaResponse[] = [];

  constructor(private loadingState: LoadingState, private tarefaService: Tarefa,
      private alertController: AlertController, private tipoTarefaService: TipoTarefa,
          private programadorService: Programador) { }
  
  public loading$ = this.loadingState.loading$;

  ngOnInit() {
    this.getDados();
  }

  get filteredTarefas() {
    return this.tarefas.filter(t => {
      const matchesSearch =
        !this.searchTerm ||
        t.tituloTarefa?.toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchesTipo =
        !this.filtroTipoTarefa ||
        t.tipoTarefa?.idTipoTarefa === this.filtroTipoTarefa;

      const matchesProgramador =
        !this.filtroProgramador ||
        t.programador?.idUser === this.filtroProgramador;

      const matchesEstado =
        !this.filtroEstadoTarefa ||
        t.estadoTarefa.toString() === this.filtroEstadoTarefa;

      return matchesSearch && matchesTipo && matchesProgramador && matchesEstado;
    });
  }

  getDados() {
    this.loadingState.setLoadingState(true);
    forkJoin({
      tarefas: this.tarefaService.getTarefas(),
      programador: this.programadorService.getAllProgramadores(),
      tipoTarefa: this.tipoTarefaService.getAllTipoTarefas(),
      estadoTarefa: this.tarefaService.getEstadosTarefas()
    }).subscribe({
      next: ({ tarefas, programador, tipoTarefa, estadoTarefa }) => {
        this.programadores = programador;
        this.tipoTarefas = tipoTarefa;
        this.estadoTarefas = estadoTarefa;
        this.tarefas = tarefas;
      },
      error: (error) => {
        this.presentAlert('Erro', error.error?.error || 'Erro inesperado');
      },
      complete: () => {
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
  
    setOpen(tarefa: TarefaDetalhada) {
      this.tarefaDelete = tarefa;
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
      if (role === 'confirm' && this.tarefaDelete) {
        this.tarefaService.eliminarTarefa(this.tarefaDelete.idTarefa).subscribe({
          next: (res) => {
            this.presentAlert("Sucesso", res.message || "Tipo de tarefa eliminado com sucesso.");
            this.getDados();
          },
          error: (error) => {
            this.presentAlert('ERRO', error.error.error);
          }
        });
      }
      else {
        this.tarefaDelete = null;
        this.getDados();
      }
    }
}
