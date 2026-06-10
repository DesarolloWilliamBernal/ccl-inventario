import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductoService } from '../../core/services/producto.service';

@Component({
  selector: 'app-producto-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './producto-form.component.html'
})
export class ProductoFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private productoService = inject(ProductoService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  readonly guardando = signal(false);
  readonly error = signal<string | null>(null);
  readonly id = signal<number | null>(null);

  readonly form = this.fb.nonNullable.group({
    nombre: ['', [Validators.required, Validators.maxLength(150)]],
    cantidad: [0, [Validators.required, Validators.min(0)]]
  });

  get esEdicion(): boolean {
    return this.id() !== null;
  }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      const id = Number(idParam);
      this.id.set(id);
      // Carga el producto a editar a partir del inventario.
      this.productoService.obtenerInventario().subscribe({
        next: (productos) => {
          const producto = productos.find((p) => p.id === id);
          if (producto) {
            this.form.patchValue({ nombre: producto.nombre, cantidad: producto.cantidad });
          } else {
            this.error.set('El producto no existe.');
          }
        },
        error: () => this.error.set('No se pudo cargar el producto.')
      });
    }
  }

  enviar(): void {
    this.error.set(null);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.guardando.set(true);
    const datos = this.form.getRawValue();
    const id = this.id();

    const peticion = id
      ? this.productoService.actualizar(id, datos)
      : this.productoService.crear(datos);

    peticion.subscribe({
      next: (producto) => {
        this.guardando.set(false);
        this.router.navigate(['/inventario'], {
          state: {
            exito: id
              ? `Producto "${producto.nombre}" actualizado.`
              : `Producto "${producto.nombre}" creado.`
          }
        });
      },
      error: (err) => {
        this.guardando.set(false);
        this.error.set(err?.error?.mensaje ?? 'No se pudo guardar el producto.');
      }
    });
  }

  esInvalido(campo: string): boolean {
    const control = this.form.get(campo);
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  cancelar(): void {
    this.router.navigate(['/inventario']);
  }
}
