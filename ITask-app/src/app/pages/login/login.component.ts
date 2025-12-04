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
  IonToolbar,
  IonImg
} from '@ionic/angular/standalone';
import { OverlayEventDetail } from '@ionic/core/components';

import { Auth } from 'src/app/services/auth/auth';
import { Router } from '@angular/router';
import { User } from 'src/app/services/user/user';
import { LoadingComponent } from "../loading/loading.component";
import { LoadingState } from 'src/app/services/loading-state/loading-state';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  standalone: true,
  imports: [IonContent, IonButton, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonButtons,
    IonHeader,
    IonModal,
    IonTitle,
    IonToolbar,
    IonList, IonItem, IonInput, IonInputPasswordToggle,
    CommonModule, FormsModule, IonLabel, LoadingComponent, IonImg]
  })
  export class LoginComponent implements OnInit, OnDestroy {
    @ViewChild(IonModal) modal!: IonModal;
    modalPassword = "";
    modalConfPassword = "";
    modalChangePasswordError = "";
  
    modalConfirm = false;
  
    isLoading = false;

    logo="assets/icon/favicon.png";
    logoAlt="ITask Logo";
  
    credentials = {
      email: '',
      password: ''
    };
  
    loginError = "";
  
    constructor(private auth: Auth, private route: Router, private userService: User,
      private loadingState: LoadingState
    ) { }
  
    public loading$ = this.loadingState.loading$;

    ngOnInit() {
      this.loadingState.setLoadingState(false);
    }
  
    ngOnDestroy(): void {
      if (this.modalConfirm == false) {
        localStorage.clear()
        this.route.navigate(["/folder/login"])
      }
    }
  
    onLogin() {
      const { email, password } = this.credentials;
      this.loadingState.setLoadingState(true);
      this.auth.login(email, password).subscribe({
        next: (response) => {
        this.loadingState.setLoadingState(false);
          localStorage.setItem("token", response.access_token)
          if (response.change_password) {
            this.modalConfirm = false;
            this.modal.backdropDismiss = false
            this.modal.present();
          }else{
            this.modalConfirm = true;
            this.credentials.email = "";
            this.credentials.password = "";
            this.route.navigateByUrl("/");
          }
        },
        error: (err) => {
          this.loadingState.setLoadingState(false);
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
        this.loadingState.setLoadingState(true);
        this.userService.change_password(this.modalPassword, this.modalPassword).subscribe({
          next: (res) => {
            this.modalConfirm = true;
            this.credentials.email = "";
            this.credentials.password = "";
            this.route.navigate(["/folder/programador"]);
          },
          error: (err) => {
              this.loadingState.setLoadingState(false);
              this.modalConfirm = false;
              this.modalChangePasswordError = err.error.error;
          }
        })
      }
      else if(event.detail.role === 'cancel'){
        this.loadingState.setLoadingState(false);
        this.modalConfirm = false;
        localStorage.clear();
        this.credentials.email = "";
        this.credentials.password = "";
      }
    }
  }