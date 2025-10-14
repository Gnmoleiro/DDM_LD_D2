import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonAlert, IonButton, IonCard, IonCardHeader, IonCardTitle, IonCardContent, 
  IonList, IonItem, IonInput, IonInputPasswordToggle
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonContent, IonButton, IonCard, IonCardContent, IonList, IonItem, IonInput, IonInputPasswordToggle,
    CommonModule, FormsModule]
})
export class LoginPage implements OnInit {

  alertButtons = ['Action'];
  constructor() {}

  ngOnInit() {
  }

}
