import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent, IonButton, IonCard, IonCardHeader,
  IonCardTitle, IonCardContent, IonList, IonItem, IonInput, IonInputPasswordToggle, IonLabel,
  IonButtons,
  IonHeader,
  IonModal,
  IonTitle,
  IonToolbar
} from '@ionic/angular/standalone';
import { OverlayEventDetail } from '@ionic/core/components';

import { Auth } from 'src/app/services/auth/auth';
import { Router } from '@angular/router';
import { User } from 'src/app/services/user/user';


@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrl: './login.page.scss',
  standalone: true,
  imports: [IonContent, IonButton, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonButtons,
    IonHeader,
    IonModal,
    IonTitle,
    IonToolbar,
    IonList, IonItem, IonInput, IonInputPasswordToggle,
    CommonModule, FormsModule, IonLabel]
})
export class LoginPage implements OnInit {
  @ViewChild(IonModal) modal!: IonModal;
  modalPassword = "";
  modalConfPassword = "";
  modalChangePasswordError = "";
  credentials = {
    email: '',
    password: ''
  };

  loginError = "";

  constructor(private auth: Auth, private route: Router, private userService: User) { }

  ngOnInit() { }

  onLogin() {
    const { email, password } = this.credentials;

    this.auth.login(email, password).subscribe({
      next: (response) => {
        console.log(response.message)
        localStorage.setItem("token", response.access_token)
        if (response.change_password) {
          this.modal.backdropDismiss = false
          this.modal.present();
        }else{
          this.route.navigateByUrl("/");
        }
      },
      error: (err) => {
        this.loginError = err.error.error;
      }
    })
  }

  cancel() {
    this.modal.dismiss(null, 'cancel');
  }

  confirm() {
    this.modal.dismiss(this.modalPassword, 'confirm');
  }

  onWillDismiss(event: CustomEvent<OverlayEventDetail>) {
    if (event.detail.role === 'confirm') {
      this.userService.change_password(this.modalPassword, this.modalPassword).subscribe({
        next: (response) => {
          this.route.navigateByUrl("/");
        },
        error: (err) => {
            this.modalChangePasswordError = err.error.error;
        }
      })
    }
    else if(event.detail.role === 'cancel'){
      localStorage.clear();
      this.credentials.email = "";
      this.credentials.password = "";
    }
  }
}