import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Producto, TipoMovimiento } from '../../core/models/producto.model';
import { ProductoService } from '../../core/services/producto.service';

@Component({
  selector: 'app-movimiento',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './movimiento.component.html'
})
export class MovimientoComponent implements OnInit {
  private fb = inject(FormBuilder);
  private productoService = inject(ProductoService);
  private router = inject(Router);

  readonly productos = signal<Producto[]>([]);
  readonly enviando = signal(false);
  readonly error = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    productoId: [null as number | null, [Validators.required]],
    tipo: ['entrada' as TipoMovimiento, [Validators.required]],
    cantidad: [1, [Validators.required, Validators.min(1)]]
  });

  ngOnInit(): void {
    this.productoService.obtenerInventario().subscribe({
      next: (data) => this.productos.set(data),
      error: () => this.error.set('No se pudieron cargar los productos.')
    });
  }

  enviar(): void {
    this.error.set(null);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.enviando.set(true);
    const { productoId, tipo, cantidad } = this.form.getRawValue();

    this.productoService
      .registrarMovimiento({ productoId: productoId!, tipo, cantidad })
      .subscribe({
        next: (producto) => {
          this.enviando.set(false);
          // Tras registrar el movimiento, volvemos al inventario y mostramos
          // un mensaje de confirmación con el stock actualizado.
          this.router.navigate(['/inventario'], {
            state: {
              exito: `Movimiento registrado: "${producto.nombre}" ahora tiene ${producto.cantidad} unidades.`
            }
          });
        },
        error: (err) => {
          this.enviando.set(false);
          this.error.set(err?.error?.mensaje ?? 'No se pudo registrar el movimiento.');
        }
      });
  }

  esInvalido(campo: string): boolean {
    const control = this.form.get(campo);
    return !!control && control.invalid && (control.dirty || control.touched);
  }
}
