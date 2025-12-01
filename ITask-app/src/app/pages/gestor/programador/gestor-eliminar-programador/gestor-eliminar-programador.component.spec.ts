import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { GestorEliminarProgramadorComponent } from './gestor-eliminar-programador.component';

describe('GestorEliminarProgramadorComponent', () => {
  let component: GestorEliminarProgramadorComponent;
  let fixture: ComponentFixture<GestorEliminarProgramadorComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ GestorEliminarProgramadorComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(GestorEliminarProgramadorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
