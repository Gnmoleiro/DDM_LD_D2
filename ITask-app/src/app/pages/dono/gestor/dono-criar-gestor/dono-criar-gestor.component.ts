import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { 
  IonItem, 
  IonInput, 
  IonSelect, 
  IonSelectOption, 
  IonButton, 
  IonLabel } from '@ionic/angular/standalone';
import { Departamento, DepartamentoItem } from 'src/app/services/departamento/departamento';
import { Dono } from 'src/app/services/dono/dono';
import { LoadingComponent } from "src/app/pages/loading/loading.component";
import { LoadingState } from 'src/app/services/loading-state/loading-state';

@Component({
  selector: 'app-dono-criar-gestor',
  templateUrl: './dono-criar-gestor.component.html',
  styleUrls: ['./dono-criar-gestor.component.scss'],
  standalone: true,
  imports: [IonLabel,
    CommonModule, ReactiveFormsModule,
    IonItem, IonInput, IonSelect, IonSelectOption,
    IonButton, LoadingComponent]
})
export class DonoCriarGestorComponent  implements OnInit {
  public departamentos: DepartamentoItem[] | null | undefined; 
  
  managerForm!: FormGroup;
  errorMessage: string | null = null;
  sucessMessage: string | null = null;
  tempPassword: string | null = null;

  constructor(private fb: FormBuilder, private donoService: Dono, private departamentoService: Departamento,
    private loadingState: LoadingState
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

  onSubmit() {
    if (this.managerForm.invalid) {
      this.managerForm.markAllAsTouched();
      return;
    }
    this.loadingState.setLoadingState(true)
    
    this.errorMessage = null;
    
    const { departamento, email, nome } = this.managerForm.value;

    this.donoService.criar_gestor(email, nome, departamento).subscribe({
      next: (res) => {
        this.loadingState.setLoadingState(false)
        this.sucessMessage = res.message;
        this.tempPassword = res.senha_temporaria;
        this.managerForm.reset()
      },
      error: (error) => {
        this.loadingState.setLoadingState(false)
        this.errorMessage = error.error.error;
        this.tempPassword = "";
      }
    });
  }
}