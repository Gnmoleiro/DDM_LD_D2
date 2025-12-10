import { Component, OnInit, ViewChild } from '@angular/core';
import { AlertController, IonItem, IonInput, IonCard, IonCardContent, IonLabel, IonButton, IonModal, IonHeader, IonToolbar, 
  IonTitle, IonButtons, IonContent, IonList, IonSelectOption, 
  IonSelect} from '@ionic/angular/standalone';
import { forkJoin } from 'rxjs';
import { LoadingState } from 'src/app/services/loading-state/loading-state';
import { EstadoTarefaResponse, Tarefa, TarefaDetalhada } from 'src/app/services/tarefa/tarefa';
import { LoadingComponent } from "src/app/pages/loading/loading.component";
import { AsyncPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OverlayEventDetail } from '@ionic/core';
import { GetAllProgramadores, Programador } from 'src/app/services/programador/programador';
import { TipoTarefa, TipoTarefaItem } from 'src/app/services/tipoTarefa/tipo-tarefa';

@Component({
  selector: 'app-gestor-editar-tarefa',
  templateUrl: './gestor-editar-tarefa.component.html',
  styleUrls: ['./gestor-editar-tarefa.component.scss'],
  standalone: true,
  imports: [IonList, IonContent, IonButtons,
    IonTitle, IonToolbar, IonHeader, IonModal, IonSelect,
    IonButton, IonLabel, IonCardContent, IonCard, IonInput, IonItem,
    LoadingComponent, AsyncPipe, FormsModule, IonSelectOption],
})
export class GestorEditarTarefaComponent  implements OnInit {
  @ViewChild(IonModal) modal!: IonModal;
  constructor(private alertController: AlertController, private loadingState: LoadingState, private tarefaService: Tarefa, private tipoTarefaService: TipoTarefa,
    private programadorService: Programador) { }

  selectedTipoTarefaId: string | undefined;
  selectedProgramadorId: string | undefined;
  selectedEstadoTarefa: string | undefined;

  programadores: GetAllProgramadores[] = [];
  tipoTarefas: TipoTarefaItem[] = [];
  estadoTarefas: EstadoTarefaResponse[] = [];
  tarefas: TarefaDetalhada[] = [];
  tarefaEdit: TarefaDetalhada = {} as TarefaDetalhada;
  public loading$ = this.loadingState.loading$;

  searchTerm: string = '';

  get filteredTarefas() {
    return this.tarefas.filter(tarefa =>
      tarefa.tituloTarefa.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  async presentAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header: header,
      message: message,
      buttons: ['Confirmar'],
    });

    await alert.present();
  }

  ngOnInit() {
    this.getDados();
  }

  getDados() {
    this.loadingState.setLoadingState(true);
    forkJoin({
      programadores: this.programadorService.getAllProgramadores(),
      tipos: this.tipoTarefaService.getAllTipoTarefas(),
      estados: this.tarefaService.getEstadosTarefas(),
      tarefas: this.tarefaService.getTarefas()
    }).subscribe({
      next: ({ programadores, tipos, estados, tarefas }) => {
        this.programadores = programadores;
        this.tipoTarefas = tipos;
        this.estadoTarefas = estados;
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

  setOpen(tarefa: any) {
    this.tarefaEdit = { ...tarefa }; 
    this.selectedTipoTarefaId = tarefa.tipoTarefa?.idTipoTarefa;
    this.selectedProgramadorId = tarefa.programador?.idUser;
    this.selectedEstadoTarefa = tarefa.estadoTarefa;
    this.modal.backdropDismiss = false;
    this.modal.present();
  }

  cancel() {
      this.modal.dismiss(null, 'cancel');
    }
  
    confirm() {
      if (this.selectedTipoTarefaId !== this.tarefaEdit.tipoTarefa?.idTipoTarefa) {
        const novoTipo = this.tipoTarefas.find(t => t.idTipoTarefa === this.selectedTipoTarefaId);
        if (novoTipo) {
          this.tarefaEdit.tipoTarefa = novoTipo;
        }
      }
      if (this.selectedProgramadorId !== this.tarefaEdit.programador?.idUser) {
        const novoProgramador = this.programadores.find(p => p.idUser === this.selectedProgramadorId);
        if (novoProgramador) {
          this.tarefaEdit.programador = novoProgramador;
        }
      }
      if (this.selectedEstadoTarefa !== this.tarefaEdit.estadoTarefa?.estadoTarefa) {
        const novoEstado = this.estadoTarefas.find(e => e.estadoTarefa === this.selectedEstadoTarefa);
        if (novoEstado) {
          this.tarefaEdit.estadoTarefa = novoEstado;
        }
      }
      this.modal.dismiss(null, 'confirm');
    }
  
    onWillDismiss(event: CustomEvent<OverlayEventDetail>) {
      const role = event.detail.role;
      if (role === 'confirm' && this.tarefaEdit) {
        this.loadingState.setLoadingState(true);
        this.tarefaService.editTarefa(
          this.tarefaEdit.idTarefa,
          this.tarefaEdit.tituloTarefa,
          this.tarefaEdit.descricao,
          this.tarefaEdit.ordemExecucao,
          this.tarefaEdit.storyPoint,
          this.tarefaEdit.estadoTarefa?.estadoTarefa || '',
          this.tarefaEdit.dataPrevistaInicio,
          this.tarefaEdit.dataPrevistaFim,
          this.tarefaEdit.programador?.idUser || '',
          this.tarefaEdit.tipoTarefa?.idTipoTarefa || ''
        ).subscribe({
          next: () => {
            this.presentAlert("Sucesso", "Tarefa atualizada com sucesso.");
            this.getDados();
          },
          error: (error) => {
            this.presentAlert("Erro", error.error?.error || "Erro inesperado");
            this.getDados();
          }
        });
      }
      else {
        this.tarefaEdit = {} as TarefaDetalhada;
        this.getDados();
      }
    }
}
