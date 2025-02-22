import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FrontendUiComponent } from './frontend-ui.component';

describe('FrontendUiComponent', () => {
  let component: FrontendUiComponent;
  let fixture: ComponentFixture<FrontendUiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FrontendUiComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FrontendUiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
