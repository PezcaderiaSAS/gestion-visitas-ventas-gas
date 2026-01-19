# Gestión de Visitas y Ventas Profesional 🚀

Sistema de gestión comercial basado en **Google Apps Script**, diseñado para potenciar la productividad de vendedores con un seguimiento detallado de rutas, clientes y cumplimiento de metas.

![Banner](https://via.placeholder.com/800x200?text=Gestion+Comercial+Dashboard) *Nota: Reemplazar con captura real.*

## 📋 Características Principales

*   **Dashboard Ejecutivo**: Visualización en tiempo real de KPIs:
    *   💰 Ventas Totales vs Meta Mensual.
    *   📍 Visitas Efectivas vs Meta.
    *   👥 Clientes Nuevos Captados.
    *   🎫 Ticket Promedio de Venta.
*   **Gestión de Rutas**: Formulario optimizado para registro rápido de visitas en campo.
*   **Base de Datos de Clientes**: Búsqueda inteligente y creación rápida de nuevos clientes con validación de duplicados.
*   **Control de Metas**: Interfaz para definir y ajustar objetivos mensuales.
*   **Diseño Premium**: Interfaz moderna y responsiva construida con **Bootstrap 5** y CSS personalizado.

## 🛠️ Tecnologías

*   **Backend**: Google Apps Script (Javascript en la nube).
*   **Base de Datos**: Google Sheets (CSV simulados para portabilidad).
*   **Frontend**: HTML5, CSS3, Bootstrap 5.
*   **Librerías**: Chart.js (Gráficos), SweetAlert2 (Notificaciones).

## 🚀 Instalación y Despliegue

### Prerrequisitos
1.  Una cuenta de Google.
2.  Acceso a Google Drive y Google Sheets.

### Configuración en Google Apps Script
1.  Sube los archivos `.gs` y `.html` a tu proyecto de Apps Script.
2.  Asegúrate de tener un Google Sheet vinculado con las siguientes pestañas:
    *   `BD_Registros`
    *   `Maestra_Clientes`
    *   `Configuracion`
    *   `Metas` (se creará automáticamente si no existe).
3.  Despliega como Aplicación Web:
    *   **Ejecutar como**: "Yo" (propietario).
    *   **Quién tiene acceso**: "Cualquiera" o "Cualquiera en mi organización" (según privacidad).

## 📂 Estructura del Proyecto

```
/
├── Codigo.gs           # Lógica del servidor (Backend)
├── Index.html          # Estructura principal de la UI
├── JavaScript.html     # Lógica del cliente (Frontend)
├── Stylesheet.html     # Estilos personalizados (CSS)
└── appscript.json      # Manifiesto del proyecto GAS
```

## 🤝 Contribución

1.  Haz un Fork del proyecto.
2.  Crea tu rama de características (`git checkout -b feature/NuevaCaracteristica`).
3.  Haz Commit de tus cambios (`git commit -m 'Agrega nueva característica'`).
4.  Haz Push a la rama (`git push origin feature/NuevaCaracteristica`).
5.  Abre un Pull Request.

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE.md](LICENSE.md) para más detalles.

---
Desarrollado para **Yurgen** - *Enero 2026*
