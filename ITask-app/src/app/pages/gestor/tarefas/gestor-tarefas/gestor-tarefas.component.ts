import { Component, OnInit } from '@angular/core';
import { IonContent, IonIcon, IonFabList, IonFab, IonFabButton } from '@ionic/angular/standalone';
import { 
  addOutline, addSharp, 
  createOutline, createSharp,
  calendarClearOutline, calendarClearSharp,
  calendarOutline, calendarSharp,
  trashBinOutline, trashBinSharp,
  trashOutline, trashSharp,
  chevronUpCircle } from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { GestorCriarTipoTarefaComponent } from "../gestor-criar-tipo-tarefa/gestor-criar-tipo-tarefa.component";
import { GestorCriarTarefaComponent } from "../gestor-criar-tarefa/gestor-criar-tarefa.component";
import { GestorEditarTipoTarefaComponent } from '../../tarefas/gestor-editar-tipo-tarefa/gestor-editar-tipo-tarefa.component';
import { GestorEliminarTipoTarefaComponent } from '../gestor-eliminar-tipo-tarefa/gestor-eliminar-tipo-tarefa.component';
import { Title } from '@angular/platform-browser';
import { GestorEditarTarefaComponent } from "../gestor-editar-tarefa/gestor-editar-tarefa.component";
import { GestorEliminarTarefaComponent } from '../gestor-eliminar-tarefa/gestor-eliminar-tarefa.component';

@Component({
  selector: 'app-gestor-tarefas',
  templateUrl: './gestor-tarefas.component.html',
  styleUrls: ['./gestor-tarefas.component.scss'],
  imports: [IonContent, IonFab, IonFabButton, IonFabList, IonIcon,
    GestorCriarTipoTarefaComponent, GestorEditarTipoTarefaComponent, GestorEliminarTipoTarefaComponent,
    GestorCriarTarefaComponent, GestorEditarTarefaComponent, GestorEliminarTarefaComponent],
})
export class GestorTarefasComponent  implements OnInit {
  actualPage = "Criar tarefa";

  actionsCima = [
    { text: 'Criar tarefa', icon: 'calendar-clear' },
    { text: 'Editar tarefa', icon: 'calendar' },
    { text: 'Eliminar tarefa', icon: 'trash' },
  ];

  actionsDireita = [
    { text: 'Criar tipo tarefa', icon: 'add' },
    { text: 'Editar tipo tarefa', icon: 'create' },
    { text: 'Eliminar tipo tarefa', icon: 'trash-bin' },
  ]

  constructor(private tittleService: Title) {
    addIcons({
      addOutline, addSharp, 
      createOutline, createSharp, 
      trashOutline, trashSharp,
      calendarOutline, calendarSharp,
      calendarClearOutline, calendarClearSharp,
      trashBinOutline, trashBinSharp,
      chevronUpCircle
    })
  }

  ngOnInit() {
    this.tittleService.setTitle('Tarefas');
  }

  handleAction(page: any) {
    this.actualPage = page;
  }
}
