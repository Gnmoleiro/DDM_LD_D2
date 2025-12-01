import { Component, OnInit } from '@angular/core';
import { IonButton, IonContent, IonIcon } from '@ionic/angular/standalone';
import { personAddOutline, personAddSharp, createOutline, createSharp, trashSharp, trashOutline } from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { GestorCriarProgramadorComponent } from "../gestor-criar-programador/gestor-criar-programador.component";
import { GestorEditarProgramadorComponent } from "../gestor-editar-programador/gestor-editar-programador.component";
import { GestorEliminarProgramadorComponent } from "../gestor-eliminar-programador/gestor-eliminar-programador.component";

@Component({
  selector: 'app-gestor-programador',
  standalone: true,
  templateUrl: './gestor-programador.component.html',
  styleUrls: ['./gestor-programador.component.scss'],
  imports: [IonIcon, IonContent, IonButton, GestorCriarProgramadorComponent, GestorEditarProgramadorComponent, GestorEliminarProgramadorComponent],
})
export class GestorProgramadorComponent  implements OnInit {
  actualPage = "Criar programador";

  constructor() { 
    addIcons({personAddSharp, personAddOutline, createOutline, createSharp, trashSharp, trashOutline})
  }

  ngOnInit() {}

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
