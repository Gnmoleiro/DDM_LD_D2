import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { GestorEditarTipoTarefaComponent } from './gestor-editar-tipo-tarefa.component';

describe('GestorEditarTipoTarefaComponent', () => {
  let component: GestorEditarTipoTarefaComponent;
  let fixture: ComponentFixture<GestorEditarTipoTarefaComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ GestorEditarTipoTarefaComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(GestorEditarTipoTarefaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
