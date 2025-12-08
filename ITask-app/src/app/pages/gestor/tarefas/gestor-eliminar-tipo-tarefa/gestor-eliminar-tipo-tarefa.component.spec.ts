import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { GestorEliminarTipoTarefaComponent } from './gestor-eliminar-tipo-tarefa.component';

describe('GestorEliminarTipoTarefaComponent', () => {
  let component: GestorEliminarTipoTarefaComponent;
  let fixture: ComponentFixture<GestorEliminarTipoTarefaComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ GestorEliminarTipoTarefaComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(GestorEliminarTipoTarefaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
