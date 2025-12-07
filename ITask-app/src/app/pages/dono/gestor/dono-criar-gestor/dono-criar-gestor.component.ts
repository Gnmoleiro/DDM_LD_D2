import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { 
  IonItem, 
  IonInput, 
  IonSelect, 
  IonSelectOption, 
  IonButton, 
  IonLabel, 
  AlertController} from '@ionic/angular/standalone';
import { Departamento, DepartamentoItem } from 'src/app/services/departamento/departamento';
import { Gestor } from 'src/app/services/gestor/gestor';
import { LoadingComponent } from "src/app/pages/loading/loading.component";
import { LoadingState } from 'src/app/services/loading-state/loading-state';

@Component({
  selector: 'app-dono-criar-gestor',
  templateUrl: './dono-criar-gestor.component.html',
  styleUrls: ['./dono-criar-gestor.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule,
    IonItem, IonInput, IonSelect, IonSelectOption,
    IonButton, LoadingComponent]
})
export class DonoCriarGestorComponent  implements OnInit {
  public departamentos: DepartamentoItem[] | null | undefined; 
  
  managerForm!: FormGroup;

  constructor(private fb: FormBuilder, private gestorService: Gestor, private departamentoService: Departamento,
    private loadingState: LoadingState, private alertController: AlertController
  ) {}

  public loading$ = this.loadingState.loading$;

  ngOnInit() {
    this.loadingState.setLoadingState(true)
    this.departamentoService.get_all_departamentos().subscribe({
      next: (res) => {
        this.loadingState.setLoadingState(false)
        this.departamentos = res;
      },
      error: (error) => {
        this.loadingState.setLoadingState(false)
        console.log(error.error.error);
      }
    })
    this.managerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      nome: ['', [Validators.required]],
      departamento: ['', [Validators.required]]
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
    
    const { departamento, email, nome } = this.managerForm.value;

    this.gestorService.criar_gestor(email, nome, departamento).subscribe({
      next: (res) => {
        this.loadingState.setLoadingState(false)
        this.presentAlert('Sucesso', 
          `${res.message} 
          Senha Temporária: ${res.senha_temporaria}`);
        this.managerForm.reset()
      },
      error: (error) => {
        this.loadingState.setLoadingState(false)
        this.presentAlert('Erro', error.error.error);
      }
    });
  }
}