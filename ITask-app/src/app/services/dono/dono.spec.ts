import { TestBed } from '@angular/core/testing';

import { Dono } from './dono';

describe('Dono', () => {
  let service: Dono;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Dono);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
