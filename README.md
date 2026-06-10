# MiniSistema de Gestión de Inventario — Activos CCL

Aplicación web para gestionar el inventario de productos de la empresa CCL. Permite a usuarios
autenticados registrar entradas y salidas de productos y consultar el estado del inventario.

- **Backend:** C# / .NET 9 (Minimal Hosting + Controllers) con Entity Framework Core.
- **Frontend:** Angular 19 (standalone components) con Bootstrap 5.
- **Base de datos:** SQLite en local (ver nota más abajo sobre PostgreSQL).
- **Autenticación:** JWT (Bearer Token), credenciales fijas en memoria.

> **Nota sobre la base de datos:** la prueba menciona "H2", que es una base de datos del ecosistema
> Java y no tiene proveedor para Entity Framework Core. El equivalente en .NET es **SQLite**: una BD
> local y embebida, igual de simple. El código de EF Core queda idéntico y migrar a **PostgreSQL**
> en el futuro es cambiar una sola línea en `Program.cs` (`UseSqlite` → `UseNpgsql`) y la cadena de
> conexión en `appsettings.json`.

---

## Requerimientos de la prueba técnica

Objetivo: aplicación web para que usuarios **autenticados** registren entradas y salidas de
productos y consulten el inventario de la empresa CCL.

**Backend — C# (.NET Core 9) y PostgreSQL**

| Requisito                                                            | Estado |
| ------------------------------------------------------------------- | ------ |
| Autenticación con JWT (Bearer Token)                                | ✅     |
| Proteger los endpoints (solo usuarios autenticados)                 | ✅     |
| `POST /auth/login` (credenciales fijas en memoria)                  | ✅     |
| `POST /productos/movimiento` (registrar entrada/salida)             | ✅     |
| `GET /productos/inventario` (consultar inventario)                  | ✅     |
| 1 tabla `productos` (id, nombre, cantidad)                          | ✅     |
| Datos iniciales cargados manualmente (sin migraciones complejas)    | ✅     |
| CRUD con Entity Framework Core                                       | ✅     |
| Sin procedimientos almacenados, sin Docker, config. local           | ✅     |

> La prueba pide **PostgreSQL**; en local se usa **SQLite** (equivalente embebido). El cambio a
> PostgreSQL es de una sola línea — ver la sección final. La BD trae una tabla extra `movimientos`
> para el historial de auditoría (extra, ver abajo).

**Frontend — Angular (v19) con TypeScript**

| Requisito                                                       | Estado |
| --------------------------------------------------------------- | ------ |
| Login básico con JWT (sin registro ni recuperación)             | ✅     |
| Pantalla para registrar movimiento (entrada/salida)             | ✅     |
| Pantalla para consultar el inventario (productos y cantidades)  | ✅     |
| Validaciones básicas en formularios (campos obligatorios)       | ✅     |

**Entrega**

| Requisito                                                       | Estado |
| --------------------------------------------------------------- | ------ |
| Código en GitHub con commits descriptivos por etapa            | ✅     |
| Instrucciones en un `README.md` para correr en local            | ✅ (este archivo) |

### Extras implementados (más allá del mínimo)

- **CRUD completo de productos** (crear, editar y eliminar) desde la API y la interfaz.
- **Historial de movimientos** con auditoría (fecha, tipo, cantidad, stock resultante y usuario).
- **Dashboard** con indicadores, **búsqueda** y **ordenamiento** en el inventario.
- **Exportación del inventario a CSV**.
- **Swagger UI** con autorización por token JWT.
- **Guard** de rutas, **interceptor** de JWT y cierre de sesión automático ante un `401`.

---

## Requisitos previos

