import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { GestorCriarTarefaComponent } from './gestor-criar-tarefa.component';

describe('GestorCriarTarefaComponent', () => {
  let component: GestorCriarTarefaComponent;
  let fixture: ComponentFixture<GestorCriarTarefaComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ GestorCriarTarefaComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(GestorCriarTarefaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
