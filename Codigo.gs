/**
 * BACKEND - GESTIÓN DE VISITAS (OPTIMIZADO)
 * Versión: 2.0 - Separación de Script y Bloqueo de Concurrencia
 */

const SHEET_ID = SpreadsheetApp.getActiveSpreadsheet().getId();
const TAB_REGISTROS = "BD_Registros";
const TAB_CLIENTES = "Maestra_Clientes";
const TAB_CONFIG = "Configuracion";
const TAB_METAS = "Metas"; // Nueva pestaña para metas

/**
 * Sirve la aplicación web HTML e incluye los archivos externos.
 */
function doGet() {
  return HtmlService.createTemplateFromFile('Index')
    .evaluate()
    .setTitle('Gestión de Visitas Jhon2026')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

/**
 * Función auxiliar para incluir contenido de otros archivos (JS/CSS) en el HTML.
 */
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

/**
 * Obtiene datos iniciales con sanitización de tipos para evitar errores en el buscador.
 */
function getData() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const userEmail = Session.getActiveUser().getEmail();
  
  // 1. Obtener Clientes (CONVERSIÓN A TEXTO OBLIGATORIA)
  const sheetClientes = ss.getSheetByName(TAB_CLIENTES);
  if (!sheetClientes) throw new Error(`No se encontró la pestaña "${TAB_CLIENTES}". Verifique el nombre.`);
  
  const dataClientes = sheetClientes.getDataRange().getValues();
  // Validar que haya datos más allá del encabezado
  if (dataClientes.length <= 1) {
    throw new Error("La tabla de Clientes está vacía.");
  }

  const clientes = dataClientes.slice(1).map(row => ({
    // Convertimos todo a String explícitamente para evitar error "x.includes is not a function"
    id: String(row[0]), 
    nombre: String(row[1]) + " (" + row[0] + ")", 
    rawName: String(row[1]),
    nit: String(row[2])
  })).filter(c => c.id !== "" && c.rawName !== ""); // Filtro de seguridad

  // 2. Configuraciones
  const sheetConfig = ss.getSheetByName(TAB_CONFIG);
  if (!sheetConfig) throw new Error(`No se encontró la pestaña "${TAB_CONFIG}".`);
  
  const lastRowConfig = sheetConfig.getLastRow();
  const motivos = sheetConfig.getRange(2, 1, lastRowConfig - 1, 1).getValues().flat().filter(String);
  const resultados = sheetConfig.getRange(2, 2, lastRowConfig - 1, 1).getValues().flat().filter(String);

  // 3. Historial (Optimizado)
  const sheetReg = ss.getSheetByName(TAB_REGISTROS);
  // Si la hoja está vacía, devolver historial vacío
  let historial = [];
  if (sheetReg.getLastRow() > 1) {
    const dataReg = sheetReg.getDataRange().getValues();
    historial = dataReg.slice(1)
      .filter(r => r[3] === userEmail)
      .slice(-10)
      .reverse()
      .map(r => ({
        fecha: formatDate(new Date(r[2])),
        cliente: String(r[5]),
        resultado: String(r[7]),
        valor: r[11]
      }));
  }

  return {
    user: userEmail,
    clientes: clientes,
    motivos: motivos,
    resultados: resultados,
    historial: historial
  };
}

/**
 * Procesa inserción masiva de registros.
 */
function processBulkForm(formRecords) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const sheet = ss.getSheetByName(TAB_REGISTROS);
  const userEmail = Session.getActiveUser().getEmail();
  const timestamp = new Date();
  
  const newRows = formRecords.map(record => {
    // Sanitización de números
    let valor = parseFloat(record.valor) || 0;
    let descuento = parseFloat(record.descuento) || 0;
    
    // Regla de Negocio: Si es rechazo, valores son 0
    if (record.resultado.toLowerCase().includes("rechazo")) {
      valor = 0;
      descuento = 0;
    }
    
    const valorNeto = valor - descuento;
    const esPedido = (record.resultado === "Pedido Cerrado"); 

    return [
      Utilities.getUuid(), // ID_Registro
      timestamp,           // Marca Temporal
      record.fecha,        // Fecha Visita (String YYYY-MM-DD o Date según input)
      userEmail,           // Vendedor
      record.idCliente,    // ID_Cliente
      record.nombreCliente,// Nombre_Cliente
      record.motivo,       // Motivo
      record.resultado,    // Resultado
      esPedido,            // Pedido_Booleano
      valor,               // Valor_Pedido
      descuento,           // Descuento
      valorNeto,           // Valor_Neto
      record.observacion   // Observacion
    ];
  });

  if (newRows.length > 0) {
    sheet.getRange(sheet.getLastRow() + 1, 1, newRows.length, newRows[0].length).setValues(newRows);
  }
  
  return { success: true, count: newRows.length };
}

