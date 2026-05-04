import { Component, signal } from '@angular/core';
import { AdminSidebar } from "../admin-sidebar/admin-sidebar";
import { AdminFooter } from "../admin-footer/admin-footer";
import { RouterOutlet } from '@angular/router';
import { ActualiteE } from "../../Admin/actualite/actualite";
import { AdminNvbar } from '../admin-nvbar/admin-nvbar';

@Component({
  selector: 'app-structure-layout-admin',
  imports: [AdminSidebar, AdminFooter, RouterOutlet, AdminNvbar],
  templateUrl: './structure-layout-admin.html',
  styleUrl: './structure-layout-admin.css',
})
export class StructureLayoutAdmin {

 
}
