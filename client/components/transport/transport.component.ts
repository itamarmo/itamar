import { Component } from '@angular/core';
import {TransportService} from '../../services/transport.service';
import {FormsModule} from '@angular/forms';
import {NgForOf} from '@angular/common';
import { Chart } from 'chart.js/auto';

@Component({
  selector: 'app-transport',
  imports: [
    FormsModule,
    NgForOf
  ],
  templateUrl: './transport.component.html',
  styleUrl: './transport.component.css'
})
export class TransportComponent {
  vehicles: any[] = [];
  planes: any[] = [];
  cars: any[] = [];
  newVehicle = { Type: 'Plane', TransportName: '', LocationName: '', Status: 'green' };

  constructor(private dataService: TransportService) {}

  ngOnInit(): void {
    this.loadVehicles();
  }

  loadVehicles(): void {
    this.dataService.getTransports().subscribe({
      next: (data) => {
        this.vehicles = data;
        this.planes = this.vehicles.filter((v) => v.Type === 'Plane');
        this.cars = this.vehicles.filter((v) => v.Type === 'Vehicle');
        this.updateCharts();
      },
      error: (err) => console.error('Error fetching vehicles:', err),
    });
  }

  addVehicle(): void {
    this.dataService.addVehicle(this.newVehicle).subscribe({
      next: () => {
        this.loadVehicles(); // Refresh the list
        this.newVehicle = { Type: 'plane', TransportName: '', LocationName: '', Status: 'green' }; // Reset the form
      },
      error: (err) => console.error('Error adding vehicle:', err),
    });
  }

  getStatusClass(status: string): string {
    return `status ${status}`;
  }

  updateCharts(): void {
    // Plane Chart
    const planeStatuses = this.getStatusCounts(this.planes);
    new Chart('planeChart', {
      type: 'pie',
      data: {
        labels: ['תקין וזמין', 'תקול', 'בשימוש', 'בטיפול'],
        datasets: [
          {
            label: 'Plane Statuses',
            data: planeStatuses,
            backgroundColor: ['green', 'red', 'blue', 'orange'],
          },
        ],
      },
    });

    // Car Chart
    const carStatuses = this.getStatusCounts(this.cars);
    new Chart('carChart', {
      type: 'pie',
      data: {
        labels: ['תקין וזמין', 'תקול', 'בשימוש', 'בטיפול'],
        datasets: [
          {
            label: 'Car Statuses',
            data: carStatuses,
            backgroundColor: ['green', 'red', 'blue', 'orange'],
          },
        ],
      },
    });
  }

  getStatusCounts(vehicles: any[]): number[] {
    const counts: Record<'Proper' | 'Tackle' | 'In use' | 'Maintenance', number> = {
      Proper: 0,
      Tackle: 0,
      'In use': 0,
      Maintenance: 0,
    };

    vehicles.forEach((v) => {
      if (counts.hasOwnProperty(v.Status)) {
        counts[v.Status as 'Proper' | 'Tackle' | 'In use' | 'Maintenance'] += 1;
      }
    });

    return [counts.Proper, counts.Tackle, counts['In use'], counts.Maintenance];
  }
}