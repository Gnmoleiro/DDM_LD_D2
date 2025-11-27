import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { DonoEliminarGestorComponent } from './dono-eliminar-gestor.component';

describe('DonoEliminarGestorComponent', () => {
  let component: DonoEliminarGestorComponent;
  let fixture: ComponentFixture<DonoEliminarGestorComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ DonoEliminarGestorComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(DonoEliminarGestorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
