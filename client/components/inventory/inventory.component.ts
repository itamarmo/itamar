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
    SKU: '',
    Quantity: 0,
    Location: '',
    LastUpdatedDate: '',
    ExpiryDate: null,
    Notes: ''
  };
  filteredInventory: any[] = [];
  searchTerm = '';
  sortKey = '';
  sortDirection = true;
  sortField: any;
  editingIndex: number | null = null;
  editedItem: any = {};

  constructor(private inventoryService: InventoryService) {
  }

  ngOnInit(): void {
    this.fetchInventory();
  }

  fetchInventory(): void {
    this.inventoryService.getInventory().subscribe((data) => {
     this.inventory = data.map(item => ({
	  ...item,
	  LastUpdatedDate: new Date(item.LastUpdatedDate),
	  ExpiryDate: item.ExpiryDate ? new Date(item.ExpiryDate) : null
	}));
      this.filteredInventory = [...this.inventory];
    });
  }

  addItem(): void {
	   // בדיקה אם יש פריט זהה במלאי
	  //const existingItem = this.inventory.find(item =>
		//item.ProductName === this.newItem.ProductName &&
		//item.SKU === this.newItem.SKU &&
		//item.Location === this.newItem.Location
	 // );
	 const existingItem = this.inventory.find(item =>
  item.ProductName.trim().toLowerCase() === this.newItem.ProductName.trim().toLowerCase() &&
  item.SKU.trim().toLowerCase() === this.newItem.SKU.trim().toLowerCase() &&
  item.ItemLocation.trim().toLowerCase() === this.newItem.Location.trim().toLowerCase()
);


	  if (existingItem) {
		alert('פריט עם אותם נתונים ומיקום כבר קיים במלאי.');
		return;
	  }
    if (!this.newItem.ProductName || !this.newItem.SKU || !this.newItem.Quantity || !this.newItem.Location
      || !this.newItem.LastUpdatedDate) {
      alert('יש למלא את כל השדות פרט לשדה תאריך תוקף והערות.');
      return;
    }

    this.inventoryService.addInventory(this.newItem).subscribe(() => {
      this.fetchInventory();
      this.clearForm();
    });
  }

  //deleteItem(i: number): void {
//	console.log("index:", i);
  //  this.inventoryService.deleteInventory(i).subscribe(() => {
  //    this.fetchInventory();
  //  });
  //}

  deleteItem(item: any): void {
  if (!item.ProductID) {
    alert("לא נמצא מזהה מוצר למחיקה.");
    return;
  }

  this.inventoryService.deleteInventory(item.ProductID).subscribe(() => {
    this.fetchInventory();
  });
}


  clearForm(): void {
    this.newItem = {
      ProductName: '',
      SKU: '',
      Quantity: 0,
      Location: '',
      LastUpdatedDate: '',
      ExpiryDate: null,
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

  //sortItems(): void {
  //if (!this.sortField) return; // אם לא נבחר שדה, לא נבצע מיון

  //this.filteredInventory.sort((a, b) => {
  //  const valueA = a[this.sortField];
  //  const valueB = b[this.sortField];

    // אם המפתח הוא תאריך, נוודא שאנחנו ממיינים נכון (לפי זמן)
  //  if (valueA instanceof Date && valueB instanceof Date) {
  //    return valueA.getTime() - valueB.getTime(); // מיון לפי זמן
  //  }

    // מיון לפי מספרים (כמות לדוגמה)
  //  if (typeof valueA === 'number' && typeof valueB === 'number') {
  //    return valueA - valueB;
  //  }

    // מיון לפי מחרוזות (טקסט)
   // if (typeof valueA === 'string' && typeof valueB === 'string') {
   //   return valueA.localeCompare(valueB);
   // }

   // return 0;
  //});
//}
sortItems(): void {
  if (!this.sortField) return;

  this.filteredInventory.sort((a, b) => {
    let valueA = a[this.sortField];
    let valueB = b[this.sortField];

    // תמיכה בשם שונה בפועל (ItemLocation)
    if (this.sortField === 'Location') {
      valueA = a.ItemLocation || '';
      valueB = b.ItemLocation || '';
    }

    // מיון תאריכים
    const isDate = (val: any) => val instanceof Date || (!isNaN(Date.parse(val)) && typeof val === 'string');

    if (isDate(valueA) && isDate(valueB)) {
      const dateA = new Date(valueA).getTime();
      const dateB = new Date(valueB).getTime();
      return dateA - dateB;
    }

    // מיון מספרים
    if (typeof valueA === 'number' && typeof valueB === 'number') {
      return valueA - valueB;
    }

    // מיון טקסט
    if (typeof valueA === 'string' && typeof valueB === 'string') {
      return valueA.localeCompare(valueB);
    }

    return 0;
  });

  // אם הסימון הוא הפוך
 // if (!this.sortDirection) {
  //  this.filteredInventory.reverse();
 // }
}



  editItem(index: number) {
    this.editingIndex = index;
    this.editedItem = { ...this.filteredInventory[index] }; // clone to avoid binding directly
  }

  saveItem(index: number) {
    this.inventoryService.editInventory(this.editedItem).subscribe(() => {
      this.filteredInventory[index] = { ...this.editedItem };
      this.editingIndex = null;
    });
  }

  cancelEdit() {
    this.editingIndex = null;
  }

  isExpired(expiryDate: any): boolean {
  if (!expiryDate) {
    return false; // אם לא צוין תאריך תפוגה, נניח שזה לא פג תוקף
  }

  const currentDate = new Date(); // מקבלים את התאריך הנוכחי
  const expiry = new Date(expiryDate); // הופכים את תאריך התפוגה לאובייקט תאריך

  return expiry < currentDate; // אם תאריך התפוגה קטן מהתאריך הנוכחי, זה פג תוקף
}

}
