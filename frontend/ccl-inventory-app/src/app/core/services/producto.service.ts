import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Movimiento,
  MovimientoRequest,
  Producto,
  ProductoRequest
} from '../models/producto.model';

@Injectable({ providedIn: 'root' })
export class ProductoService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  obtenerInventario(): Observable<Producto[]> {
    return this.http.get<Producto[]>(`${this.apiUrl}/productos/inventario`);
  }

  crear(producto: ProductoRequest): Observable<Producto> {
    return this.http.post<Producto>(`${this.apiUrl}/productos`, producto);
  }

  actualizar(id: number, producto: ProductoRequest): Observable<Producto> {
    return this.http.put<Producto>(`${this.apiUrl}/productos/${id}`, producto);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/productos/${id}`);
  }

  registrarMovimiento(movimiento: MovimientoRequest): Observable<Producto> {
    return this.http.post<Producto>(`${this.apiUrl}/productos/movimiento`, movimiento);
  }

  obtenerMovimientos(): Observable<Movimiento[]> {
    return this.http.get<Movimiento[]>(`${this.apiUrl}/movimientos`);
  }
}
