import { Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from "@angular/router";
import { ConfigService } from '../../../../Core/Service/Config/config-service';
import { Departement } from '../../../../Core/Model/Structure/Departement';

@Component({
  selector: 'app-site-navbar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './site-navbar.html',
  styleUrl: './site-navbar.css',
})
export class SiteNavbar {
  constructor(private configService : ConfigService) {
    this.getAllDepartements();
  }

  listDepartements = signal<Departement[]>([]);
  getAllDepartements() {
    this.configService.getAllDepartement().subscribe({
      next: (response) => {
        this.listDepartements.set(response);
      },
      error: (error) => {
        console.error('Error fetching departements:', error);
      }
    });
  }

}
