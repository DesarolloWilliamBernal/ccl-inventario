export interface Producto {
  id: number;
  nombre: string;
  cantidad: number;
}

export type TipoMovimiento = 'entrada' | 'salida';

export interface MovimientoRequest {
  productoId: number;
  tipo: TipoMovimiento;
  cantidad: number;
}

/** Datos para crear o editar un producto. */
export interface ProductoRequest {
  nombre: string;
  cantidad: number;
}

/** Registro de auditoría devuelto por el historial. */
export interface Movimiento {
  id: number;
  productoId: number;
  productoNombre: string;
  tipo: TipoMovimiento;
  cantidad: number;
  cantidadResultante: number;
  fecha: string;
  usuario: string;
}
