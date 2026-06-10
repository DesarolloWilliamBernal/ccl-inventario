import { DatePipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Movimiento, TipoMovimiento } from '../../core/models/producto.model';
import { ProductoService } from '../../core/services/producto.service';

type FiltroTipo = 'todos' | TipoMovimiento;

@Component({
  selector: 'app-historial',
  standalone: true,
  imports: [DatePipe, FormsModule],
  templateUrl: './historial.component.html'
})
export class HistorialComponent implements OnInit {
  private productoService = inject(ProductoService);

  readonly movimientos = signal<Movimiento[]>([]);
  readonly cargando = signal(false);
  readonly error = signal<string | null>(null);
  readonly filtro = signal<FiltroTipo>('todos');

  readonly movimientosVisibles = computed(() => {
    const tipo = this.filtro();
    if (tipo === 'todos') return this.movimientos();
    return this.movimientos().filter((m) => m.tipo === tipo);
  });

  ngOnInit(): void {
    this.cargando.set(true);
    this.productoService.obtenerMovimientos().subscribe({
      next: (data) => {
        this.movimientos.set(data);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar el historial.');
        this.cargando.set(false);
      }
    });
  }
}
