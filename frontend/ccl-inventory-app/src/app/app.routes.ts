import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./features/login/login.component').then((m) => m.LoginComponent)
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./layout/main-layout/main-layout.component').then((m) => m.MainLayoutComponent),
    children: [
      { path: '', redirectTo: 'inventario', pathMatch: 'full' },
      {
        path: 'inventario',
        loadComponent: () =>
          import('./features/inventario/inventario.component').then((m) => m.InventarioComponent)
      },
      {
        path: 'movimiento',
        loadComponent: () =>
          import('./features/movimiento/movimiento.component').then((m) => m.MovimientoComponent)
      },
      {
        path: 'productos/nuevo',
        loadComponent: () =>
          import('./features/producto-form/producto-form.component').then(
            (m) => m.ProductoFormComponent
          )
      },
      {
        path: 'productos/:id/editar',
        loadComponent: () =>
          import('./features/producto-form/producto-form.component').then(
            (m) => m.ProductoFormComponent
          )
      },
      {
        path: 'historial',
        loadComponent: () =>
          import('./features/historial/historial.component').then((m) => m.HistorialComponent)
      }
    ]
  },
  { path: '**', redirectTo: '' }
];
