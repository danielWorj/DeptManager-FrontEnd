import { Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from "@angular/router";

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {
  role= signal<number>(0);
  constructor(){
    //this.role.set(parseInt(sessionStorage.getItem('role')!)??0); 
    this.role.set(0); 
  }
}
