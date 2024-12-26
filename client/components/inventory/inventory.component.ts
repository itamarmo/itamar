import {Component, OnInit} from '@angular/core';
import {InventoryService} from '../../services/inventory.service';
import {FormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';

@Component({
  selector: 'app-inventory',
  imports: [FormsModule, CommonModule],
  standalone: true,
  templateUrl: './inventory.component.html',
  styleUrls: ['./inventory.component.css']
})
export class InventoryComponent implements OnInit {
  inventory: any[] = [];
  newItem = {
    ProductName: '',
    ProductId: '',
    Quantity: 0,
    Location: '',
    LastUpdatedDate: '',
    ExpiryDate: '',
    Notes: ''
  };
  filteredInventory: any[] = [];
  searchTerm = '';
  sortKey = '';
  sortDirection = true;
  sortField: any;

  constructor(private inventoryService: InventoryService) {
  }

  ngOnInit(): void {
    this.fetchInventory();
  }

  fetchInventory(): void {
    this.inventoryService.getInventory().subscribe((data) => {
      this.inventory = data.map(item => ({
        ...item,
        lastDate: new Date(item.lastDate),
        expiryDate: item.expiryDate ? new Date(item.expiryDate) : null
      }));
      this.filteredInventory = [...this.inventory];
    });
  }

  addItem(): void {
    if (!this.newItem.ProductName || !this.newItem.ProductId || !this.newItem.Quantity || !this.newItem.Location
      || !this.newItem.LastUpdatedDate) {
      alert('יש למלא את כל השדות פרט לשדה תאריך תוקף והערות.');
      return;
    }

    this.inventoryService.addInventory(this.newItem).subscribe(() => {
      this.fetchInventory();
      this.clearForm();
    });
  }

  deleteItem(id: number): void {
    this.inventoryService.deleteInventory(id).subscribe(() => {
      this.fetchInventory();
    });
  }

  clearForm(): void {
    this.newItem = {
      ProductName: '',
      ProductId: '',
      Quantity: 0,
      Location: '',
      LastUpdatedDate: '',
      ExpiryDate: '',
      Notes: ''
    };
  }

  searchItems(): void {
    if (!this.searchTerm) {
      this.filteredInventory = [...this.inventory];
      return;
    }

    this.filteredInventory = this.inventory.filter((item) =>
      Object.values(item).some((val) =>
        val?.toString().toLowerCase().includes(this.searchTerm.toLowerCase())
      )
    );
  }

  sortItems(key: string): void {
    this.sortKey = key;
    this.sortDirection = !this.sortDirection;
    this.filteredInventory.sort((a, b) => {
      const valueA = a[key];
      const valueB = b[key];

      if (typeof valueA === 'number' && typeof valueB === 'number') {
        return this.sortDirection ? valueA - valueB : valueB - valueA;
      } else if (valueA instanceof Date && valueB instanceof Date) {
        return this.sortDirection ? valueA.getTime() - valueB.getTime() : valueB.getTime() - valueA.getTime();
      } else {
        return this.sortDirection ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA);
      }
    });
  }

  editItem(itemIndex: number) {

  }

  isExpired(expiryDate: any): boolean {
    return false;
  }
}
