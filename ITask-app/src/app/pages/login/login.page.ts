import { Component, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
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
export class LoginPage implements OnInit, OnDestroy {
  @ViewChild(IonModal) modal!: IonModal;
  modalPassword = "";
  modalConfPassword = "";
  modalChangePasswordError = "";

  modalConfirm = false;

  credentials = {
    email: '',
    password: ''
  };

  loginError = "";

  constructor(private auth: Auth, private route: Router, private userService: User) { }

  ngOnInit() {
  }

  ngOnDestroy(): void {
    if (!this.modalConfirm) {
      localStorage.clear()
      this.route.navigate(["/folder/login"])
    }
  }

  onLogin() {
    const { email, password } = this.credentials;
    this.auth.login(email, password).subscribe({
      next: (response) => {
        localStorage.setItem("token", response.access_token)
        if (response.change_password) {
          this.modalConfirm = false;
          this.modal.backdropDismiss = false
          this.modal.present();
        }else{
          this.modalConfirm = true;
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
          this.modalConfirm = true;
          this.route.navigate(["/folder/programador"]);
        },
        error: (err) => {
            this.modalConfirm = false;
            this.modalChangePasswordError = err.error.error;
        }
      })
    }
    else if(event.detail.role === 'cancel'){
      this.modalConfirm = false;
      localStorage.clear();
      this.credentials.email = "";
      this.credentials.password = "";
    }
  }
}