import { TestBed } from '@angular/core/testing';

import { Programador } from './programador';

describe('Programador', () => {
  let service: Programador;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Programador);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
