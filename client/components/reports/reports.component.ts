import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {finalize} from 'rxjs/operators';
import {CommonModule, DatePipe} from '@angular/common';
import {ReportsService} from '../../services/reports.service';
import {Observable} from 'rxjs';

export interface Inventory {
  ProductName: string;
  SKU: string;
  Quantity: number;
  ItemLocation: string;
  LastUpdatedDate: string;
  ExpiryDate: string;
  Notes: string;
}

export interface OrderRequest {
  ProductName: string;
  SKU: string;
  Quantity: number;
  SupplierName: string;
  LocationName: string;
  Notes: string;
}

export interface Transport {
  Type: string;
  TransportName: string;
  LocationName: string;
  Status: string;
}

export interface InventoryMovement {
  ProductName: string;
  SKU: string;
  MovementType: 'IN' | 'OUT';
  Quantity: number;
  FromLocation: string;
  ToLocation: string;
  MovementDate: string;
  ReferenceNumber: string;
  Notes: string;
}

@Component({
  selector: 'app-reports',
  imports: [
    FormsModule,
    CommonModule,
    ReactiveFormsModule
  ],
  providers: [DatePipe],
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.css'
})
export class ReportsComponent implements OnInit {
  reportForm: FormGroup;
  headers: string[] = [];
  reportData: (Inventory | OrderRequest | Transport | InventoryMovement)[] = [];
  showResults = false;
  loading = false;
  error: string | null = null;

  constructor(
    private fb: FormBuilder,
    private reportsService: ReportsService,
    private datePipe: DatePipe
  ) {
    this.reportForm = this.fb.group({
      reportType: ['inventory'],
      startDate: [''],
      endDate: ['']
    });
  }

  ngOnInit(): void {
    this.reportForm.get('reportType')?.valueChanges.subscribe(() => {
      this.showResults = false;
      this.error = null;
    });
  }

  generateReport(): void {
    this.loading = true;
    this.error = null;
    this.showResults = false;

    const reportType = this.reportForm.get('reportType')?.value;
    const startDate = this.reportForm.get('startDate')?.value;
    const endDate = this.reportForm.get('endDate')?.value;

    // Set headers based on report type
    this.setHeaders(reportType);

    // Get data based on report type
    let request$: Observable<any[]>;
    switch (reportType) {
      case 'inventory':
        request$ = this.reportsService.getCurrentInventory();
        break;
      case 'orders':
        request$ = this.reportsService.getOrderRequests(startDate, endDate);
        break;
      case 'transport':
        request$ = this.reportsService.getTransportStatus();
        break;
      case 'movements':
        request$ = this.reportsService.getInventoryMovements(startDate, endDate);
        break;
      default:
        this.error = 'סוג דוח לא תקין';
        this.loading = false;
        return;
    }

    request$.pipe(
      finalize(() => {
        this.loading = false;
      })
    ).subscribe({
      next: (data) => {
        this.reportData = data;
        this.showResults = true;
      },
      error: (error) => {
        console.error('Error fetching report data:', error);
        this.error = 'שגיאה בטעינת נתונים. אנא נסה שנית.';
      }
    });
  }

  private setHeaders(reportType: string): void {
    switch (reportType) {
      case 'inventory':
        this.headers = ['מק"ט', 'שם מוצר', 'כמות', 'מיקום', 'תאריך עדכון', 'תאריך תפוגה', 'הערות'];
        break;
      case 'orders':
        this.headers = ['מק"ט', 'שם מוצר', 'כמות', 'ספק', 'מיקום', 'הערות'];
        break;
      case 'transport':
        this.headers = ['סוג', 'שם', 'מיקום', 'סטטוס'];
        break;
      case 'movements':
        this.headers = ['תאריך', 'מק"ט', 'שם מוצר', 'סוג תנועה', 'כמות', 'ממיקום', 'למיקום', 'מספר אסמכתא', 'הערות'];
        break;
    }
  }

  getRowValue(row: Inventory | OrderRequest | Transport | InventoryMovement, header: string): string {
    switch (header) {
      // Common fields
      case 'מק"ט':
        return 'SKU' in row ? row.SKU : '';
      case 'שם מוצר':
        return 'ProductName' in row ? row.ProductName : '';
      case 'כמות':
        return 'Quantity' in row ? row.Quantity.toString() : '';
      case 'הערות':
        return 'Notes' in row ? row.Notes : '';

      // Inventory specific
      case 'מיקום':
        return 'LocationName' in row ? this.getLocationName(row.LocationName) :
          'ItemLocation' in row ? this.getLocationName(row.ItemLocation) : '';
      case 'תאריך עדכון':
        return 'LastUpdatedDate' in row ? this.datePipe.transform(row.LastUpdatedDate, 'dd/MM/yyyy') || '' : '';
      case 'תאריך תפוגה':
        return 'ExpiryDate' in row ? this.datePipe.transform(row.ExpiryDate, 'dd/MM/yyyy') || '' : '';

      // Transport specific
      case 'סוג':
        return 'Type' in row ? this.getTransportType(row.Type) : '';
      case 'שם':
        return 'TransportName' in row ? row.TransportName : '';
      case 'סטטוס':
        return 'Status' in row ? this.getTransportStatus(row.Status) : '';

      // OrderRequest specific
      case 'ספק':
        return 'SupplierName' in row ? row.SupplierName : '';

      // InventoryMovement specific
      case 'תאריך':
        return 'MovementDate' in row ? row.MovementDate : '';
      case 'סוג תנועה':
        return 'MovementType' in row ? (row.MovementType === 'IN' ? 'כניסה' : 'יציאה') : '';
      case 'ממיקום':
        return 'FromLocation' in row ? this.getLocationName(row.FromLocation) : '';
      case 'למיקום':
        return 'ToLocation' in row ? this.getLocationName(row.ToLocation) : '';
      case 'מספר אסמכתא':
        return 'ReferenceNumber' in row ? row.ReferenceNumber : '';

      default:
        return '';
    }
  }

  getTransportType(type: string) : string{
    switch (type) {
      case 'Vehicle':
        return 'רכב';
      case 'Plane':
        return 'מטוס';
      default:
        return 'כלי רכב';
    }
  }

  getTransportStatus(status: string): string {
    switch (status) {
      case 'Proper':
        return 'תקין וזמין'
      case 'In use':
        return 'בשימוש'
      case 'Maintenance':
        return 'בטיפול'
      case 'Tackle':
        return 'תקול'
      default:
        return ''
    }
  }

  getLocationName(locationName: string): string {
    switch (locationName) {
      case 'Megiddo':
        return 'מגידו'
      case 'Kedma':
        return 'קדמה'
      default:
        return ''
    }
  }

  exportToCsv(): void {
    const csvRows = [
      this.headers.join(','),
      ...this.reportData.map(row =>
        this.headers.map(header => `"${this.getRowValue(row, header)}"`).join(',')
      )
    ];

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], {type: 'text/csv;charset=utf-8;'});
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `report-${this.reportForm.get('reportType')?.value}-${new Date().toISOString()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }
}
