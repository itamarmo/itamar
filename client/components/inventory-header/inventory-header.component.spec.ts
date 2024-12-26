import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InventoryHeaderComponent } from './inventory-header.component';

describe('InventoryHeaderComponent', () => {
  let component: InventoryHeaderComponent;
  let fixture: ComponentFixture<InventoryHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InventoryHeaderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InventoryHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
