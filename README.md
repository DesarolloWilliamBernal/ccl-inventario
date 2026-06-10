# MiniSistema de Gestión de Inventario — Activos CCL

Aplicación web para gestionar el inventario de productos de la empresa CCL. Permite a usuarios
autenticados registrar entradas y salidas de productos y consultar el estado del inventario.

- **Backend:** C# / .NET 9 (Minimal Hosting + Controllers) con Entity Framework Core.
- **Frontend:** Angular 19 (standalone components) con Bootstrap 5.
- **Base de datos:** **PostgreSQL** (local, sin Docker), gestionada con EF Core (proveedor Npgsql).
- **Autenticación:** JWT (Bearer Token), credenciales fijas en memoria.

---

## Inicio rápido

Tres pasos para tener todo corriendo. Necesitas **.NET 9**, **Node 18+** y **PostgreSQL** en local
(ver [Requisitos previos](#requisitos-previos)).

**1. Base de datos.** Abre `backend/InventarioCCL.API/appsettings.json` y ajusta la sección
`ConnectionStrings` con el usuario, la contraseña y el puerto de tu PostgreSQL. **No necesitas crear
tablas ni correr migraciones**: la base de datos, las tablas y los datos de ejemplo se crean solos al
arrancar.

**2. Backend** (una terminal):
```bash
cd backend/InventarioCCL.API
dotnet run
```
Queda la API en **http://localhost:5273** y Swagger en **http://localhost:5273/swagger**.

**3. Frontend** (otra terminal):
```bash
cd frontend/ccl-inventory-app
npm install
npm start
```
Queda la app en **http://localhost:4200**; inicia sesión con **admin** / **Admin123!**.

> El detalle de cada paso está más abajo. Si algo de la conexión a la base de datos no funciona,
> revisa la [sección de Backend](#backend) (suele ser solo ajustar usuario/contraseña/puerto).

---

## Requerimientos de la prueba técnica

Objetivo: aplicación web para que usuarios **autenticados** registren entradas y salidas de
productos y consulten el inventario de la empresa CCL.

**Backend — C# (.NET Core 9) y PostgreSQL**

| Requisito                                                            | Estado |
| ------------------------------------------------------------------- | ------ |
| Autenticación con JWT (Bearer Token)                                | Sí     |
| Proteger los endpoints (solo usuarios autenticados)                 | Sí     |
| `POST /auth/login` (credenciales fijas en memoria)                  | Sí     |
| `POST /productos/movimiento` (registrar entrada/salida)             | Sí     |
| `GET /productos/inventario` (consultar inventario)                  | Sí     |
| 1 tabla `productos` (id, nombre, cantidad)                          | Sí     |
| Datos iniciales cargados manualmente (sin migraciones complejas)    | Sí     |
| CRUD con Entity Framework Core                                       | Sí     |
| Sin procedimientos almacenados, sin Docker, config. local           | Sí     |

> Base de datos **PostgreSQL** local (sin Docker), tal como pide la prueba. El esquema y los datos
> iniciales se crean automáticamente al arrancar con `EnsureCreated()` (sin migraciones). La BD trae
> una tabla extra `movimientos` para el historial de auditoría (extra, ver abajo).

**Frontend — Angular (v19) con TypeScript**

| Requisito                                                       | Estado |
| --------------------------------------------------------------- | ------ |
| Login básico con JWT (sin registro ni recuperación)             | Sí     |
| Pantalla para registrar movimiento (entrada/salida)             | Sí     |
| Pantalla para consultar el inventario (productos y cantidades)  | Sí     |
| Validaciones básicas en formularios (campos obligatorios)       | Sí     |

**Entrega**

| Requisito                                                       | Estado |
| --------------------------------------------------------------- | ------ |
| Código en GitHub con commits descriptivos por etapa            | Sí     |
| Instrucciones en un `README.md` para correr en local            | Sí (este archivo) |

### Valor agregado (más allá del mínimo pedido)

Funcionalidades incluidas que no eran obligatorias pero aportan a la solución:

- **CRUD completo de productos** (crear, editar y eliminar), tanto en la API como en la interfaz.
- **Historial de movimientos con auditoría**: cada entrada/salida queda registrada con fecha, tipo,
  cantidad, stock resultante y usuario que la realizó.
- **Dashboard de indicadores** en el inventario (totales, stock bajo, agotados) con **búsqueda** y
  **ordenamiento**.
- **Exportación del inventario a CSV**.
- **Validación de stock** en backend: una salida mayor al disponible se rechaza con `400`.
- **Swagger UI** con botón *Authorize* para probar los endpoints protegidos con el token JWT.
- **Seguridad en el frontend**: *guard* de rutas, *interceptor* que adjunta el token y cierre de
  sesión automático cuando la API responde `401`.
- **Creación automática de la base de datos y datos de ejemplo** al primer arranque, sin migraciones
  ni scripts manuales.

---

## Requisitos previos

- [.NET SDK 9](https://dotnet.microsoft.com/download)
- [PostgreSQL 14+](https://www.postgresql.org/download/) corriendo en local. La aplicación no se
  ejecuta en Docker; cómo levantes tú el servidor de PostgreSQL (instalación nativa o un contenedor)
  es indiferente, solo necesita ser accesible en `localhost`.
- [Node.js 18+](https://nodejs.org/) y npm
- Angular CLI (opcional): `npm install -g @angular/cli`

---

## Backend

### 1. Configurar la base de datos PostgreSQL

La aplicación se conecta a PostgreSQL mediante la cadena de conexión definida en
`backend/InventarioCCL.API/appsettings.json`:

```json
"ConnectionStrings": {
  "DefaultConnection": "Host=localhost;Port=5432;Database=inventario_ccl;Username=postgres;Password=postgres"
}
```

Parámetros de la cadena de conexión:

| Parámetro  | Valor por defecto | Descripción                                                        |
| ---------- | ----------------- | ------------------------------------------------------------------ |
| `Host`     | `localhost`       | Servidor de PostgreSQL.                                             |
| `Port`     | `5432`            | Puerto de PostgreSQL (el estándar de la instalación).              |
| `Database` | `inventario_ccl`  | Nombre de la base de datos (se crea sola, ver abajo).             |
| `Username` | `postgres`        | Usuario de PostgreSQL.                                              |
| `Password` | `postgres`        | Contraseña del usuario.                                             |

> **Ajusta `Username`, `Password` y `Port`** a los de tu instalación local de PostgreSQL antes de
> arrancar. No necesitas crear la base de datos a mano: al iniciar, EF Core ejecuta
> `EnsureCreated()` y crea la base `inventario_ccl`, las tablas `productos` y `movimientos`, y carga
> los **5 productos iniciales** (sin migraciones). Si tu usuario no tiene permiso para crear bases de
> datos, créala una vez manualmente: `createdb -U postgres inventario_ccl` (o `CREATE DATABASE
> inventario_ccl;` desde `psql`/pgAdmin) y vuelve a arrancar.

> **¿Prefieres no modificar `appsettings.json`?** Puedes sobreescribir solo la cadena de conexión sin
> tocar el archivo, con una variable de entorno antes de `dotnet run`:
> ```bash
> # Linux/macOS
> export ConnectionStrings__DefaultConnection="Host=localhost;Port=5432;Database=inventario_ccl;Username=TU_USUARIO;Password=TU_CLAVE"
> # Windows (PowerShell)
> $env:ConnectionStrings__DefaultConnection="Host=localhost;Port=5432;Database=inventario_ccl;Username=TU_USUARIO;Password=TU_CLAVE"
> ```

### 2. Ejecutar la API

```bash
cd backend/InventarioCCL.API
dotnet restore
dotnet run
```

- API disponible en **http://localhost:5273** (perfil `http`).
- **Swagger UI** (solo en Development): **http://localhost:5273/swagger** — permite probar los
  endpoints y autorizar con el token JWT (botón *Authorize*).

### 3. Verificar que funciona

La forma más rápida es desde **Swagger**: ejecuta `POST /auth/login` con el usuario `admin` /
`Admin123!`, copia el `token` de la respuesta, pulsa *Authorize*, pégalo y prueba
`GET /productos/inventario` (debe devolver los 5 productos). También puedes hacerlo por consola:

```bash
curl -X POST http://localhost:5273/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"usuario\":\"admin\",\"password\":\"Admin123!\"}"
```

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
ccl-inventario/
├── backend/InventarioCCL.API/    # API .NET 9 + EF Core (PostgreSQL/Npgsql)
└── frontend/ccl-inventory-app/   # SPA Angular 19 + Bootstrap
```

---

## Notas sobre la base de datos

- El esquema y los datos iniciales viven en `InventarioDbContext.OnModelCreating` (configuración de
  entidades + `HasData` con los 5 productos). Al arrancar, `EnsureCreated()` crea todo; **no hay
  migraciones** (tal como pide la prueba).
- Si cambias el esquema o los datos iniciales, elimina la base `inventario_ccl` (`dropdb -U postgres
  inventario_ccl` o `DROP DATABASE inventario_ccl;`) para que se regenere al siguiente arranque.
- El proveedor es **Npgsql** (`UseNpgsql` en `Program.cs`). El modelo, el `DbContext` y los
  controladores son agnósticos del motor.
