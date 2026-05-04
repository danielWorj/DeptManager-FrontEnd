import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-admin-nvbar',
  imports: [],
  templateUrl: './admin-nvbar.html',
  styleUrl: './admin-nvbar.css',
})
export class AdminNvbar {

  @Output() toggleSidebar = new EventEmitter<void>();

  onToggleSidebar() {
    this.toggleSidebar.emit();
  }
}
