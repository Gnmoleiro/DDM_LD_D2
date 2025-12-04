import { TestBed } from '@angular/core/testing';

import { TipoTarefa } from './tipo-tarefa';

describe('TipoTarefa', () => {
  let service: TipoTarefa;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TipoTarefa);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
