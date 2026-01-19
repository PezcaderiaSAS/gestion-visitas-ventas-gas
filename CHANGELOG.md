# Changelog

Todos los cambios notables en este proyecto serán documentados en este archivo.

## [2.0.0] - 2026-01-19
### Añadido
- **Dashboard Interactivo**: Nueva pestaña principal con resumen de métricas clave (Ventas, Visitas, Nuevos, Ticket).
- **Sistema de Metas**: Nueva funcionalidad para establecer y persistir objetivos mensuales en la hoja `Metas`.
- **Registro de Creación de Clientes**: Ahora se guarda la fecha de registro (`timestamp`) al crear un nuevo cliente para métricas de captación.
- **Barras de Progreso**: Visualización gráfica del cumplimiento de metas en el Dashboard.
- **Filtros de Tiempo**: Capacidad de filtrar el dashboard por Hoy, Semana y Mes.

### Modificado
- **Interfaz de Usuario (UI)**: Reconstrucción total de `Index.html` utilizando Bootstrap 5 y pestañas de navegación.
- **Estilos**: Migración de estilos inline a un archivo `Stylesheet.html` con diseño "Premium" (sombras suaves, paleta de colores corporativa).
- **Backend (`Codigo.gs`)**: 
    - Optimización de `getDashboardData` para cálculos en el servidor.
    - Actualización de `registerNewClient` para incluir fecha.
- **Navegación**: Se eliminó el menú superior antiguo en favor de una Navbar responsiva.

### Corregido
- Validación de tipos de datos en la carga inicial para evitar errores en búsquedas.
- Manejo de duplicados en la creación de clientes mediante bloqueo de script (`LockService`).

## [1.0.0] - Versión Inicial
- Funcionalidad básica de registro de visitas.
- Listado de historial simple.
