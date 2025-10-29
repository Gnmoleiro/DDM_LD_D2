import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonButton, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonList, IonItem, IonInput, IonInputPasswordToggle, IonLabel } from '@ionic/angular/standalone';
import { Auth } from 'src/app/services/auth/auth';
import { Router } from '@angular/router';


@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrl: './login.page.scss',
  standalone: true,
  imports: [IonContent, IonButton, IonCard, IonCardHeader, IonCardTitle, IonCardContent,
    IonList, IonItem, IonInput, IonInputPasswordToggle,
    CommonModule, FormsModule, IonLabel]
})
export class LoginPage implements OnInit {

  credentials = {
    email: '',
    password: ''
  };

  loginError = ""; 

  constructor(private auth: Auth, private route: Router) {}

  ngOnInit() {}

  onLogin() {
    const { email, password } = this.credentials;

    this.auth.login(email, password).subscribe({
      next: (response) => {
        console.log(response.message)
        localStorage.setItem("token", response.access_token)
        this.route.navigate(["/folder/gestor-todo"])
      },
      error: (err) => {
        this.loginError = err.error.error
      }
    })
  }
}