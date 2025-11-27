import { Component, OnInit } from '@angular/core';
import { IonButton, IonContent, IonIcon } from '@ionic/angular/standalone';
import { personAddOutline, personAddSharp, createOutline, createSharp, trashSharp, trashOutline } from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { DonoCriarGestorComponent } from "../dono-criar-gestor/dono-criar-gestor.component";
import { DonoEditarGestorComponent } from "../dono-editar-gestor/dono-editar-gestor.component";
import { DonoEliminarGestorComponent } from "../dono-eliminar-gestor/dono-eliminar-gestor.component";

@Component({
  selector: 'app-dono-gestor',
  standalone: true,
  templateUrl: './dono-gestor.component.html',
  styleUrls: ['./dono-gestor.component.scss'],
  imports: [IonIcon, IonContent, IonButton, DonoCriarGestorComponent, DonoEditarGestorComponent, DonoEliminarGestorComponent]
})
export class DonoGestorComponent  implements OnInit {
  actualPage = "Criar gestor";

  constructor() { 
    addIcons({personAddSharp, personAddOutline, createOutline, createSharp, trashSharp, trashOutline})
  }

  ngOnInit() {
  }

  public actions = [
    { text: 'Criar gestor', icon: 'person-add' },
    { text: 'Editar gestor', icon: 'create' },
    { text: 'Eliminar gestor', icon: 'trash' },
  ];

  // Adicione a função para a ação do clique se necessário
  handleAction(actionText: string) {
    this.actualPage = actionText
  }
}

