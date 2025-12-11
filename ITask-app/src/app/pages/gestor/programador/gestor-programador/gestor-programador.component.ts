import { Component, OnInit } from '@angular/core';
import { IonContent, IonIcon, IonFab, IonFabButton, IonFabList } from '@ionic/angular/standalone';
import { personAddOutline, personAddSharp, createOutline, createSharp, trashSharp, trashOutline, chevronUpCircle } from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { GestorCriarProgramadorComponent } from "../gestor-criar-programador/gestor-criar-programador.component";
import { GestorEditarProgramadorComponent } from "../gestor-editar-programador/gestor-editar-programador.component";
import { GestorEliminarProgramadorComponent } from "../gestor-eliminar-programador/gestor-eliminar-programador.component";
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-gestor-programador',
  standalone: true,
  templateUrl: './gestor-programador.component.html',
  styleUrls: ['./gestor-programador.component.scss'],
  imports: [IonFabList, IonFabButton, IonFab, IonIcon, IonContent, GestorCriarProgramadorComponent, GestorEditarProgramadorComponent, GestorEliminarProgramadorComponent],
})
export class GestorProgramadorComponent  implements OnInit {
  actualPage = "Criar programador";

  constructor(private titleService: Title) { 
    addIcons({personAddSharp, personAddOutline, createOutline, createSharp, trashSharp, trashOutline, chevronUpCircle})
  }

  ngOnInit() {
    this.titleService.setTitle('Programadores');
  }

  public actions = [
    { text: 'Criar programador', icon: 'person-add' },
    { text: 'Editar programador', icon: 'create' },
    { text: 'Eliminar programador', icon: 'trash' },
  ];

  // Adicione a função para a ação do clique se necessário
  handleAction(actionText: string) {
    this.actualPage = actionText
  }

}
