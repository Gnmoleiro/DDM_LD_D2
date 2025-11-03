import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { DonoEditarGestorComponent } from './dono-editar-gestor.component';

describe('DonoEditarGestorComponent', () => {
  let component: DonoEditarGestorComponent;
  let fixture: ComponentFixture<DonoEditarGestorComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ DonoEditarGestorComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(DonoEditarGestorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
