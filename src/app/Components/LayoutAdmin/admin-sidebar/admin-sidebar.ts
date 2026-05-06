import { Component, Output, EventEmitter, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from "@angular/router";

@Component({
  selector: 'app-admin-sidebar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './admin-sidebar.html',
  styleUrl: './admin-sidebar.css',
})
export class AdminSidebar {

  // ✅ Émet un événement vers le layout parent pour fermer le sidebar
  @Output() closeSidebar = new EventEmitter<void>();

  role = signal<number>(0);

  constructor() {
    // this.role.set(parseInt(sessionStorage.getItem('role')!) ?? 0);
    this.role.set(0);
  }
}