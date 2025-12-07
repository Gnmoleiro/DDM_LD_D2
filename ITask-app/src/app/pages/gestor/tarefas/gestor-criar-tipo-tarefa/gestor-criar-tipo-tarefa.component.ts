import { Component, OnInit } from '@angular/core';
import { LoadingState } from 'src/app/services/loading-state/loading-state';
import { LoadingComponent } from 'src/app/pages/loading/loading.component';
import { AsyncPipe, CommonModule } from '@angular/common';
import { IonInput, IonItem, IonButton, AlertController } from "@ionic/angular/standalone";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TipoTarefa, TipoTarefaResponse } from 'src/app/services/tipoTarefa/tipo-tarefa';

@Component({
  selector: 'app-gestor-criar-tipo-tarefa',
  templateUrl: './gestor-criar-tipo-tarefa.component.html',
  styleUrls: ['./gestor-criar-tipo-tarefa.component.scss'],
  standalone: true,
  imports: [IonButton, IonItem, IonInput, LoadingComponent, AsyncPipe, CommonModule, ReactiveFormsModule],
})
export class GestorCriarTipoTarefaComponent  implements OnInit {
  constructor(private loadingState: LoadingState, private fb: FormBuilder,
    private tipotarefaService: TipoTarefa, private alertController: AlertController
  ) { }

  public loading$ = this.loadingState.loading$;

  managerForm!: FormGroup;

  ngOnInit() {
    this.loadingState.setLoadingState(false);

    this.managerForm = this.fb.group({
      nome: ['', [Validators.required]]
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
    
    this.tipotarefaService.criarTarefa(this.managerForm.value.nome).subscribe({
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
