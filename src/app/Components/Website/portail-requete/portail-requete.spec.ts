import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PortailRequete } from './portail-requete';

describe('PortailRequete', () => {
  let component: PortailRequete;
  let fixture: ComponentFixture<PortailRequete>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PortailRequete]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PortailRequete);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
