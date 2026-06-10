import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Producto } from '../../core/models/producto.model';
import { ProductoService } from '../../core/services/producto.service';

type CampoOrden = 'nombre' | 'cantidad';

@Component({
  selector: 'app-inventario',
  standalone: true,
  imports: [RouterLink, FormsModule],
  templateUrl: './inventario.component.html'
})
export class InventarioComponent implements OnInit {
  private productoService = inject(ProductoService);

  readonly productos = signal<Producto[]>([]);
  readonly cargando = signal(false);
  readonly error = signal<string | null>(null);
  readonly mensajeExito = signal<string | null>(null);

  readonly busqueda = signal('');
  readonly campoOrden = signal<CampoOrden>('nombre');
  readonly ordenAscendente = signal(true);

  /** Indicadores del dashboard. */
  readonly resumen = computed(() => {
    const items = this.productos();
    return {
      totalProductos: items.length,
      totalUnidades: items.reduce((acc, p) => acc + p.cantidad, 0),
      stockBajo: items.filter((p) => p.cantidad > 0 && p.cantidad <= 20).length,
      agotados: items.filter((p) => p.cantidad === 0).length
    };
  });

  /** Lista filtrada por búsqueda y ordenada por el campo seleccionado. */
  readonly productosVisibles = computed(() => {
    const termino = this.busqueda().trim().toLowerCase();
    const campo = this.campoOrden();
    const factor = this.ordenAscendente() ? 1 : -1;

    return this.productos()
      .filter((p) => p.nombre.toLowerCase().includes(termino))
      .sort((a, b) => {
        if (campo === 'nombre') return a.nombre.localeCompare(b.nombre) * factor;
        return (a.cantidad - b.cantidad) * factor;
      });
  });

  ngOnInit(): void {
    const estado = history.state as { exito?: string };
    if (estado?.exito) {
      this.mensajeExito.set(estado.exito);
    }
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.error.set(null);
    this.productoService.obtenerInventario().subscribe({
      next: (data) => {
        this.productos.set(data);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar el inventario.');
        this.cargando.set(false);
      }
    });
  }

  ordenarPor(campo: CampoOrden): void {
    if (this.campoOrden() === campo) {
      this.ordenAscendente.update((v) => !v);
    } else {
      this.campoOrden.set(campo);
      this.ordenAscendente.set(true);
    }
  }

  eliminar(producto: Producto): void {
    if (!confirm(`¿Eliminar el producto "${producto.nombre}"?`)) {
      return;
    }

    this.productoService.eliminar(producto.id).subscribe({
      next: () => {
        this.productos.update((lista) => lista.filter((p) => p.id !== producto.id));
        this.mensajeExito.set(`Producto "${producto.nombre}" eliminado.`);
      },
      error: (err) => this.error.set(err?.error?.mensaje ?? 'No se pudo eliminar el producto.')
    });
  }

  claseStock(cantidad: number): string {
    if (cantidad === 0) return 'text-bg-danger';
    if (cantidad <= 20) return 'text-bg-warning';
    return 'text-bg-success';
  }

  /** Exporta el inventario visible a un archivo CSV descargable. */
  exportarCsv(): void {
    const filas = this.productosVisibles();
    if (filas.length === 0) {
      return;
    }

    const encabezado = ['Id', 'Nombre', 'Cantidad'];
    const escapar = (valor: string | number) => `"${String(valor).replace(/"/g, '""')}"`;

    const contenido = [
      encabezado.join(','),
      ...filas.map((p) => [p.id, escapar(p.nombre), p.cantidad].join(','))
    ].join('\r\n');

    // BOM para que Excel respete los acentos.
    const blob = new Blob(['﻿' + contenido], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const enlace = document.createElement('a');
    enlace.href = url;
    enlace.download = 'inventario.csv';
    enlace.click();
    URL.revokeObjectURL(url);
  }
}