- [.NET SDK 9](https://dotnet.microsoft.com/download)
- [Node.js 18+](https://nodejs.org/) y npm
- Angular CLI (opcional): `npm install -g @angular/cli`

---

## Backend

```bash
cd backend/InventarioCCL.API
dotnet restore
dotnet run
```

- API disponible en **http://localhost:5273** (perfil `http`).
- Al arrancar crea automáticamente la base de datos `inventario.db` (SQLite) y carga los
  datos iniciales (5 productos). No se requieren migraciones.
- **Swagger UI** (solo en Development): **http://localhost:5273/swagger** — permite probar los
  endpoints y autorizar con el token JWT (botón *Authorize*).

> Si ya tenías una `inventario.db` de una versión anterior, bórrala para que se regenere con la
> tabla de historial de movimientos.

### Credenciales (fijas en memoria, configuradas en `appsettings.json`)

| Usuario | Contraseña  |
| ------- | ----------- |
| `admin` | `Admin123!` |

### Endpoints

| Método | Ruta                     | Protegido | Descripción                                  |
| ------ | ------------------------ | --------- | -------------------------------------------- |
| POST   | `/auth/login`            | No        | Autentica y devuelve un token JWT.           |
| GET    | `/productos/inventario`  | Sí (JWT)  | Lista los productos y sus cantidades.        |
| POST   | `/productos`             | Sí (JWT)  | Crea un nuevo producto.                       |
| PUT    | `/productos/{id}`        | Sí (JWT)  | Actualiza un producto.                        |
| DELETE | `/productos/{id}`        | Sí (JWT)  | Elimina un producto.                          |
| POST   | `/productos/movimiento`  | Sí (JWT)  | Registra una entrada/salida y ajusta stock.  |
| GET    | `/movimientos`           | Sí (JWT)  | Historial de movimientos (filtro `?productoId=`). |

Ejemplo del body de un movimiento:

```json
{ "productoId": 1, "tipo": "salida", "cantidad": 5 }
```

`tipo` admite `"entrada"` o `"salida"`. Una salida mayor al stock disponible devuelve `400`.

---

## Frontend

```bash
cd frontend/ccl-inventory-app
npm install
npm start
```

- Aplicación disponible en **http://localhost:4200**.
- El backend debe estar corriendo en `http://localhost:5273` (configurable en
  `src/environments/environment.ts`).

### Tecnologías

- Angular 19 con **componentes standalone** y **lazy loading** de rutas.
- Estado reactivo con **signals** (`signal` / `computed`).
- **Reactive Forms** para los formularios y sus validaciones.
- **Bootstrap 5** para la maquetación, con paleta corporativa de Activos CCL.

### Rutas

| Ruta                       | Pantalla                       | Protegida |
| -------------------------- | ------------------------------ | --------- |
| `/login`                   | Inicio de sesión               | No        |
| `/inventario`              | Inventario + dashboard         | Sí        |
| `/movimiento`              | Registrar entrada/salida       | Sí        |
| `/productos/nuevo`         | Crear producto                 | Sí        |
| `/productos/:id/editar`    | Editar producto                | Sí        |
| `/historial`               | Historial de movimientos       | Sí        |

Las rutas protegidas cuelgan de un *layout* con barra de navegación y solo son accesibles con
sesión iniciada; en caso contrario el *guard* redirige a `/login`.

### Funcionalidades del frontend

**Autenticación y seguridad**
- Login con diseño corporativo de Activos CCL y validación de campos obligatorios.
- El token JWT se guarda en `localStorage`; un **guard** protege las rutas internas.
- Un **interceptor** adjunta el token (`Authorization: Bearer`) a cada petición y **cierra la
  sesión automáticamente ante un `401`**.
- Barra de navegación con el usuario en sesión y botón de **cerrar sesión**.

**Inventario (pantalla principal)**
- **Dashboard** con indicadores: total de productos, unidades totales, productos con stock bajo
  y agotados.
- Tabla de productos con **indicador de estado** (Disponible / Stock bajo / Agotado).
- **Búsqueda** por nombre y **ordenamiento** por nombre o cantidad.
- **Gestión de productos:** crear, editar y eliminar (con confirmación).
- **Exportar a CSV** el inventario visible.

**Registrar movimiento**
- Formulario de **entrada/salida** con selección de producto, tipo y cantidad, con validaciones.
- Al guardar, **vuelve al inventario** y muestra un mensaje de confirmación con el stock resultante.

**Historial de movimientos**
- Tabla de auditoría: fecha, producto, tipo, cantidad, stock resultante y usuario.
- **Filtro** por entradas / salidas.

### Estructura del frontend

```
src/app/
├── core/
│   ├── models/         # interfaces (auth, producto, movimiento)
│   ├── services/       # AuthService, ProductoService
│   ├── guards/         # authGuard (protege rutas)
│   └── interceptors/   # authInterceptor (token + manejo de 401)
├── features/
│   ├── login/
│   ├── inventario/
│   ├── movimiento/
│   ├── producto-form/  # alta y edición de productos
│   └── historial/
├── layout/
│   └── main-layout/    # navbar + contenedor de rutas autenticadas
├── app.routes.ts       # definición de rutas con lazy loading
└── app.config.ts       # HttpClient + interceptor + router
```

---

## Estructura del repositorio

```
ccl-inventory/
├── backend/InventarioCCL.API/   # API .NET 9 + EF Core
└── frontend/ccl-inventory-app/  # SPA Angular 19 + Bootstrap
```

---

## Migrar a PostgreSQL (futuro)

1. Añadir el paquete: `dotnet add package Npgsql.EntityFrameworkCore.PostgreSQL`.
2. En `Program.cs` cambiar `options.UseSqlite(...)` por `options.UseNpgsql(...)`.
3. Actualizar `ConnectionStrings:DefaultConnection` en `appsettings.json`.

El modelo, el `DbContext` y los controladores no requieren cambios.
