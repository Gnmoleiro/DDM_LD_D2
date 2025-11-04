import { Component, OnInit } from '@angular/core';
import { Dono, GetAllGestores } from 'src/app/services/dono/dono';
import { 
  IonGrid, 
  IonRow, 
  IonCol,
  IonButton
} from "@ionic/angular/standalone";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dono-editar-gestor',
  templateUrl: './dono-editar-gestor.component.html',
  styleUrls: ['./dono-editar-gestor.component.scss'],
  standalone: true,
  imports: [
    IonCol, 
    IonRow, 
    IonGrid,
    IonButton,
    CommonModule]
})
export class DonoEditarGestorComponent  implements OnInit {
  users: GetAllGestores[] = [];

  constructor(private donoService: Dono) { }

  ngOnInit() {
    this.donoService.get_all_gestores().subscribe({
      next: (res) => {
        this.users = res;
        console.log('Gestores carregados:', this.users);
      },
      error: (error) => {
        console.log(error.error.error)
      }
    })
  }

}
