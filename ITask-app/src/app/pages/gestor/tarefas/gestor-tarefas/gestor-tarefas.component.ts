import { Component, OnInit } from '@angular/core';
import { IonContent, IonIcon, IonFabList, IonFab, IonFabButton } from '@ionic/angular/standalone';
import { 
  addOutline, addSharp, 
  createOutline, createSharp,
  calendarClearOutline, calendarClearSharp,
  calendarOutline, calendarSharp,
  chevronUpCircle } from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { GestorCriarTipoTarefaComponent } from "../gestor-criar-tipo-tarefa/gestor-criar-tipo-tarefa.component";
import { GestorEditarTipoTarefaComponent } from '../../tarefas/gestor-editar-tipo-tarefa/gestor-editar-tipo-tarefa.component';

@Component({
  selector: 'app-gestor-tarefas',
  templateUrl: './gestor-tarefas.component.html',
  styleUrls: ['./gestor-tarefas.component.scss'],
  imports: [IonContent, IonFab, IonFabButton, IonFabList, IonIcon, 
    GestorCriarTipoTarefaComponent, GestorEditarTipoTarefaComponent],
})
export class GestorTarefasComponent  implements OnInit {
  actualPage = "Criar tarefa";

  actionsCima = [
    { text: 'Criar tarefa', icon: 'calendar-clear' },
    { text: 'Editar tarefa', icon: 'calendar' },
  ];

  actionsDireita = [
    { text: 'Criar tipo tarefa', icon: 'add' },
    { text: 'Editar tipo tarefa', icon: 'create' },
  ]

  constructor() {
    addIcons({
      addOutline, addSharp, 
      createOutline, createSharp, 
      calendarOutline, calendarSharp,
      calendarClearOutline, calendarClearSharp,
      chevronUpCircle
    })
  }

  ngOnInit() {}

  handleAction(page: any) {
    this.actualPage = page;
  }
}
