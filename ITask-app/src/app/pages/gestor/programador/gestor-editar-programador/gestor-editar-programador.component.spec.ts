import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { GestorEditarProgramadorComponent } from './gestor-editar-programador.component';

describe('GestorEditarProgramadorComponent', () => {
  let component: GestorEditarProgramadorComponent;
  let fixture: ComponentFixture<GestorEditarProgramadorComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ GestorEditarProgramadorComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(GestorEditarProgramadorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
