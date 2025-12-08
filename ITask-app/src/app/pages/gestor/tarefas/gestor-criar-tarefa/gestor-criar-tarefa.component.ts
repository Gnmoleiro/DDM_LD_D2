import { AsyncPipe, CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AlertController, IonItem, IonButton, IonInput, IonLabel, IonSelectOption, IonSelect } from '@ionic/angular/standalone';
import { LoadingComponent } from 'src/app/pages/loading/loading.component';
import { LoadingState } from 'src/app/services/loading-state/loading-state';
import { GetAllProgramadores, Programador } from 'src/app/services/programador/programador';
import { Tarefa } from 'src/app/services/tarefa/tarefa';
import { TipoTarefa, TipoTarefaResponse } from 'src/app/services/tipoTarefa/tipo-tarefa';

@Component({
  selector: 'app-gestor-criar-tarefa',
  templateUrl: './gestor-criar-tarefa.component.html',
  styleUrls: ['./gestor-criar-tarefa.component.scss'],
  standalone: true,
  imports: [IonLabel, IonButton, IonSelect, IonItem, IonInput, LoadingComponent, AsyncPipe, CommonModule, ReactiveFormsModule, IonSelectOption]
})
export class GestorCriarTarefaComponent  implements OnInit {

  constructor(private loadingState: LoadingState, private fb: FormBuilder,
      private tarefaService: Tarefa, private programadoreService: Programador, private alertController: AlertController
    ) { }

  public loading$ = this.loadingState.loading$;

  programadores: GetAllProgramadores[] = [];

  managerForm!: FormGroup;
  formFields = [
    { name: 'titulo', label: 'Título', type: 'text', required: true },
    { name: 'descricao', label: 'Descrição', type: 'text', required: true },
    { name: 'ordemExecucao', label: 'Ordem de Execução', type: 'number', required: true },
    { name: 'storyPoints', label: 'Story Points', type: 'number', required: true },
    { name: 'estadoTarefa', label: 'Estado', type: 'text', required: true },
    { name: 'dataPrevistaInicio', label: 'Início Previsto', type: 'date', required: true },
    { name: 'dataPrevistaTermino', label: 'Término Previsto', type: 'date', required: true },
    { name: 'dataRealInicio', label: 'Início Real', type: 'date', required: true },
    { name: 'dataRealTermino', label: 'Término Real', type: 'date', required: true },
    { name: 'idProgramador', label: 'Programador', type: 'text', required: true },
  ];


  ngOnInit() {
    this.loadingState.setLoadingState(true);

    const group: any = {};

    this.formFields.forEach(field => {
      group[field.name] = this.fb.control(
        '',
        field.required ? Validators.required : null
      );
    });

    this.managerForm = this.fb.group(group);

    this.programadoreService.getAllProgramadores().subscribe({
      next: (response) => {
        this.loadingState.setLoadingState(false);
        this.programadores = response;
      },
      error: (error) => {
        this.presentAlert("Erro", error.error.error);
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

  onSubmit() {
      if (this.managerForm.invalid) {
        this.managerForm.markAllAsTouched();
        return;
      }
      this.loadingState.setLoadingState(true);
      
      this.tarefaService.criarTarefa(
        this.managerForm.value.titulo, this.managerForm.value.descricao, 
        this.managerForm.value.ordemExecucao, this.managerForm.value.storyPoints, 
        this.managerForm.value.estadoTarefa, this.managerForm.value.dataPrevistaInicio, 
        this.managerForm.value.dataPrevistaTermino, this.managerForm.value.dataRealInicio, 
        this.managerForm.value.dataRealTermino).subscribe({
        next: (response: TipoTarefaResponse) => {
          this.managerForm.reset();
          this.presentAlert("Sucesso", response.message);
          this.loadingState.setLoadingState(false);
        },
        error: (error) => {
          this.presentAlert("Erro", error.error.error);
          this.loadingState.setLoadingState(false);
        }
      });
    }
}
