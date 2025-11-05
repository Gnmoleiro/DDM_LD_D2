import { TestBed } from '@angular/core/testing';

import { Departamento } from './departamento';

describe('Departamento', () => {
  let service: Departamento;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Departamento);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
