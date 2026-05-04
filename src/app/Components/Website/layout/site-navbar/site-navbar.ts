import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from "@angular/router";

@Component({
  selector: 'app-site-navbar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './site-navbar.html',
  styleUrl: './site-navbar.css',
})
export class SiteNavbar {

}
