import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import {
  IonContent, IonButton, IonCard, IonCardHeader, IonCardTitle, IonCardContent,
  IonList, IonItem, IonInput, IonInputPasswordToggle, IonAlert, IonIcon, IonHeader, IonToolbar, IonButtons, IonTitle, 
  IonMenuButton} from '@ionic/angular/standalone';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrl: './login.page.scss',
  standalone: true,
  imports: [IonContent, IonButton, IonCard, IonCardHeader, IonCardTitle, IonCardContent,
    IonList, IonItem, IonInput, IonInputPasswordToggle, IonIcon,
    CommonModule, FormsModule
  ]
})
export class LoginPage implements OnInit {

  credentials = {
    email: '',
    password: ''
  };

  // Pode-se adicionar uma variável para exibir erros de API
  // loginError = false; 

  constructor() {}

  ngOnInit() {}

  onLogin() {
    const { email, password } = this.credentials;

    console.log('Tentando login com:', email, 'e senha:', password ? '******' : '');

    // Implementar a chamada de serviço de autenticação aqui
    // Ex: this.authService.login(email, password).subscribe(...)
  }
}