import { Component, Output, EventEmitter, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from "@angular/router";

@Component({
  selector: 'app-admin-sidebar',
  imports: [RouterLink],
  templateUrl: './admin-sidebar.html',
  styleUrl: './admin-sidebar.css',
})
export class AdminSidebar {

  @Output() closeSidebar = new EventEmitter<void>();

  role = signal<number>(0);
  activeItem = signal<string>('');

  constructor() {
    this.role.set(parseInt(localStorage.getItem('role')!) ?? 0);
    console.log('Le role recu est :', this.role()); 
    //this.role.set(0);
  }

  setActive(item: string) {
    this.activeItem.set(item);
  }
}