/**
 * Crea nuevo cliente con BLOQUEO para evitar IDs duplicados.
 */
function registerNewClient(clientData) {
  const lock = LockService.getScriptLock();
  // Esperar hasta 10 segundos por el bloqueo
  try {
    lock.waitLock(10000); 
  } catch (e) {
    throw new Error("El servidor está ocupado, intenta de nuevo en unos segundos.");
  }

  try {
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const sheet = ss.getSheetByName(TAB_CLIENTES);
    
    // Calcular nuevo ID leyendo la última fila actual
    const data = sheet.getDataRange().getValues();
    let maxId = 0;
    for (let i = 1; i < data.length; i++) {
      if (typeof data[i][0] === 'number' && data[i][0] > maxId) {
        maxId = data[i][0];
      }
    }
    const newId = maxId + 1;

    sheet.appendRow([
      newId,
      clientData.nombre,
      clientData.nit,
      clientData.direccion,
      clientData.telefono,
      clientData.ciudad,
      new Date() // Fecha de Registro Automática
    ]);
    
    return { success: true, newId: newId, nombre: clientData.nombre };

  } catch (error) {
    throw error;
  } finally {
    lock.releaseLock(); // Liberar bloqueo siempre
  }
}

/**
 * OBTIENE DATOS PARA EL DASHBOARD
 * @param {string} periodo - 'hoy', 'semana', 'mes'
 */
function getDashboardData(periodo) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const sheetReg = ss.getSheetByName(TAB_REGISTROS);
  const sheetCli = ss.getSheetByName(TAB_CLIENTES);
  
  if (!sheetReg || !sheetCli) throw new Error("Faltan tablas de datos.");

  const userEmail = Session.getActiveUser().getEmail();
  const dataReg = sheetReg.getDataRange().getValues().slice(1); // Sin encabezado
  
  const now = new Date();
  let startDate = new Date();
  let endDate = new Date();
  
  // Configurar Rango de Fechas
  startDate.setHours(0,0,0,0);
  endDate.setHours(23,59,59,999);

  if (periodo === 'semana') {
    const day = startDate.getDay();
    const diff = startDate.getDate() - day + (day == 0 ? -6 : 1); // Ajustar al lunes
    startDate.setDate(diff);
  } else if (periodo === 'mes') {
    startDate.setDate(1); // Primer día del mes
  }
  // Si es 'hoy', ya está configurado

  // 1. Calcular Métricas de Ventas y Visitas
  let ventasTotal = 0;
  let visitasTotal = 0;
  let pedidosTotal = 0;

  dataReg.forEach(r => {
    // r[2] es Fecha_Visita (asumiendo formato estándar Date en GAS o String YYYY-MM-DD)
    const fechaVisita = new Date(r[2]); 
    // r[3] es Vendedor. Filtramos por usuario actual? 
    // El usuario pidió "mostrar las ventas realizadas por el vendedor", así que filtramos.
    if (r[3] === userEmail) {
      // Validar fecha dentro del rango
      if (fechaVisita >= startDate && fechaVisita <= endDate) {
        visitasTotal++;
        const valorNeto = parseFloat(r[11]) || 0; // Columna L -> Índice 11
        if (valorNeto > 0) {
          ventasTotal += valorNeto;
          pedidosTotal++;
        }
      }
    }
  });

  const ticketPromedio = pedidosTotal > 0 ? (ventasTotal / pedidosTotal) : 0;

  // 2. Calcular Clientes Nuevos
  // Asumimos que la col 6 (índice 6) de Clientes es Fecha_Registro (agregada recientemente)
  let nuevosClientes = 0;
  const dataCli = sheetCli.getDataRange().getValues().slice(1);
  dataCli.forEach(c => {
    const fechaReg = c[6] ? new Date(c[6]) : null;
    if (fechaReg && fechaReg >= startDate && fechaReg <= endDate) {
      nuevosClientes++;
    }
  });

  // 3. Obtener Metas del Mes (Siempre comparamos contra metas mensuales para simplicidad, o ajustamos?)
  // Para hoy/semana calculamos la proyección o mostramos la meta mensual como referencia?
  // El usuario pidió "meta mensual".
  const metas = getGoals(Utilities.formatDate(now, Session.getScriptTimeZone(), "yyyy-MM"));

  return {
    periodo: periodo,
    rango: `${formatDate(startDate)} - ${formatDate(endDate)}`,
    ventas: ventasTotal,
    visitas: visitasTotal,
    ticketProm: ticketPromedio,
    nuevos: nuevosClientes,
    metas: metas
  };
}

