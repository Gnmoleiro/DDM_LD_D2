import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { GestorCriarTipoTarefaComponent } from './gestor-criar-tipo-tarefa.component';

describe('GestorCriarTipoTarefaComponent', () => {
  let component: GestorCriarTipoTarefaComponent;
  let fixture: ComponentFixture<GestorCriarTipoTarefaComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ GestorCriarTipoTarefaComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(GestorCriarTipoTarefaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
