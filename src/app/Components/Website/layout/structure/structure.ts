import { Component } from '@angular/core';
import { ActualiteE } from "../../../Admin/actualite/actualite";
import { SiteNavbar } from "../site-navbar/site-navbar";
import { SiteFooter } from "../site-footer/site-footer";
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-structure',
  imports: [ActualiteE, SiteNavbar, SiteFooter, RouterOutlet],
  templateUrl: './structure.html',
  styleUrl: './structure.css',
})
export class Structure {

}
