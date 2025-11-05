import { Component, OnInit } from '@angular/core';
import { Dono, GetAllGestores } from 'src/app/services/dono/dono';
import { 
  IonGrid, 
  IonRow, 
  IonCol,
  IonButton, IonHeader, IonTitle, IonToolbar, IonContent, IonModal, IonButtons, IonInput, IonList, IonItem, 
  IonSelectOption} from "@ionic/angular/standalone";
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Departamento, DepartamentoItem } from 'src/app/services/departamento/departamento';

@Component({
  selector: 'app-dono-editar-gestor',
  templateUrl: './dono-editar-gestor.component.html',
  styleUrls: ['./dono-editar-gestor.component.scss'],
  standalone: true,
  imports: [IonItem, IonList, IonInput, IonButtons, IonModal, IonContent, IonToolbar, IonTitle, IonHeader, 
    IonCol, 
    IonRow, 
    IonGrid,
    IonButton,
    IonSelectOption,
    CommonModule,
    FormsModule]
})
export class DonoEditarGestorComponent  implements OnInit {
  users: GetAllGestores[] = [];
  isModalEditOpen: boolean = false;
  userToEdit: GetAllGestores | null = null;
  departamentos: DepartamentoItem[] = []

  userEditNome: string = ""
  userEditDepartamento: string = ""

  constructor(private donoService: Dono, private departamentoService: Departamento) { }

  ngOnInit() {
    this.departamentoService.get_all_departamentos().subscribe({
      next: (res) => {
        this.departamentos = res
      },
      error: (error) => {
        console.log(error.error.error)
      }
    })

    this.donoService.get_all_gestores().subscribe({
      next: (res) => {
        this.users = res;
      },
      error: (error) => {
        console.log(error.error.error)
      }
    })
  }

  salvarAlteracoes(){
    if (this.userToEdit == null){
      return;
    }

    alert(this.userEditNome)

    this.isModalEditOpen = false
  }

  setOpen(isOpen: boolean, user: GetAllGestores | null) {
    if (isOpen && user != null && this.departamentos?.length > 0){
      this.userToEdit = user;
      this.userEditNome = user.nome;
      this.userEditDepartamento = user.departamento;
    }
    else{
      this.userToEdit = null
    }

    
    this.isModalEditOpen = isOpen;
  }
}
