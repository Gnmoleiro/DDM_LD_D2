import { Component, OnInit } from '@angular/core';
import { IonContent, IonIcon, IonFab, IonFabButton, IonFabList } from '@ionic/angular/standalone';
import { personAddOutline, personAddSharp, createOutline, createSharp, trashSharp, trashOutline, chevronUpCircle } from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { GestorCriarProgramadorComponent } from "../gestor-criar-programador/gestor-criar-programador.component";
import { GestorEditarProgramadorComponent } from "../gestor-editar-programador/gestor-editar-programador.component";
import { GestorEliminarProgramadorComponent } from "../gestor-eliminar-programador/gestor-eliminar-programador.component";

@Component({
  selector: 'app-gestor-programador',
  standalone: true,
  templateUrl: './gestor-programador.component.html',
  styleUrls: ['./gestor-programador.component.scss'],
  imports: [IonFabList, IonFabButton, IonFab, IonIcon, IonContent, GestorCriarProgramadorComponent, GestorEditarProgramadorComponent, GestorEliminarProgramadorComponent],
})
export class GestorProgramadorComponent  implements OnInit {
  actualPage = "Criar programador";

  constructor() { 
    addIcons({personAddSharp, personAddOutline, createOutline, createSharp, trashSharp, trashOutline, chevronUpCircle})
  }

  ngOnInit() {}

  public actions = [
    { text: 'Eliminar programador', icon: 'trash' },
    { text: 'Editar programador', icon: 'create' },
    { text: 'Criar programador', icon: 'person-add' },
  ];

  // Adicione a função para a ação do clique se necessário
  handleAction(actionText: string) {
    this.actualPage = actionText
  }

}
