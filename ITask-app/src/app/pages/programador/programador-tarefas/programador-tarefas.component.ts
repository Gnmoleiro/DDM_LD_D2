import { AsyncPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AlertController, IonSelect, IonSelectOption, IonGrid, IonRow, IonItem, IonCol, IonCard, IonCardHeader, IonCardContent, IonCardSubtitle, IonCardTitle, IonButton } from '@ionic/angular/standalone';
import { LoadingComponent } from '../../loading/loading.component';
import { LoadingState } from 'src/app/services/loading-state/loading-state';
import { EstadoTarefaResponse, Tarefa, TarefaDetalhada } from 'src/app/services/tarefa/tarefa';
import { forkJoin } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-programador-tarefas',
  templateUrl: './programador-tarefas.component.html',
  styleUrls: ['./programador-tarefas.component.scss'],
  standalone: true,
  imports: [IonButton, IonCardTitle, IonCardSubtitle, IonCardContent, IonCardHeader, IonCard, IonCol, IonItem, IonRow, IonGrid, LoadingComponent, AsyncPipe, FormsModule, IonSelect, IonSelectOption],
})
export class ProgramadorTarefasComponent  implements OnInit {
  constructor(private alertController: AlertController, private loadingState: LoadingState, private tarefaService: Tarefa, 
      private titleService: Title) { }
    
    public loading$ = this.loadingState.loading$;
  
    estadosTarefas: EstadoTarefaResponse[] = [];
    tarefas: TarefaDetalhada[] = [];
    estadoTarefa = 'ToDo';

    searchTerm: string = '';
    mudarPara = '';

    ngOnInit() {
      this.buscarDados();
      this.titleService.setTitle('Minhas Tarefas');
    }
  
    get filteredTarefas() {
      return this.tarefas.filter(t => {
        return !this.searchTerm ||
          t.tituloTarefa?.toLowerCase().includes(this.searchTerm.toLowerCase());
      });
    }

    buscarDados() {
      this.loadingState.setLoadingState(true);
      forkJoin({
          tarefa: this.tarefaService.getTarefasPorEstado(this.estadoTarefa),
          estado: this.tarefaService.getEstadosTarefas()
        }).subscribe({
          next: ({tarefa, estado}) => {
            this.tarefas = tarefa;
            this.estadosTarefas = estado;

            if(this.estadoTarefa == 'ToDo') {
              this.mudarPara = 'Doing';
            } else if(this.estadoTarefa == 'Doing') {
              this.mudarPara = 'Done';
            }else {
              this.mudarPara = '';
            }
          },
          error: (error) => {
            this.presentAlert("Erro", error.error?.error || "Erro inesperado");
            return;
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
    alterarEstadoTarefa(tarefa: TarefaDetalhada) {
      this.loadingState.setLoadingState(true);
      this.tarefaService.changeStatusTarefa(tarefa.idTarefa).subscribe({
        next: (response) => {
          this.presentAlert("Sucesso", response.message);
        },
        error: (error) => {
          this.presentAlert("Erro", error.error?.error || "Erro inesperado");
        },complete: () => {
          this.buscarDados();
        }
      });
    }
}
