import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd, RouterOutlet } from '@angular/router';
import { HeaderComponent } from './shared/header/header.component';
import { NavbarComponent } from './shared/navbar/navbar.component';
import { FooterComponent } from './shared/footer/footer.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet, 
    HeaderComponent, 
    NavbarComponent, 
    FooterComponent
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'SaludPlus';
  isHome = true;

  // ✅ SOLO estas rutas públicas mostrarán header/navbar/footer
  private publicRoutes = [
    '/',
    '/doctors',
    '/appointments',  // ← AGREGADO
    '/login',
    '/register'
  ];

  constructor(private router: Router) {}

  ngOnInit() {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        // Mostrar layout SOLO en rutas públicas específicas
        this.isHome = this.publicRoutes.includes(event.urlAfterRedirects);
      }
    });
  }
}
