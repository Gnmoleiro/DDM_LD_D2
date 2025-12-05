import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IonHeader, IonToolbar, IonButtons, IonMenuButton, IonTitle, IonContent } from '@ionic/angular/standalone';
import { LoginComponent } from '../pages/login/login.component';
import { DonoGestorComponent } from "../pages/dono/gestor/dono-gestor/dono-gestor.component";
import { GestorProgramadorComponent } from '../pages/gestor/programador/gestor-programador/gestor-programador.component';
import { DonoProgramadorComponent } from "../pages/dono/programador/dono-programador/dono-programador.component";
import { CommonModule } from '@angular/common';
import { LoadingState } from '../services/loading-state/loading-state';

@Component({
  selector: 'app-folder',
  templateUrl: './folder.page.html',
  styleUrls: ['./folder.page.scss'],
  imports: [IonHeader, IonToolbar, IonTitle, IonContent,
    LoginComponent, IonMenuButton, IonButtons, DonoGestorComponent, GestorProgramadorComponent, CommonModule, DonoProgramadorComponent],
})
export class FolderPage implements OnInit {
  public folder!: string;
  private activatedRoute = inject(ActivatedRoute);
  
  public loading$ = this.loadingState.loading$;

  constructor(private loadingState: LoadingState) {}

  ngOnInit() {
    this.folder = this.activatedRoute.snapshot.paramMap.get('id') as string;
  }
}
