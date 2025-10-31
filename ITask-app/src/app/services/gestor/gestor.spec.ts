import { TestBed } from '@angular/core/testing';

import { Gestor } from './gestor';

describe('Gestor', () => {
  let service: Gestor;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Gestor);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
