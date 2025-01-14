import {Component, OnInit} from '@angular/core';
import {ReportsService} from '../../services/reports.service';
import {Chart} from 'chart.js/auto';
import {FormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';

@Component({
  selector: 'app-reports',
  imports: [
    FormsModule,
    CommonModule
  ],
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.css'
})
export class ReportsComponent implements OnInit {
  reportType: string = 'currentInventory';
  productFilter: string = '';
  reportContent: string = '';
  reportVisible: boolean = false;
  productList: any[] = [];
  currentReportData: any = {};

  constructor(private reportService: ReportsService) {
  }

  ngOnInit(): void {
    // Fetch available products when the component initializes
    this.fetchProducts();
  }

  // Fetch available products from the server
  fetchProducts(): void {
    this.reportService.getProductList().subscribe(
      (products) => {
        this.productList = products;
      },
      (error) => {
        console.error('Error fetching products:', error);
      }
    );
  }

  // Generate the report based on user selection
  generateReport(): void {
    const reportType = this.reportType;
    const productFilter = this.productFilter;

    // Fetch report data from the server
    this.reportService.getReportData(reportType, productFilter).subscribe(
      (data) => {
        this.reportContent = data.reportContent;
        this.currentReportData = data.chartData;
        this.reportVisible = true;

        // Generate the chart with the fetched data
        const ctx = document.getElementById('reportChart') as HTMLCanvasElement;
        new Chart(ctx.getContext('2d')!, {
          type: 'bar',
          data: this.currentReportData,
          options: {
            responsive: true,
            plugins: {
              legend: {position: 'top'},
              title: {display: true, text: 'דוח גרפי'}
            }
          }
        });
      },
      (error) => {
        console.error('Error fetching report data:', error);
        this.reportContent = 'שגיאה בהבאת נתונים.';
      }
    );
  }

  // Export the report data to CSV
  exportReportToCSV(): void {
    if (!this.currentReportData.labels) {
      alert('אין נתונים לייצוא.');
      return;
    }

    const csvContent = this.currentReportData.labels.map((label: string, index: number) => {
      return `${label},${this.currentReportData.datasets[0].data[index]}`;
    }).join("\n");

    const blob = new Blob([csvContent], {type: 'text/csv;charset=utf-8;'});
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'report.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
