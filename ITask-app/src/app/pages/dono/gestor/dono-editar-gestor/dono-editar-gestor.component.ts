import { Component, OnInit, ViewChild } from '@angular/core';
import { Dono, GetAllGestores } from 'src/app/services/dono/dono';
import { 
  IonGrid, 
  IonRow, 
  IonCol,
  IonButton, IonHeader, IonTitle, IonToolbar, IonContent, IonModal, IonButtons, IonInput, IonList, IonItem, 
  IonSelectOption, IonSelect} from "@ionic/angular/standalone";
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Departamento, DepartamentoItem } from 'src/app/services/departamento/departamento';
import { LoadingComponent } from 'src/app/pages/loading/loading.component';
import { LoadingState } from 'src/app/services/loading-state/loading-state';
import { OverlayEventDetail } from '@ionic/core';

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
    IonSelect,
    CommonModule,
    FormsModule,
    LoadingComponent]
})
export class DonoEditarGestorComponent  implements OnInit {
  @ViewChild(IonModal) modal!: IonModal;
  users: GetAllGestores[] = [];
  isModalEditOpen: boolean = false;
  userToEdit: GetAllGestores | null = null;
  departamentos: DepartamentoItem[] = []

  userEditNome: string | undefined;
  userEditDepartamento: string | undefined;

  constructor(private donoService: Dono, private departamentoService: Departamento,
    private loadingState: LoadingState
  ) { }

  public loading$ = this.loadingState.loading$;

  ngOnInit() {
    this.loadingState.setLoadingState(true);
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
        this.loadingState.setLoadingState(false);
        this.users = res;
      },
      error: (error) => {
        this.loadingState.setLoadingState(false);
        console.log(error.error.error)
      }
    })
  }

  salvarAlteracoes(){
    if (this.userToEdit == null){
      return;
    }

    alert(this.userEditNome)
    alert(this.userEditDepartamento)

    this.isModalEditOpen = false
  }

  cancel() {
      this.modal.dismiss(null, 'cancel');
    }
  
    confirm() {
      this.modal.dismiss(null, 'confirm');
    } 

  onWillDismiss(event: CustomEvent<OverlayEventDetail>) {
    if (event.detail.role === 'confirm'){
      alert(this.userEditNome + " | " + this.userEditDepartamento)
    }
  }

  setOpen(user: GetAllGestores | null) {
    if (user != null && this.departamentos?.length > 0){
      this.userToEdit = user;
      this.userEditNome = user.nome;
      this.userEditDepartamento = user.departamento;

      this.modal.backdropDismiss = false;
      this.modal.present();
    }
    else{
      this.userToEdit = null
    }
  }  
}
