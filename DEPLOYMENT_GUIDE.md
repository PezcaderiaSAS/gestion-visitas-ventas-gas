# Guía de Despliegue en Google Apps Script

Sigue estos pasos para llevar tu código local a la nube de Google y activar la aplicación web.

## Opción 1: Copiar y Pegar (Más Sencillo)

Si no tienes herramientas de línea de comandos avanzadas (como CLASP), esta es la forma más rápida.

1.  Abre tu proyecto en [script.google.com](https://script.google.com/).
2.  **Crea/Actualiza los archivos**:
    *   Copia el contenido de `Codigo.gs` local y pégalo en el archivo `Código.gs` del editor en línea. (Asegúrate de no borrar funciones que no estén en tu local si usas otras librerías, pero para este proyecto, reemplaza todo).
    *   Crea un archivo HTML llamado `Index` y pega el contenido de `Index.html`.
    *   Crea un archivo HTML llamado `JavaScript` y pega el contenido de `JavaScript.html`.
    *   Crea un archivo HTML llamado `Stylesheet` y pega el contenido de `Stylesheet.html`.
3.  **Habilitar servicios**:
    *   Si usas servicios avanzados (tu código actual usa servicios estándar, así que no es necesario).
4.  **Desplegar**:
    *   Haz clic en el botón azul **Implementar** (o Deploy) > **Nueva implementación**.
    *   Selecciona el tipo **Aplicación web**.
    *   Descripción: "Versión 2.0 Dashboard".
    *   **Ejecutar como**: "Yo" (importante para permisos de Sheet).
    *   **Quién tiene acceso**: "Cualquiera con cuenta de Google" (o cualqueira en tu dominio).
    *   Haz clic en **Implementar**.
5.  **Copiar URL**: Google te dará una URL (termina en `/exec`). Esa es la dirección de tu nueva app.

## Opción 2: Usar CLASP (Avanzado)

Si tienes Node.js instalado y quieres sincronizar desde la terminal.

1.  Instala CLASP: `npm install -g @google/clasp`
2.  Inicia sesión: `clasp login`
3.  Vincula tu proyecto remoto: `clasp clone <SCRIPT_ID>` (El ID está en la URL de tu proyecto GAS).
4.  Sube los cambios:
    ```bash
    clasp push
    ```
5.  Abre para desplegar: `clasp open`

---
**Nota Importante**: Recuerda que la funcionalidad de Metas requiere que exista la hoja llamada `Metas` en tu Google Sheet. El código la creará automáticamente al intentar guardar metas por primera vez, pero asegúrate de que el script tenga permisos de edición sobre la hoja de cálculo.
