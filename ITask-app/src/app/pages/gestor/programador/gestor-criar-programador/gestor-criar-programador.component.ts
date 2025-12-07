import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { 
  IonItem, 
  IonInput, 
  IonSelect, 
  IonSelectOption, 
  IonButton, 
  IonLabel, 
  AlertController} from '@ionic/angular/standalone';
import { NivelExperiencia, NivelExperienciaItem } from 'src/app/services/nivelExperiencia/nivel-experiencia';
import { Programador } from 'src/app/services/programador/programador';
import { LoadingComponent } from "src/app/pages/loading/loading.component";
import { LoadingState } from 'src/app/services/loading-state/loading-state';

@Component({
  selector: 'app-gestor-criar-programador',
  templateUrl: './gestor-criar-programador.component.html',
  styleUrls: ['./gestor-criar-programador.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule,
  IonItem, IonInput, IonSelect, IonSelectOption,
  IonButton, LoadingComponent]
})
export class GestorCriarProgramadorComponent  implements OnInit {

  public nivelExperiencia: NivelExperienciaItem[] | null | undefined; 
  
  managerForm!: FormGroup;

  constructor(private fb: FormBuilder, private programadorService: Programador, private nivelExperienciaService: NivelExperiencia,
    private loadingState: LoadingState, private alertController: AlertController
  ) {}

  public loading$ = this.loadingState.loading$;
  

  ngOnInit() {
    this.loadingState.setLoadingState(true)
    this.nivelExperienciaService.get_all_nivel_experiencia().subscribe({
      next: (res) => {
        this.loadingState.setLoadingState(false)
        this.nivelExperiencia = res;
      },
      error: (error) => {
        this.loadingState.setLoadingState(false)
        console.log(error.error.error);
      }
    })
    this.managerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      nome: ['', [Validators.required]],
      nivelExperiencia: ['', [Validators.required]]
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
    this.loadingState.setLoadingState(true)
    
    const { nivelExperiencia, email, nome } = this.managerForm.value;

    this.programadorService.criar_programador(email, nome, nivelExperiencia).subscribe({
      next: (res) => {
        this.loadingState.setLoadingState(false)
        this.presentAlert('Sucesso', `Programador criado com sucesso! Senha temporária: ${res.senha_temporaria}`);
        this.managerForm.reset()
      },
      error: (error) => {
        this.loadingState.setLoadingState(false)
        this.presentAlert('Erro', error.error.error);
      }
    });
  }

}
