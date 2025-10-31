import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { 
  IonItem, IonInput, IonSelect, IonSelectOption, 
  IonButton, IonCard, IonCardHeader, IonCardTitle, 
  IonCardContent 
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-dono-criar-gestor',
  templateUrl: './dono-criar-gestor.component.html',
  styleUrls: ['./dono-criar-gestor.component.scss'],
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    IonItem, IonInput, IonSelect, IonSelectOption, 
    IonButton, IonCard, IonCardHeader, IonCardTitle, 
    IonCardContent
  ]
})
export class DonoCriarGestorComponent  implements OnInit {
// Lista de departamentos para o select (adaptar conforme o backend)
  public departamentos = ['Marketing', 'Administração', 'TI']; 
  
  managerForm!: FormGroup;
  isSubmitting: boolean = false;
  tempPassword: string | null = null;
  errorMessage: string | null = null;

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.managerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      nome: ['', [Validators.required]],
      departamento: ['', [Validators.required]]
    });
  }

  onSubmit() {
    // Garantir que o formulário é válido antes de enviar
    if (this.managerForm.invalid) {
      this.managerForm.markAllAsTouched();
      return;
    }
    
    // Resetar mensagens anteriores
    this.tempPassword = null;
    this.errorMessage = null;

    this.isSubmitting = true;
    
    const formData = this.managerForm.value;

    console.log(formData)

    // this.http.post<{ message: string, senha_temporaria: string }>(this.apiUrl, formData)
    //   .subscribe({
    //     next: (response) => {
    //       this.isSubmitting = false;
    //       this.tempPassword = response.senha_temporaria;
    //       this.managerForm.reset(); // Limpa o formulário após o sucesso
    //     },
    //     error: (error) => {
    //       this.isSubmitting = false;
    //       // Captura a mensagem de erro do backend (se existir)
    //       this.errorMessage = error.error?.error || 'Ocorreu um erro ao criar o gestor. Tente novamente.';
    //       console.error('Erro ao criar gestor:', error);
    //     }
    //   });
  }
}