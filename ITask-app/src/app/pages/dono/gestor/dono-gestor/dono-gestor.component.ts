import { Component, OnInit } from '@angular/core';
import { IonButton, IonContent, IonIcon } from '@ionic/angular/standalone';
import { personAddOutline, personAddSharp, createOutline, createSharp, trashSharp, trashOutline } from 'ionicons/icons';
import { addIcons } from 'ionicons';

@Component({
  selector: 'app-dono-gestor',
  standalone: true,
  templateUrl: './dono-gestor.component.html',
  styleUrls: ['./dono-gestor.component.scss'],
  imports: [IonIcon, IonContent, IonButton]
})
export class DonoGestorComponent  implements OnInit {

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
    console.log(`Ação clicada: ${actionText}`);
    // Implemente a lógica de navegação/serviço aqui
  }
}