/**
 * GESTIÓN DE METAS
 * Guarda/Lee metas en una hoja dedicada 'Metas'
 * Estructura: Mes(YYYY-MM) | Ventas | Visitas | Nuevos | Ticket
 */
function getGoals(monthStr) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  let sheet = ss.getSheetByName(TAB_METAS);
  
  if (!sheet) {
    // Crear hoja si no existe
    sheet = ss.insertSheet(TAB_METAS);
    sheet.appendRow(["Mes", "Meta_Ventas", "Meta_Visitas", "Meta_Nuevos", "Meta_Ticket"]);
  }

  const data = sheet.getDataRange().getValues();
  // Buscar la fila del mes
  const row = data.find(r => r[0] === monthStr);

  if (row) {
    return {
      ventas: row[1],
      visitas: row[2],
      nuevos: row[3],
      ticket: row[4]
    };
  } else {
    // Valores por defecto
    return { ventas: 0, visitas: 0, nuevos: 0, ticket: 0 };
  }
}

function saveGoals(monthStr, goals) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  let sheet = ss.getSheetByName(TAB_METAS);
  if (!sheet) {
    sheet = ss.insertSheet(TAB_METAS);
    sheet.appendRow(["Mes", "Meta_Ventas", "Meta_Visitas", "Meta_Nuevos", "Meta_Ticket"]);
  }

  const data = sheet.getDataRange().getValues();
  let rowIndex = -1;
  
  // Buscar si ya existe para actualizar
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === monthStr) {
      rowIndex = i + 1; // 1-based index
      break;
    }
  }

  if (rowIndex > 0) {
    // Actualizar
    sheet.getRange(rowIndex, 2, 1, 4).setValues([[goals.ventas, goals.visitas, goals.nuevos, goals.ticket]]);
  } else {
    // Crear nuevo
    sheet.appendRow([monthStr, goals.ventas, goals.visitas, goals.nuevos, goals.ticket]);
  }
  
  return { success: true };
}

// Utilidad simple de formato fecha
function formatDate(date) {
  return Utilities.formatDate(date, Session.getScriptTimeZone(), "dd/MM/yyyy");
}

// --- ZONA DE INTERFAZ DE USUARIO (UI) ---

/**
 * Se ejecuta automáticamente al abrir la hoja de cálculo.
 * Crea un menú superior personalizado.
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('🚀 PORTAL VENTAS')
    .addItem('📱 Abrir Formulario Web', 'openWebApp')
    .addToUi();
}

/**
 * Abre un modal con el botón de acceso a la Web App.
 * Esta función se asigna al dibujo o al menú.
 */
function openWebApp() {
  const url = "https://script.google.com/macros/s/AKfycbwvNQwiVD9vnSRHRFpoSXN-d6PO7LVIbWv2fAtDhOv9wyQyG-48Ydtfjpmk0H9s2dN7ww/exec";
  
  // Creamos un HTML pequeño con JavaScript para abrir la ventana
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <base target="_blank">
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
        <style>
          body { display: flex; justify-content: center; align-items: center; height: 100vh; background-color: #f8f9fa; }
          .btn-main { width: 100%; font-weight: bold; padding: 15px; font-size: 18px; }
        </style>
      </head>
      <body>
        <div class="container-fluid">
          <a href="${url}" class="btn btn-primary btn-main shadow" id="btnLink">
            🚀 IR A LA APP
          </a>
          <div class="text-center mt-2 text-muted" style="font-size: 12px;">
            Si no abre automáticamente, haz clic arriba.
          </div>
        </div>
        <script>
          // Intentar abrir automáticamente (puede ser bloqueado por el navegador)
          document.getElementById('btnLink').click();
          // Cerrar este modal automáticamente después de unos segundos
          setTimeout(function() { google.script.host.close(); }, 5000);
        </script>
      </body>
    </html>
  `;

  const htmlOutput = HtmlService.createHtmlOutput(htmlContent)
    .setWidth(300)
    .setHeight(150);
    
  SpreadsheetApp.getUi().showModalDialog(htmlOutput, 'Acceso al Portal');
}