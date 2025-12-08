import { Component, OnInit } from '@angular/core';
import { IonButton, IonContent, IonIcon, IonFabList, IonFabButton, IonFab } from '@ionic/angular/standalone';
import { personAddOutline, personAddSharp, createOutline, createSharp, trashSharp, trashOutline,
  chevronUpCircle
 } from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { DonoCriarGestorComponent } from "../dono-criar-gestor/dono-criar-gestor.component";
import { DonoEditarGestorComponent } from "../dono-editar-gestor/dono-editar-gestor.component";
import { DonoEliminarGestorComponent } from "../dono-eliminar-gestor/dono-eliminar-gestor.component";
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-dono-gestor',
  standalone: true,
  templateUrl: './dono-gestor.component.html',
  styleUrls: ['./dono-gestor.component.scss'],
  imports: [IonFabButton, IonFabList, IonIcon, IonContent, DonoCriarGestorComponent, DonoEditarGestorComponent, 
    DonoEliminarGestorComponent, IonFab]
})
export class DonoGestorComponent  implements OnInit {
  actualPage = "Criar gestor";

  constructor(private titleService: Title) { 
    addIcons({personAddSharp, personAddOutline, createOutline, createSharp, trashSharp, trashOutline, chevronUpCircle})
  }

  ngOnInit() {
    this.titleService.setTitle('Gestores');
  }

  public actions = [
    { text: 'Eliminar gestor', icon: 'trash' },
    { text: 'Editar gestor', icon: 'create' },
    { text: 'Criar gestor', icon: 'person-add' },
  ];

  // Adicione a função para a ação do clique se necessário
  handleAction(actionText: string) {
    this.actualPage = actionText
  }
}

