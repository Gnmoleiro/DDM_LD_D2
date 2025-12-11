import { AsyncPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { AlertController, IonGrid, IonRow, IonCol, IonButton, IonInput, IonCardContent, IonCard, IonItem, IonLabel, IonSelectOption, IonSelect } from '@ionic/angular/standalone';
import { LoadingState } from 'src/app/services/loading-state/loading-state';
import { GetAllProgramadores, GetAllProgramadoresAndGestores, Programador } from 'src/app/services/programador/programador';
import { EstadoTarefaResponse, Tarefa, TarefaDetalhada } from 'src/app/services/tarefa/tarefa';
import { LoadingComponent } from 'src/app/pages/loading/loading.component';
import { forkJoin } from 'rxjs';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';

@Component({
  selector: 'app-dono-tarefas',
  templateUrl: './dono-tarefas.component.html',
  styleUrls: ['./dono-tarefas.component.scss'],
  standalone: true,
  imports: [IonLabel, IonItem, IonCard, IonSelectOption, IonSelect,
    IonCardContent, IonInput, IonButton, IonCol, IonRow, IonGrid, 
    AsyncPipe, LoadingComponent, FormsModule
  ],
})
export class DonoTarefasComponent implements OnInit {
  dadosGerais: GetAllProgramadoresAndGestores[] = [];
  currentProgramadores: GetAllProgramadores[] = [];
  currentTarefas: TarefaDetalhada[] = [];
  estadoTarefas: EstadoTarefaResponse[] = [];
  
  filtroEstado: string = '';
  viewState: string = "GESTORES";
  gestorSelecionadoId: string = '';
  programadorSelecionadoNome: string = '';
  
  public loading$ = this.loadingState.loading$;
  searchTerm: string = '';

  constructor(
    private loadingState: LoadingState,
    private alertController: AlertController,
    private titleService: Title,
    private tarefaService: Tarefa,
    private programadorService: Programador
  ) { }

  ngOnInit() {
    this.titleService.setTitle('Tarefas dos Programadores');
    this.buscarDadosIniciais();
  }
  
  buscarDadosIniciais() {
    this.loadingState.setLoadingState(true);
    this.programadorService.getAllProgramadoresAndGestores().subscribe({
        next: (data) => {
          this.dadosGerais = data;
          this.loadingState.setLoadingState(false);
        },
        error: (error) => {
          this.presentAlert("Erro", error.error?.error || "Erro ao carregar lista.");
          this.loadingState.setLoadingState(false);
        }
      });
  }

  get filteredItems() {
    const term = this.searchTerm.toLowerCase().trim();

    if (this.viewState === 'GESTORES') {
      if (!term) return this.dadosGerais;
      return this.dadosGerais.filter(g => 
        g.gestor.nome.toLowerCase().includes(term) || g.gestor.email.toLowerCase().includes(term)
      );
    } 
    
    else if (this.viewState === 'PROGRAMADORES') {
      if (!term) return this.currentProgramadores;
      return this.currentProgramadores.filter(p => 
        p.nome.toLowerCase().includes(term) || p.email.toLowerCase().includes(term)
      );
    }

    else if (this.viewState === 'TAREFAS') {
      return this.currentTarefas.filter(t => {
        const matchSearch =
          !term ||
          t.tituloTarefa.toLowerCase().includes(term);

        const matchEstado =
          !this.filtroEstado ||
          t.estadoTarefa.toString() === this.filtroEstado;

        return matchSearch && matchEstado;
      });
    }

    return [];
  }

  private gerarCSV(): string {
    const headers = [
      'Título',
      'Descrição',
      'Ordem Execução',
      'Story Point',
      'Estado',
      'Data Prevista Início',
      'Data Prevista Fim',
      'Data Real Início',
      'Data Real Fim',
      'Data Criação',
      'Tipo Tarefa',
      'Programador'
    ];

    const rows = this.currentTarefas.map(t => [
      `"${t.tituloTarefa}"`,
      `"${t.descricao || ''}"`,
      `"${t.ordemExecucao}"`,
      `"${t.storyPoint}"`,
      `"${t.estadoTarefa || ''}"`,
      `"${t.dataPrevistaInicio || ''}"`,
      `"${t.dataPrevistaFim || ''}"`,
      `"${t.dataRealInicio || ''}"`,
      `"${t.dataRealFim || ''}"`,
      `"${t.dataCriacao || ''}"`,
      `"${t.tipoTarefa?.nome || ''}"`,
      `"${t.programador?.nome || ''}"`
    ]);

    return [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
  }


  private salvarCSVnoPC(csv: string) {
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `tarefas_${Date.now()}.csv`;
    link.click();

    URL.revokeObjectURL(url);
  }

  private async salvarCSVnativo(csv: string) {
    await Filesystem.writeFile({
      path: `tarefas_${Date.now()}.csv`,
      data: csv,
      directory: Directory.Documents,
      encoding: Encoding.UTF8
    });
  }

  async exportarTarefasParaCSV() {
    try {
      const csv = this.gerarCSV();
      const plataforma = Capacitor.getPlatform();

      if (plataforma === 'web') {
        this.salvarCSVnoPC(csv);
      } else {
        await this.salvarCSVnativo(csv);
      }

      this.presentAlert("Sucesso", "CSV exportado com sucesso!");
    } catch (error) {
      console.error(error);
      this.presentAlert("Erro", "Falha ao exportar CSV.");
    }
  }

  verProgramadores(item: GetAllProgramadoresAndGestores) {
    this.gestorSelecionadoId = item.gestor.idUser;
    this.currentProgramadores = item.programadores;
    this.viewState = 'PROGRAMADORES';
    this.searchTerm = '';
  }

  verTarefas(programador: GetAllProgramadores) {
    this.loadingState.setLoadingState(true);
    this.programadorSelecionadoNome = programador.nome;

    forkJoin({
      tarefa: this.tarefaService.getTarefaByIdProgramador(programador.idUser),
      estado: this.tarefaService.getEstadosTarefas()
    }).subscribe({
      next: ({tarefa, estado}) => {
        this.currentTarefas = tarefa;
        this.estadoTarefas = estado;
        this.viewState = 'TAREFAS';
        this.searchTerm = '';
      },
      error: (err) => {
        this.presentAlert("Erro", err.error?.error || "Erro ao carregar tarefas.");
        this.viewState = 'GESTORES';
        this.currentTarefas = [];
      },complete: () => {
        this.loadingState.setLoadingState(false);
      }
    });
  }

  voltarBtn() {
    this.searchTerm = '';
    
    if (this.viewState === 'TAREFAS') {
      this.viewState = 'PROGRAMADORES';
      this.currentTarefas = [];
    } else if (this.viewState === 'PROGRAMADORES') {
      this.viewState = 'GESTORES';
      this.currentProgramadores = [];
    }
  }

  get btnIsDisabled(): boolean {
    return this.viewState === 'GESTORES';
  }

  async presentAlert(header: string, message: string) {
      const alert = await this.alertController.create({
        header: header,
        message: message,
        buttons: ['Confirmar'],
      });
      await alert.present();
    }
}