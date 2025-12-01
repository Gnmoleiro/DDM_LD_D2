import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { GestorCriarProgramadorComponent } from './gestor-criar-programador.component';

describe('GestorCriarProgramadorComponent', () => {
  let component: GestorCriarProgramadorComponent;
  let fixture: ComponentFixture<GestorCriarProgramadorComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ GestorCriarProgramadorComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(GestorCriarProgramadorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
