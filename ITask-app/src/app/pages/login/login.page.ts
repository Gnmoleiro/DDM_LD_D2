import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import {
  IonContent, IonButton, IonCard, IonCardHeader, IonCardTitle, IonCardContent,
  IonList, IonItem, IonInput, IonInputPasswordToggle, IonAlert
} from '@ionic/angular/standalone';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    IonContent, IonButton, IonCard, IonCardHeader, IonCardTitle, IonCardContent,
    IonList, IonItem, IonInput, IonInputPasswordToggle, CommonModule, FormsModule, RouterLink
  ]
})
export class LoginPage implements OnInit {

  credentials = {
    email: '',
    password: ''
  };

  constructor() {}

  ngOnInit() {}

  onLogin() {
    const { email, password } = this.credentials;

    if (!email || !password) {
      console.log('Preencha todos os campos');
      return;
    }

    console.log('Tentando login com:', email, password);
  }
}
