// =====================================================
// ADMIN VENTAS B2B FEN - Google Apps Script · Code.gs v2.0.0 (2026-10-02)
// v2.0.0: las llamadas entran por Seguridad.gs (sesión del dueño o de la
// persona de despacho). Aquí, la antigua handleRequest se llama
// ejecutarAccionLegada(data). El resto del código es el mismo.
// =====================================================

const SHEET_ID = '1iZA6467dXZ1EWi8P3TzKfFTwodmcbeZiaJAUhsAsLUc';

// Fuente de nombres de fën-producción (CSV publicado, se actualiza solo al
// aprobar recetas). Columnas: ID_receta, nombre, área, estado.
const FEN_MAESTRO_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRKvAbWUlwxbcCx54T3lfdMa8XxPD-F2lSE05-vMfdv_UpFVpDi6pbAJOpM7O6LBLmdfkz5804lzMYn/pub?gid=1370945279&single=true&output=csv';

// v2.0.0: doGet/doPost se movieron a Seguridad.gs (archivo nuevo en el mismo
// proyecto), que revisa la sesión (dueño o persona de despacho) y los
// permisos, y recién entonces llama a esta función con los datos ya leídos.
// Devuelve el objeto de respuesta (antes devolvía el texto JSON).
function ejecutarAccionLegada(data) {
  const params = {};
  const body = data || {};
  const action = body.action;

  // Diagnóstico: responde sin tocar la planilla para nada. Si esto funciona
  // siempre y las demás acciones siguen fallando, confirma que el problema
  // está en interactuar con esta Sheet (grande, muchas pestañas), no en el
  // despliegue o la cuenta en general.
  if (action === 'ping') {
    return { ok: true, pong: true, hora: new Date().toISOString() };
  }

  const ss = SpreadsheetApp.openById(SHEET_ID);

  let result;
  try {
    switch(action) {
      case 'getClientes':          result = getClientes(ss); break;
      case 'getProductos':         result = getProductos(ss); break;
      case 'getPrecios':           result = getPrecios(ss); break;
      case 'getOrdenes':           result = getOrdenes(ss); break;
      case 'getDetalles':          result = getDetalles(ss); break;
      case 'addOrden':             result = addOrden(ss, body); break;
      case 'updateOrden':          result = updateOrden(ss, body); break;
      case 'getEdicionesOrdenes':  result = getEdicionesOrdenes(ss); break;
      case 'updateOrdenAdmin':     result = updateOrdenAdmin(ss, body); break;
      case 'deleteOrden':          result = eliminarOrdenDefinitivo(ss, body); break;
      case 'asignarFolio':         result = asignarFolio(ss, body); break;
      case 'registrarPago':        result = registrarPago(ss, body); break;
      case 'registrarAbono':       result = registrarAbono(ss, body); break;
      case 'procesarCartolaBancaria': result = procesarCartolaBancaria(ss, body); break;
      case 'confirmarConciliacion':   result = confirmarConciliacion(ss, body); break;
      case 'getConciliacionPendiente': result = getConciliacionPendiente(ss); break;
      case 'getAbonos':            result = getAbonos(ss); break;
      case 'addCliente':           result = addCliente(ss, body); break;
      case 'editarCliente':        result = editarCliente(ss, body); break;
      case 'addProducto':          result = addProducto(ss, body); break;
      case 'editarProducto':       result = editarProducto(ss, body); break;
      case 'addPrecio':            result = addPrecio(ss, body); break;
      case 'eliminarPrecio':       result = eliminarPrecio(ss, body); break;
      case 'updateClienteFacturacion': result = updateClienteFacturacion(ss, body); break;
      case 'updateClienteFrecuenciaPago': result = updateClienteFrecuenciaPago(ss, body); break;
      case 'getMaestroRecetasFen':  result = getMaestroRecetasFen(); break;
      case 'sincronizarConFen':     result = sincronizarConFen(ss); break;
      case 'vincularProductoFen':   result = vincularProductoFen(ss, body); break;
      case 'getEquivalenciasNombres': result = getEquivalenciasNombres(ss); break;
      case 'getListaPreciosNuevosClientes': result = getListaPreciosNuevosClientes(ss); break;
      case 'guardarListaPreciosNuevosClientes': result = guardarListaPreciosNuevosClientes(ss, body); break;
      case 'guardarEquivalenciaNombre': result = guardarEquivalenciaNombre(ss, body); break;
      case 'eliminarEquivalenciaNombre': result = eliminarEquivalenciaNombre(ss, body); break;
      case 'getSeguimientoReconciliacion': result = getSeguimientoReconciliacion(ss); break;
      case 'marcarSeguimientoReconciliacion': result = marcarSeguimientoReconciliacion(ss, body); break;
      case 'reescribirNombreProducto': result = reescribirNombreProducto(ss, body); break;
      case 'getRecetasOcultasB2B': result = getRecetasOcultasB2B(ss); break;
      case 'ocultarRecetaB2B':     result = ocultarRecetaB2B(ss, body); break;
      case 'mostrarRecetaB2B':     result = mostrarRecetaB2B(ss, body); break;
      case 'generarVentasMensualesFen': result = generarVentasMensualesFen(ss); break;
      case 'generarVentasMensualesTotalB2B': result = generarVentasMensualesTotalB2B(ss); break;
      case 'generarCobrosMensualesB2B': result = generarCobrosMensualesB2B(ss); break;
      case 'diagnosticoCobrosMes': result = diagnosticoCobrosMes(ss, body); break;
      case 'getOrdenesHistorico':  result = getOrdenesHistorico(ss); break;
      case 'getDetallesHistorico': result = getDetallesHistorico(ss); break;
      case 'archivarOrdenes':      result = archivarOrdenes(ss); break;
      case 'getUltimoArchivado':   result = getUltimoArchivado(ss); break;
      case 'verificarArchivado':   result = verificarArchivado(ss); break;
      case 'getEstadisticasArchivado': result = getEstadisticasArchivado(ss); break;
      case 'sincronizarDetalle':   result = sincronizarDetalleHistorico(ss); break;
      default: result = { error: 'Accion no reconocida: ' + action };
    }
  } catch(err) {
    result = { error: err.toString() };
  }

  return result;
}

// =========================================
// LECTURA
// =========================================

function getClientes(ss) {
  const sh = ss.getSheetByName('Clientes');
  const data = sh.getDataRange().getValues();
  const headers = data[0];
  // Autocompletamos celdas vacías de frecuencia con 'Diaria' directamente en la
  // Sheet. Esto evita el bug donde el selector en la app YA muestra "Diaria" por
  // defecto (cuando la celda está vacía) y por lo tanto el navegador nunca dispara
  // el evento de cambio al elegirla explícitamente — dejando la celda vacía para
  // siempre y rompiendo cualquier función que dependa de ese valor.
  var colFact = headers.indexOf('Facturacion');
  if (colFact === -1) colFact = headers.indexOf('Facturación');
  var colFreq = headers.indexOf('Frecuencia Pago');
  for (var i = 1; i < data.length; i++) {
    if (!data[i][0]) continue;
    if (colFact !== -1 && !data[i][colFact]) {
      sh.getRange(i + 1, colFact + 1).setValue('Diaria');
      data[i][colFact] = 'Diaria';
    }
    if (colFreq !== -1 && !data[i][colFreq]) {
      sh.getRange(i + 1, colFreq + 1).setValue('Diaria');
      data[i][colFreq] = 'Diaria';
    }
  }
  return data.slice(1).filter(r => r[0]).map(r => {
    const obj = {};
    headers.forEach((h, i) => obj[h] = r[i]);
    return obj;
  });
}

function getProductos(ss) {
  const sh = ss.getSheetByName('Productos');
  const data = sh.getDataRange().getValues();
  const headers = data[0];
  return data.slice(1).filter(r => r[0]).map(r => {
    const obj = {};
    headers.forEach((h, i) => obj[h] = r[i]);
    return obj;
  });
}

function getPrecios(ss) {
  const sh = ss.getSheetByName('Precios');
  const data = sh.getDataRange().getValues();
  const headers = data[0];
  return data.slice(1).filter(r => r[0]).map(r => {
    const obj = {};
    headers.forEach((h, i) => obj[h] = r[i]);
    return obj;
  });
}

function getOrdenes(ss) {
  const sh = ss.getSheetByName('Resumen Facturas');
  const data = sh.getDataRange().getValues();
  if (data.length < 2) return [];
  const headers = data[0];
  return data.slice(1).filter(r => r[0]).map(r => {
    const obj = {};
    headers.forEach((h, i) => obj[h] = r[i]);
    return obj;
  });
}

function getDetalles(ss) {
  const sh = ss.getSheetByName('Detalle Ventas');
  const data = sh.getDataRange().getValues();
  if (data.length < 2) return [];
  const headers = data[0];
  return data.slice(1).filter(r => r[0]).map(r => {
    const obj = {};
    headers.forEach((h, i) => obj[h] = r[i]);
    return obj;
  });
}

// =========================================
// NUEVA ORDEN
// =========================================

function addOrden(ss, body) {
  const { nOrden, fecha, cliente, lineas, condPago, notas } = body;

  // Nunca crear una orden en blanco en silencio — si por cualquier motivo
  // llegan las líneas vacías, es mejor un error explícito que una orden
  // fantasma con $0 y sin productos.
  if (!lineas || !lineas.length) {
    return { error: 'No se puede crear la orden N°' + nOrden + ': llegó sin líneas de producto.' };
  }

  const detalle = ss.getSheetByName('Detalle Ventas');
  const resumen = ss.getSheetByName('Resumen Facturas');

  // ── Guardia anti-duplicado ──────────────────────────────────────────
  // Si el navegador reintentó el envío (por una entrega fallida de Google,
  // algo intermitente y conocido en esta app) puede llegar la MISMA orden
  // dos veces. Si el N° de orden ya existe en cualquiera de las dos hojas,
  // no la volvemos a escribir — evita que dos ejecuciones casi simultáneas
  // se pisen entre sí insertando filas.
  const yaExisteDetalle = detalle.getDataRange().getValues().slice(1)
    .some(r => String(r[0]) === String(nOrden));
  const yaExisteResumen = resumen.getDataRange().getValues().slice(1)
    .some(r => String(r[0]) === String(nOrden));
  if (yaExisteDetalle || yaExisteResumen) {
    return { error: 'La orden N°' + nOrden + ' ya existe en el sistema (probable reintento de guardado). No se volvió a crear.' };
  }

  const totalNeto  = lineas.reduce((s, l) => s + l.cantidad * l.precioUnit, 0);
  const ivaTotal   = Math.round(totalNeto * 0.19);
  const totalTotal = totalNeto + ivaTotal;

  // ── 1) Resumen primero (una sola fila, operación rápida) ───────────
  resumen.insertRowAfter(1);
  resumen.getRange(2, 1, 1, 10).setValues([[
    nOrden, fecha, cliente,
    totalNeto, ivaTotal, totalTotal,
    'PENDIENTE', 'Pendiente', 'Pendiente', notas || ''
  ]]);

  // ── 2) Detalle: todas las líneas en UN solo paquete ─────────────────
  // (antes era una inserción+escritura por línea; juntarlas en una sola
  // operación reduce a una fracción la ventana en la que una ejecución
  // puede cortarse a mitad de camino y dejar líneas faltantes)
  const filasDetalle = lineas.map(l => {
    const neto = l.cantidad * l.precioUnit;
    const iva  = Math.round(neto * 0.19);
    const tot  = neto + iva;
    return [
      nOrden, fecha, cliente, l.producto,
      l.cantidad, l.precioUnit, neto, iva, tot,
      'PENDIENTE', 'Pendiente', 'Pendiente', notas || ''
    ];
  });
  detalle.insertRowsAfter(1, filasDetalle.length);
  detalle.getRange(2, 1, filasDetalle.length, 13).setValues(filasDetalle);

  // ── 3) Verificación real: releer lo recién escrito y comparar ──────
  const detalleGuardado = detalle.getRange(2, 1, filasDetalle.length, 6).getValues();
  const lineasGuardadasOk = detalleGuardado.every(r => String(r[0]) === String(nOrden));
  const netoGuardado = detalleGuardado.reduce((s, r) => s + Number(r[5] || 0), 0);
  const resumenGuardado = resumen.getRange(2, 1, 1, 4).getValues()[0];
  const resumenOk = String(resumenGuardado[0]) === String(nOrden)
    && Number(resumenGuardado[3]) === totalNeto;

  if (!lineasGuardadasOk || !resumenOk || detalleGuardado.length !== filasDetalle.length) {
    // Algo no cuadra con lo que se intentó guardar — deshacemos lo que se
    // alcanzó a escribir para no dejar una orden a medias, y avisamos con
    // un error explícito en vez de devolver éxito.
    try {
      eliminarFilasEnHoja(ss, 'Detalle Ventas', nOrden, 0);
      eliminarFilasEnHoja(ss, 'Resumen Facturas', nOrden, 0);
    } catch (eRollback) {
      return { error: 'La orden N°' + nOrden + ' se guardó incompleta Y no se pudo deshacer automáticamente. Revisa la planilla manualmente antes de seguir.' };
    }
    return { error: 'La orden N°' + nOrden + ' se guardó incompleta (no coincidió lo escrito con lo enviado). Se deshizo el guardado parcial — vuelve a intentar.' };
  }

  return { ok: true, nOrden, total: totalTotal };
}

// =========================================
// ASIGNAR FOLIO SII
// =========================================

function asignarFolio(ss, body) {
  const { nOrden, folioSII, fechaFolio } = body;
  const enDetalle = actualizarColumnaEnHoja(ss, 'Detalle Ventas', nOrden, 0, 11, folioSII);
  const enResumen = actualizarColumnaEnHoja(ss, 'Resumen Facturas', nOrden, 0, 8, folioSII);
  if (fechaFolio) {
    var colDV = obtenerOCrearColumnaPorNombre(ss.getSheetByName('Detalle Ventas'), 'Fecha Folio');
    var colRF = obtenerOCrearColumnaPorNombre(ss.getSheetByName('Resumen Facturas'), 'Fecha Folio');
    actualizarColumnaEnHojaTexto(ss, 'Detalle Ventas', nOrden, 0, colDV, fechaFolio);
    actualizarColumnaEnHojaTexto(ss, 'Resumen Facturas', nOrden, 0, colRF, fechaFolio);
  }
  // Antes esto no avisaba nada si la orden no existía en alguna de las dos
  // hojas — así fue como un folio quedó "pegado" a una orden con Detalle
  // incompleto y sin fila en Resumen, sin que nadie lo notara.
  if (enDetalle === 0 && enResumen === 0) {
    return { error: 'No se encontró la orden N°' + nOrden + ' en Detalle Ventas ni en Resumen Facturas — no se asignó el folio.' };
  }
  if (enDetalle === 0) {
    return { error: 'Folio asignado en Resumen Facturas, pero la orden N°' + nOrden + ' no existe en Detalle Ventas (queda inconsistente). Revísala.' };
  }
  if (enResumen === 0) {
    return { error: 'Folio asignado en Detalle Ventas, pero la orden N°' + nOrden + ' no existe en Resumen Facturas (queda inconsistente, invisible en los listados). Revísala.' };
  }
  return { ok: true };
}

// Busca una columna por su nombre de encabezado en una hoja; si no existe, la
// crea automáticamente al final. Devuelve el índice en base 0.
function obtenerOCrearColumnaPorNombre(sh, nombreColumna) {
  var ultimaCol = Math.max(sh.getLastColumn(), 1);
  var headers = sh.getRange(1, 1, 1, ultimaCol).getValues()[0];
  var col = headers.indexOf(nombreColumna);
  if (col !== -1) return col;
  var nuevaCol = ultimaCol + 1;
  sh.getRange(1, nuevaCol).setValue(nombreColumna);
  return nuevaCol - 1;
}

// =========================================
// REGISTRAR PAGO
// =========================================

function registrarPago(ss, body) {
  const { nOrden, nordenes, fechaPago, estado } = body;
  var listaOrdenes = nordenes || [nOrden];
  var noEncontradas = [];
  listaOrdenes.forEach(function(n) {
    var enDetalle = actualizarColumnaEnHoja(ss, 'Detalle Ventas', n, 0, 9, estado || 'PAGADO EN MES');
    actualizarColumnaEnHojaTexto(ss, 'Detalle Ventas', n, 0, 10, fechaPago);
    var enResumen = actualizarColumnaEnHoja(ss, 'Resumen Facturas', n, 0, 6, estado || 'PAGADO EN MES');
    actualizarColumnaEnHojaTexto(ss, 'Resumen Facturas', n, 0, 7, fechaPago);
    // Antes, si la orden no existía en alguna hoja, esto fallaba en
    // silencio y nadie se enteraba — ahora se reporta al frontend.
    if (enDetalle === 0 || enResumen === 0) noEncontradas.push(n);
  });
  if (noEncontradas.length) {
    return { ok: true, advertencia: 'No se encontró (o está incompleta en alguna hoja) la orden N° ' + noEncontradas.join(', N° ') + ' — revísala, puede que el pago no haya quedado bien registrado.', noEncontradas: noEncontradas };
  }
  return { ok: true };
}

// =========================================
// ABONOS PARCIALES (por Folio SII)
// =========================================

// Busca una hoja por nombre; si no existe, la crea con los encabezados dados.
function obtenerOCrearHoja(ss, nombreHoja, headers) {
  var sh = ss.getSheetByName(nombreHoja);
  if (!sh) {
    sh = ss.insertSheet(nombreHoja);
    sh.appendRow(headers);
  } else if (sh.getLastRow() === 0) {
    sh.appendRow(headers);
  }
  return sh;
}

// Suma todos los abonos registrados para un Folio SII
function sumaAbonosPorFolio(ss, folio) {
  var sh = ss.getSheetByName('Abonos');
  if (!sh) return 0;
  var data = sh.getDataRange().getValues();
  var suma = 0;
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]).trim() === String(folio).trim()) {
      suma += Number(data[i][2]) || 0;
    }
  }
  return suma;
}

// Busca un folio dentro de una hoja de resumen puntual (activa o histórica)
// y devuelve su total + N° de orden. Función auxiliar de totalFolioEnResumen.
function _totalFolioEnHoja(ss, nombreHoja, folio) {
  var sh = ss.getSheetByName(nombreHoja);
  if (!sh) return { total: 0, nordenes: [] };
  var data = sh.getDataRange().getValues();
  var headers = data[0] || [];
  var colFolio = headers.indexOf('Folio SII');
  var colTotal = headers.indexOf('Total');
  var suma = 0;
  var nordenes = [];
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][colFolio]).trim() === String(folio).trim()) {
      suma += Number(data[i][colTotal]) || 0;
      nordenes.push(String(data[i][0]));
    }
  }
  return { total: suma, nordenes: nordenes };
}

// Total facturado (suma de "Total") y lista de N° de orden de un Folio SII.
// Busca primero en Resumen Facturas (activa); si el folio ya no está ahí
// (porque la orden fue archivada al histórico — algo que puede pasar con
// deudas muy antiguas incluso si aún no estaban pagadas), lo busca también
// en Resumen Facturas Historico, para que un pago o abono nunca "se pierda"
// solo porque la orden ya no vive en la hoja activa. 'origen' indica dónde
// se encontró, para que quien llama sepa en qué hoja debe actualizar.
function totalFolioEnResumen(ss, folio) {
  var enActiva = _totalFolioEnHoja(ss, 'Resumen Facturas', folio);
  if (enActiva.nordenes.length > 0) {
    enActiva.origen = 'activo';
    return enActiva;
  }
  var enHistorico = _totalFolioEnHoja(ss, 'Resumen Facturas Historico', folio);
  enHistorico.origen = 'historico';
  return enHistorico;
}

// Nombres de hoja (Detalle Ventas / Resumen Facturas) a usar según dónde
// vive realmente la orden — activa o ya archivada al histórico.
function _nombresHojasPorOrigen(origen) {
  return origen === 'historico'
    ? { detalle: 'Detalle Ventas Historico', resumen: 'Resumen Facturas Historico' }
    : { detalle: 'Detalle Ventas', resumen: 'Resumen Facturas' };
}

// Versiones "en lote" para usar dentro de bucles con muchas filas (ej. archivado):
// leen la hoja UNA sola vez y arman un mapa folio -> total/abonado, en vez de
// releer la hoja completa por cada fila/folio (eso es lo que colgaba el archivado
// con cientos de órdenes).
function construirMapaTotalPorFolio(dataRF, colFolio, colTotal) {
  var mapa = {};
  for (var i = 1; i < dataRF.length; i++) {
    var fila = dataRF[i];
    if (!fila[0]) continue;
    var folio = String(fila[colFolio] || '').trim().toUpperCase();
    if (!folio || folio === 'PENDIENTE' || folio === 'NAN') continue;
    mapa[folio] = (mapa[folio] || 0) + (Number(fila[colTotal]) || 0);
  }
  return mapa;
}

function construirMapaAbonadoPorFolio(ss) {
  var mapa = {};
  var sh = ss.getSheetByName('Abonos');
  if (!sh) return mapa;
  var data = sh.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (!data[i][0]) continue;
    var folio = String(data[i][0]).trim().toUpperCase();
    mapa[folio] = (mapa[folio] || 0) + (Number(data[i][2]) || 0);
  }
  return mapa;
}

function registrarAbono(ss, body) {
  var folio = String(body.folio || '').trim();
  var monto = Number(body.monto) || 0;
  var fecha = body.fecha || '';
  var referencia = body.referencia || '';
  if (!folio) return { error: 'Falta el folio' };
  if (!monto || monto <= 0) return { error: 'Monto de abono inválido' };

  var info = totalFolioEnResumen(ss, folio);
  if (info.nordenes.length === 0) return { error: 'No se encontraron órdenes con ese folio: ' + folio };
  var hojas = _nombresHojasPorOrigen(info.origen);

  // Registrar el abono en la hoja "Abonos" (se crea sola la primera vez)
  var shAbonos = obtenerOCrearHoja(ss, 'Abonos', ['Folio SII', 'Fecha', 'Monto', 'Referencia']);
  shAbonos.appendRow([folio, '', monto, referencia]);
  var filaNueva = shAbonos.getLastRow();
  var celdaFecha = shAbonos.getRange(filaNueva, 2);
  celdaFecha.setNumberFormat('@STRING@');
  celdaFecha.setValue(fecha);

  // Recalculamos el saldo del folio completo y actualizamos el estado de TODAS
  // las órdenes que pertenecen a ese folio (el pago es por folio, no por orden).
  var abonado = sumaAbonosPorFolio(ss, folio);
  var saldo = info.total - abonado;
  var nuevoEstado = saldo <= 0 ? 'PAGADO' : 'PARCIAL';

  info.nordenes.forEach(function(n) {
    actualizarColumnaEnHoja(ss, hojas.detalle, n, 0, 9, nuevoEstado);
    actualizarColumnaEnHoja(ss, hojas.resumen, n, 0, 6, nuevoEstado);
    if (nuevoEstado === 'PAGADO') {
      // Solo se marca "Fecha Pago" cuando el folio queda 100% saldado
      actualizarColumnaEnHojaTexto(ss, hojas.detalle, n, 0, 10, fecha);
      actualizarColumnaEnHojaTexto(ss, hojas.resumen, n, 0, 7, fecha);
    } else {
      actualizarColumnaEnHojaTexto(ss, hojas.detalle, n, 0, 10, '');
      actualizarColumnaEnHojaTexto(ss, hojas.resumen, n, 0, 7, '');
    }
  });

  return { ok: true, folio: folio, abonado: abonado, total: info.total, saldo: Math.max(0, saldo), estado: nuevoEstado };
}

// =========================================
// CONCILIACIÓN BANCARIA
// =========================================
// El "N° Operación" del banco NO sirve como identificador único de cada
// movimiento (se repite en decenas de transacciones distintas, es más bien
// un código del tipo de operación). En cambio el "Saldo" de la cartola es
// un acumulado que cambia con cada movimiento real, así que la huella
// (fingerprint) de cada fila se arma con Fecha+Saldo+Monto+Descripción —
// prácticamente imposible que dos movimientos reales distintos coincidan
// en los 4 a la vez.
function _normalizarTextoCartola(s) {
  return String(s || '')
    .toUpperCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '') // quita tildes
    .replace(/[^A-Z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
function _normalizarRut(s) {
  return String(s || '').toUpperCase().replace(/[^0-9K]/g, '');
}

function procesarCartolaBancaria(ss, body) {
  var filas = body.filas || [];
  if (!filas.length) return { error: 'La cartola no trae filas para procesar' };

  // Identificador de esta cartola (ej. "Histórica N°49 (...)" o "En línea
  // generada ..."), calculado al frente para poder etiquetar cada ítem con
  // él — así la pantalla de revisión puede agruparlas y ordenarlas por
  // recencia sin depender de volver a tener el Excel abierto.
  var identificador = body.identificador || ('Procesada ' + Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm'));
  var fechaProcesado = new Date().toISOString();

  var clientes = getClientes(ss);
  var clientesNorm = clientes.map(function(c) {
    return {
      cliente: c,
      nombreNorm: _normalizarTextoCartola(c['Nombre']),
      razonNorm: _normalizarTextoCartola(c['Razón Social']),
      rutNorm: _normalizarRut(c['RUT'])
    };
  });

  // Lista de patrones a ignorar siempre (Transbank = pagos con tarjeta del
  // local, no son pagos B2B por transferencia). Editable a futuro: basta con
  // agregar filas a la hoja "ConciliacionIgnorados".
  var shIgnorados = obtenerOCrearHoja(ss, 'ConciliacionIgnorados', ['Patron']);
  if (shIgnorados.getLastRow() < 2) shIgnorados.appendRow(['TRANSBANK']);
  var patronesIgnorar = shIgnorados.getDataRange().getValues().slice(1)
    .map(function(r) { return _normalizarTextoCartola(r[0]); }).filter(Boolean);

  // Mapeos aprendidos de resoluciones manuales anteriores (descripción → cliente)
  var shEquiv = obtenerOCrearHoja(ss, 'Equivalencias_Cartola', ['Descripcion_Normalizada', 'Cliente']);
  var mapaEquivalencias = {};
  shEquiv.getDataRange().getValues().slice(1).forEach(function(r) {
    if (r[0]) mapaEquivalencias[String(r[0]).trim()] = String(r[1] || '').trim();
  });

  // Huellas ya procesadas anteriormente. Se guardan en una hoja propia
  // (ConciliacionBancaria_Historial), no en Abonos — porque un movimiento
  // conciliado puede haberse resuelto como pago completo (sin pasar por
  // Abonos) o como abono parcial, y de cualquier forma no debe reprocesarse.
  var shHistorialConcilia = ss.getSheetByName('ConciliacionBancaria_Historial');
  var huellasProcesadas = {};
  if (shHistorialConcilia && shHistorialConcilia.getLastRow() > 1) {
    var dataHistConcilia = shHistorialConcilia.getDataRange().getValues();
    for (var h = 1; h < dataHistConcilia.length; h++) {
      if (dataHistConcilia[h][0]) huellasProcesadas[String(dataHistConcilia[h][0])] = true;
    }
  }

  // Folios activos con saldo pendiente, agrupados por cliente (normalizado)
  var shResumen = ss.getSheetByName('Resumen Facturas');
  var dataResumen = shResumen.getDataRange().getValues();
  var headersResumen = dataResumen[0];
  var colCliente = headersResumen.indexOf('Cliente');
  var colFolioR = headersResumen.indexOf('Folio SII');
  var colEstado = headersResumen.indexOf('Estado Pago');
  var colFechaR = headersResumen.indexOf('Fecha');
  var colFechaFolioR = headersResumen.indexOf('Fecha Folio');
  var foliosPorClienteSet = {};
  var fechaPorFolio = {};
  var fechaFolioPorFolio = {};
  for (var i = 1; i < dataResumen.length; i++) {
    var fila = dataResumen[i];
    if (!fila[0]) continue;
    var estado = String(fila[colEstado] || '').toUpperCase();
    if (estado.indexOf('PAGADO') !== -1) continue;
    var folioVal = String(fila[colFolioR] || '').trim();
    if (!folioVal || folioVal.toUpperCase() === 'PENDIENTE') continue;
    var cliN = _normalizarTextoCartola(fila[colCliente]);
    if (!foliosPorClienteSet[cliN]) foliosPorClienteSet[cliN] = {};
    foliosPorClienteSet[cliN][folioVal] = true;
    if (!fechaPorFolio[folioVal]) fechaPorFolio[folioVal] = fila[colFechaR];
    if (!fechaFolioPorFolio[folioVal] && colFechaFolioR !== -1) fechaFolioPorFolio[folioVal] = fila[colFechaFolioR];
  }

  // Deudas muy antiguas pueden haber sido archivadas al histórico "a mano"
  // aunque siguieran impagas (fuera del criterio normal de archivado, que
  // solo mueve órdenes ya PAGADAS) — se revisan también, para que ese pago
  // atrasado siga apareciendo como candidato en vez de quedar sin cliente
  // asignado.
  var shResumenHist = ss.getSheetByName('Resumen Facturas Historico');
  if (shResumenHist && shResumenHist.getLastRow() > 1) {
    var dataResumenHist = shResumenHist.getDataRange().getValues();
    for (var ih = 1; ih < dataResumenHist.length; ih++) {
      var filaH = dataResumenHist[ih];
      if (!filaH[0]) continue;
      var estadoH = String(filaH[colEstado] || '').toUpperCase();
      if (estadoH.indexOf('PAGADO') !== -1) continue;
      var folioValH = String(filaH[colFolioR] || '').trim();
      if (!folioValH || folioValH.toUpperCase() === 'PENDIENTE') continue;
      var cliNH = _normalizarTextoCartola(filaH[colCliente]);
      if (!foliosPorClienteSet[cliNH]) foliosPorClienteSet[cliNH] = {};
      foliosPorClienteSet[cliNH][folioValH] = true;
      if (!fechaPorFolio[folioValH]) fechaPorFolio[folioValH] = filaH[colFechaR];
      if (!fechaFolioPorFolio[folioValH] && colFechaFolioR !== -1) fechaFolioPorFolio[folioValH] = filaH[colFechaFolioR];
    }
  }

  var foliosPendientesPorCliente = {};
  Object.keys(foliosPorClienteSet).forEach(function(cliN) {
    var folios = Object.keys(foliosPorClienteSet[cliN]);
    foliosPendientesPorCliente[cliN] = folios.map(function(f) {
      var info = totalFolioEnResumen(ss, f);
      var abonado = sumaAbonosPorFolio(ss, f);
      var saldo = Math.max(0, Math.round(info.total - abonado));
      return { folio: f, saldo: saldo, fecha: fechaPorFolio[f] || '', fechaFolio: fechaFolioPorFolio[f] || '' };
    }).filter(function(x) { return x.saldo > 0; });
  });

  // Folios YA marcados como pagados, agrupados por cliente — para poder avisar
  // "este monto coincide con un folio que ya se pagó por otra vía" en vez de
  // simplemente decir "no tiene folios pendientes" (caso típico: el pago se
  // registró manualmente antes de tener conciliación bancaria).
  var colTotalResumen = headersResumen.indexOf('Total');
  var colFechaPagoResumen = headersResumen.indexOf('Fecha Pago');
  var foliosPagadosGroup = {};
  function _acumularFolioPagado(filaP) {
    if (!filaP[0]) return;
    var estadoP = String(filaP[colEstado] || '').toUpperCase();
    if (estadoP.indexOf('PAGADO') === -1) return;
    var folioP = String(filaP[colFolioR] || '').trim();
    if (!folioP || folioP.toUpperCase() === 'PENDIENTE') return;
    var cliNP = _normalizarTextoCartola(filaP[colCliente]);
    if (!foliosPagadosGroup[cliNP]) foliosPagadosGroup[cliNP] = {};
    if (!foliosPagadosGroup[cliNP][folioP]) {
      foliosPagadosGroup[cliNP][folioP] = { total: 0, fechaPago: colFechaPagoResumen !== -1 ? filaP[colFechaPagoResumen] : '' };
    }
    foliosPagadosGroup[cliNP][folioP].total += colTotalResumen !== -1 ? (Number(filaP[colTotalResumen]) || 0) : 0;
  }
  for (var ip = 1; ip < dataResumen.length; ip++) _acumularFolioPagado(dataResumen[ip]);
  // La mayoría de los folios archivados al histórico SÍ están pagados (es el
  // criterio normal de archivado), así que también cuentan para detectar
  // "este monto coincide con un folio ya pagado por otra vía".
  if (shResumenHist && shResumenHist.getLastRow() > 1) {
    var dataResumenHistPagados = shResumenHist.getDataRange().getValues();
    for (var iph = 1; iph < dataResumenHistPagados.length; iph++) _acumularFolioPagado(dataResumenHistPagados[iph]);
  }
  function buscarFolioYaPagado(cliN, monto) {
    var folios = foliosPagadosGroup[cliN];
    if (!folios) return null;
    var match = Object.keys(folios).find(function(f) { return Math.round(folios[f].total) === Math.round(monto); });
    return match ? { folio: match, fechaPago: folios[match].fechaPago } : null;
  }

  var resultado = { auto: [], revisar: [], sinIdentificar: [], ignorados: 0, yaProcesados: 0 };

  // Folios ya propuestos como coincidencia dentro de ESTE mismo procesamiento,
  // por cliente — evita que dos transacciones distintas con el mismo monto
  // (ej. varios folios de $7.342 de un mismo cliente) se asignen ambas al
  // primer folio encontrado; cada una debe llevarse un folio distinto.
  var foliosReservadosPorCliente = {};

  // Copia de cada fila con su estado inicial, para guardar en Drive al final
  // (verde = ya conciliado, gris = pendiente de revisar, sin color = ignorado).
  var filasConEstado = [];

  filas.forEach(function(fila) {
    var descNorm = _normalizarTextoCartola(fila.descripcion);
    var esIgnorado = patronesIgnorar.some(function(p) { return p && descNorm.indexOf(p) !== -1; });
    if (esIgnorado) {
      resultado.ignorados++;
      filasConEstado.push({ fecha: fila.fecha, descripcion: fila.descripcion, cargos: fila.cargos, abonos: fila.abonos, saldo: fila.saldo, huella: '', estado: 'ignorado' });
      return;
    }

    var monto = Number(fila.abonos) || 0;
    if (monto <= 0) {
      // no era un abono (cargo, o fila vacía) — se guarda igual en la copia,
      // pero sin colorear, para que la cartola guardada quede completa.
      filasConEstado.push({ fecha: fila.fecha, descripcion: fila.descripcion, cargos: fila.cargos, abonos: fila.abonos, saldo: fila.saldo, huella: '', estado: 'ignorado' });
      return;
    }

    var huella = fila.fecha + '|' + fila.saldo + '|' + monto + '|' + descNorm;
    if (huellasProcesadas[huella]) {
      resultado.yaProcesados++;
      filasConEstado.push({ fecha: fila.fecha, descripcion: fila.descripcion, cargos: fila.cargos, abonos: fila.abonos, saldo: fila.saldo, huella: huella, estado: 'conciliado' });
      return;
    }

    filasConEstado.push({ fecha: fila.fecha, descripcion: fila.descripcion, cargos: fila.cargos, abonos: fila.abonos, saldo: fila.saldo, huella: huella, estado: 'pendiente' });

    var itemBase = { fecha: fila.fecha, descripcion: fila.descripcion, monto: monto, huella: huella, identificador: identificador, fechaProcesado: fechaProcesado };

    // 1) ¿Ya aprendimos antes a qué cliente corresponde esta descripción?
    var clienteEncontrado = null;
    if (mapaEquivalencias[descNorm]) {
      var nomAprendido = _normalizarTextoCartola(mapaEquivalencias[descNorm]);
      clienteEncontrado = clientesNorm.find(function(cn) { return cn.nombreNorm === nomAprendido; });
    }

    // 2) Por RUT dentro de la descripción (más confiable, no se trunca)
    if (!clienteEncontrado) {
      var m = String(fila.descripcion || '').match(/(\d{7,8}-?[0-9kK])/);
      if (m) {
        var rutDesc = _normalizarRut(m[1]);
        clienteEncontrado = clientesNorm.find(function(cn) { return cn.rutNorm && cn.rutNorm === rutDesc; });
      }
    }

    // 3) Por nombre / razón social, tolerando que la descripción venga cortada
    if (!clienteEncontrado) {
      clienteEncontrado = clientesNorm.find(function(cn) {
        var okNombre = cn.nombreNorm.length >= 4 && descNorm.indexOf(cn.nombreNorm) !== -1;
        var okRazon = cn.razonNorm && cn.razonNorm.length >= 4 && descNorm.indexOf(cn.razonNorm) !== -1;
        return okNombre || okRazon;
      });
    }

    if (!clienteEncontrado) {
      resultado.sinIdentificar.push(itemBase);
      return;
    }

    var nombreCliente = clienteEncontrado.cliente['Nombre'];
    var cliNorm = clienteEncontrado.nombreNorm;
    if (!foliosReservadosPorCliente[cliNorm]) foliosReservadosPorCliente[cliNorm] = {};
    var reservados = foliosReservadosPorCliente[cliNorm];
    var foliosTodos = foliosPendientesPorCliente[cliNorm] || [];
    var folios = foliosTodos.filter(function(f) { return !reservados[f.folio]; });

    var yaPagadoAmbiguo = buscarFolioYaPagado(cliNorm, monto);

    var folioExacto = folios.find(function(f) { return f.saldo === monto; });
    if (folioExacto) {
      // Si este mismo monto TAMBIÉN calza con un folio que ya está pagado
      // (típico con clientes de montos recurrentes, ej. facturas mensuales
      // repetidas), no se puede saber a ciegas si esta transferencia es
      // realmente para el folio pendiente o si es la misma que ya se
      // registró por otra vía — se baja a revisión manual en vez de
      // auto-confirmar un cruce que podría estar equivocado.
      if (yaPagadoAmbiguo) {
        itemBase.cliente = nombreCliente;
        itemBase.foliosPendientes = folios;
        itemBase.folioYaPagado = yaPagadoAmbiguo;
        itemBase.montoRecurrenteAmbiguo = true;
        resultado.revisar.push(itemBase);
        return;
      }
      reservados[folioExacto.folio] = true;
      itemBase.cliente = nombreCliente;
      itemBase.asignaciones = [{ folio: folioExacto.folio, monto: monto, fecha: folioExacto.fecha, fechaFolio: folioExacto.fechaFolio }];
      resultado.auto.push(itemBase);
      return;
    }

    var sumaTodos = folios.reduce(function(s, f) { return s + f.saldo; }, 0);
    if (folios.length > 1 && sumaTodos === monto) {
      folios.forEach(function(f) { reservados[f.folio] = true; });
      itemBase.cliente = nombreCliente;
      itemBase.asignaciones = folios.map(function(f) { return { folio: f.folio, monto: f.saldo, fecha: f.fecha, fechaFolio: f.fechaFolio }; });
      resultado.auto.push(itemBase);
      return;
    }

    itemBase.cliente = nombreCliente;
    itemBase.foliosPendientes = folios;
    var yaPagado = buscarFolioYaPagado(clienteEncontrado.nombreNorm, monto);
    if (yaPagado) itemBase.folioYaPagado = yaPagado;
    resultado.revisar.push(itemBase);
  });

  // Guarda una copia de la cartola en Drive (carpeta "Conciliación Bancaria
  // B2B"), coloreada por estado. Si esto falla (p.ej. permisos de Drive
  // recién agregados y aún no autorizados) no debe impedir que el usuario
  // vea igual los resultados de la conciliación.
  var infoDrive = null;
  try {
    infoDrive = _guardarCartolaEnDrive(ss, filasConEstado, identificador);
  } catch (eDrive) {
    infoDrive = { error: 'No se pudo guardar la copia en Drive: ' + eDrive.message };
  }

  // Guarda los movimientos que quedaron sin resolver (auto/revisar/sin
  // identificar) para poder retomar la revisión más adelante sin tener que
  // volver a subir el Excel — se lee de vuelta con 'getConciliacionPendiente'.
  try { _guardarPendientesConciliacion(ss, resultado); } catch (ePend) {}

  return { ok: true, resultado: resultado, drive: infoDrive };
}

// Guarda (o actualiza, por huella) cada movimiento aún sin resolver de esta
// cartola, para que la pantalla de revisión pueda reconstruirse después sin
// el archivo original.
function _guardarPendientesConciliacion(ss, resultado) {
  var sh = obtenerOCrearHoja(ss, 'ConciliacionBancaria_Pendientes',
    ['Huella', 'Tipo', 'Fecha', 'Descripcion', 'Monto', 'Cliente', 'Asignaciones', 'FoliosPendientes', 'FolioYaPagado', 'Identificador', 'FechaProcesado']);
  var data = sh.getDataRange().getValues();
  var filaPorHuella = {};
  for (var i = 1; i < data.length; i++) filaPorHuella[String(data[i][0])] = i + 1;

  function upsert(item, tipo) {
    var fila = [
      item.huella, tipo, item.fecha, item.descripcion, item.monto, item.cliente || '',
      item.asignaciones ? JSON.stringify(item.asignaciones) : '',
      item.foliosPendientes ? JSON.stringify(item.foliosPendientes) : '',
      item.folioYaPagado ? JSON.stringify(item.folioYaPagado) : '',
      item.identificador || '', item.fechaProcesado || ''
    ];
    if (filaPorHuella[item.huella]) {
      sh.getRange(filaPorHuella[item.huella], 1, 1, fila.length).setValues([fila]);
    } else {
      sh.appendRow(fila);
    }
  }

  resultado.auto.forEach(function(item) { upsert(item, 'auto'); });
  resultado.revisar.forEach(function(item) { upsert(item, 'revisar'); });
  resultado.sinIdentificar.forEach(function(item) { upsert(item, 'sinIdentificar'); });
}

// Reconstruye la pantalla de revisión (auto/revisar/sinIdentificar) a partir
// de lo guardado, sin necesidad de volver a subir el Excel.
function getConciliacionPendiente(ss) {
  var sh = ss.getSheetByName('ConciliacionBancaria_Pendientes');
  var resultado = { auto: [], revisar: [], sinIdentificar: [] };
  if (!sh || sh.getLastRow() < 2) return { ok: true, resultado: resultado };
  var data = sh.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    var r = data[i];
    if (!r[0]) continue;
    var item = { huella: r[0], fecha: r[2], descripcion: r[3], monto: Number(r[4]) || 0 };
    if (r[5]) item.cliente = r[5];
    if (r[6]) { try { item.asignaciones = JSON.parse(r[6]); } catch (e1) {} }
    if (r[7]) { try { item.foliosPendientes = JSON.parse(r[7]); } catch (e2) {} }
    if (r[8]) { try { item.folioYaPagado = JSON.parse(r[8]); } catch (e3) {} }
    item.identificador = r[9] || '';
    item.fechaProcesado = r[10] || '';
    var tipo = String(r[1] || '');
    if (tipo === 'auto') resultado.auto.push(item);
    else if (tipo === 'revisar') resultado.revisar.push(item);
    else if (tipo === 'sinIdentificar') resultado.sinIdentificar.push(item);
  }
  return { ok: true, resultado: resultado };
}

// =========================================
// CONCILIACIÓN BANCARIA — copia guardada en Drive
// =========================================
var _CB_COLOR_CONCILIADO = '#d9ead3'; // verde suave
var _CB_COLOR_PENDIENTE  = '#f3f3f3'; // gris suave
// "ignorado" no se colorea — queda con el fondo blanco por defecto.

function _carpetaConciliacionBancaria() {
  var nombre = 'Conciliación Bancaria B2B';
  var carpetas = DriveApp.getFoldersByName(nombre);
  if (carpetas.hasNext()) return carpetas.next();
  return DriveApp.createFolder(nombre);
}

// Guarda una copia de la cartola procesada como Google Sheet dentro de la
// carpeta de Drive, coloreada por fila según su estado inicial, y deja un
// índice (huella → archivo/fila) para poder recolorear a verde más adelante
// cuando el usuario confirme cada movimiento desde la pantalla de revisión.
function _guardarCartolaEnDrive(ss, filasConEstado, identificador) {
  var carpeta = _carpetaConciliacionBancaria();
  var ssNueva = SpreadsheetApp.create('Cartola ' + identificador);
  var archivo = DriveApp.getFileById(ssNueva.getId());
  carpeta.addFile(archivo);
  try { DriveApp.getRootFolder().removeFile(archivo); } catch (eMove) {} // que quede solo en la carpeta, no también en "Mi unidad"

  var hoja = ssNueva.getSheets()[0];
  hoja.setName('Cartola');
  // Fila 1: identificador de la cartola, también dentro de la hoja (no solo
  // en el nombre del archivo) — por si se comparte o se ve sin el título a la vista.
  hoja.getRange(1, 1, 1, 5).merge().setValue(identificador).setFontWeight('bold').setFontSize(12);
  hoja.getRange(2, 1, 1, 6).setValues([['Fecha', 'Descripción', 'Cargos', 'Abonos', 'Saldo', '_huella']]);
  hoja.hideColumns(6); // columna técnica, para uso interno del sistema

  if (filasConEstado.length) {
    var filasValores = filasConEstado.map(function(f) {
      return [f.fecha, f.descripcion, f.cargos || '', f.abonos || '', f.saldo || '', f.huella || ''];
    });
    hoja.getRange(3, 1, filasValores.length, 6).setValues(filasValores);

    var filasIndice = [];
    filasConEstado.forEach(function(f, idx) {
      var filaHoja = idx + 3;
      if (f.estado === 'conciliado') hoja.getRange(filaHoja, 1, 1, 5).setBackground(_CB_COLOR_CONCILIADO);
      else if (f.estado === 'pendiente') hoja.getRange(filaHoja, 1, 1, 5).setBackground(_CB_COLOR_PENDIENTE);
      if (f.huella && f.estado !== 'ignorado') filasIndice.push([f.huella, ssNueva.getId(), filaHoja]);
    });

    if (filasIndice.length) {
      var shIndice = obtenerOCrearHoja(ss, 'ConciliacionBancaria_ArchivosDrive', ['Huella', 'DriveFileId', 'Fila']);
      shIndice.getRange(shIndice.getLastRow() + 1, 1, filasIndice.length, 3).setValues(filasIndice);
    }
  }

  return { fileId: ssNueva.getId(), url: ssNueva.getUrl() };
}

// Marca en verde, en la(s) copia(s) guardada(s) en Drive, la fila que
// corresponde a esta huella (puede aparecer en más de una si dos cartolas se
// traslapan en fechas). No interrumpe la conciliación si Drive falla o si la
// copia ya no existe (el usuario pudo haberla movido o eliminado a mano).
function _marcarConciliadoEnDrive(ss, huella) {
  if (!huella) return;
  try {
    var shIndice = ss.getSheetByName('ConciliacionBancaria_ArchivosDrive');
    if (!shIndice) return;
    var data = shIndice.getDataRange().getValues();
    for (var i = 1; i < data.length; i++) {
      if (String(data[i][0]) === String(huella)) {
        try {
          var ssDrive = SpreadsheetApp.openById(data[i][1]);
          ssDrive.getSheets()[0].getRange(Number(data[i][2]), 1, 1, 5).setBackground(_CB_COLOR_CONCILIADO);
        } catch (eArchivo) {
          // esa copia puntual ya no existe / no es accesible — se ignora
        }
      }
    }
  } catch (e) {
    // el índice no existe todavía u otro error no crítico — no bloquea
  }
}

// Agrega texto a una nota existente en vez de sobrescribirla (no pisa lo que
// el usuario ya haya escrito ahí). No duplica si el texto ya está presente
// (evita ensuciar la nota si por algún motivo se reprocesa la misma fila).
function agregarNotaEnHoja(ss, nombreHoja, valorBuscar, colBuscar, colNotas, textoAgregar) {
  var sh = ss.getSheetByName(nombreHoja);
  if (!sh) return 0;
  var data = sh.getDataRange().getValues();
  var encontradas = 0;
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][colBuscar]) === String(valorBuscar)) {
      var actual = String(data[i][colNotas] || '').trim();
      if (actual.indexOf(textoAgregar) === -1) {
        var nuevo = actual ? (actual + ' · ' + textoAgregar) : textoAgregar;
        sh.getRange(i + 1, colNotas + 1).setValue(nuevo);
      }
      encontradas++;
    }
  }
  return encontradas;
}

// Cierra un folio COMPLETO (todas sus órdenes) como PAGADO directo, sin pasar
// por Abonos — para cuando la conciliación bancaria encuentra el monto exacto
// del saldo. Deja constancia en "Notas" de que fue vía conciliación bancaria.
function registrarPagoCompletoPorFolio(ss, folio, fecha, notaTexto) {
  var info = totalFolioEnResumen(ss, folio);
  if (info.nordenes.length === 0) return { error: 'No se encontraron órdenes con ese folio: ' + folio };
  // La orden puede estar en la hoja activa o ya archivada al histórico (una
  // deuda muy antigua puede haberse movido ahí aunque siguiera pendiente) —
  // se actualiza donde realmente vive, para que el pago nunca quede "perdido".
  var hojas = _nombresHojasPorOrigen(info.origen);
  var noEncontradas = [];
  info.nordenes.forEach(function(n) {
    var enDetalle = actualizarColumnaEnHoja(ss, hojas.detalle, n, 0, 9, 'PAGADO');
    actualizarColumnaEnHojaTexto(ss, hojas.detalle, n, 0, 10, fecha);
    var enResumen = actualizarColumnaEnHoja(ss, hojas.resumen, n, 0, 6, 'PAGADO');
    actualizarColumnaEnHojaTexto(ss, hojas.resumen, n, 0, 7, fecha);
    if (notaTexto) {
      agregarNotaEnHoja(ss, hojas.detalle, n, 0, 12, notaTexto);
      agregarNotaEnHoja(ss, hojas.resumen, n, 0, 9, notaTexto);
    }
    if (enDetalle === 0 || enResumen === 0) noEncontradas.push(n);
  });
  return { ok: true, folio: folio, tipo: 'pago completo', noEncontradas: noEncontradas, origen: info.origen };
}

// Confirma una conciliación (automática o resuelta a mano). Por cada folio:
// si el monto asignado cubre exactamente el saldo pendiente del folio, se
// cierra directo vía "pago completo" (sin pasar por Abonos, para no mezclar
// pagos cerrados con las cuotas/abonos parciales reales de otros clientes);
// si el monto es menor al saldo (un abono parcial de verdad), se usa
// registrarAbono como siempre. Se marca la huella del movimiento en una hoja
// propia para no reprocesarlo, y si la resolución fue manual, se aprende la
// descripción → cliente.
function confirmarConciliacion(ss, body) {
  var huella = body.huella || '';
  var fecha = body.fecha || '';
  var descripcion = body.descripcion || '';
  var asignaciones = body.asignaciones || [];
  var clienteNombre = body.clienteNombre || '';
  var monto = Number(body.monto) || 0;
  // "Marcar como revisado": el movimiento ya se explica por otra vía (p.ej. un
  // pago que se registró manualmente antes de existir conciliación bancaria,
  // o un anticipo de pedidos aún no facturados) — no se registra pago ni
  // abono, solo se deja constancia de que ya se revisó para no volver a
  // mostrarlo cada vez que se procese esta cartola u otra que se traslape.
  var soloRevisado = !!body.soloRevisado;
  var folioReferencia = body.folioReferencia || '';
  var notaTexto = 'Pagado vía conciliación bancaria ' + fecha;

  var resultados = [];
  if (!soloRevisado) {
    if (!asignaciones.length) return { error: 'No se especificaron folios a los que asignar el pago' };
    for (var i = 0; i < asignaciones.length; i++) {
      var a = asignaciones[i];
      var info = totalFolioEnResumen(ss, a.folio);
      if (info.nordenes.length === 0) return { error: 'No se encontró el folio ' + a.folio };
      var abonado = sumaAbonosPorFolio(ss, a.folio);
      var saldoActual = Math.round(info.total - abonado);
      var esPagoCompleto = Math.round(Number(a.monto) || 0) === saldoActual;

      var r = esPagoCompleto
        ? registrarPagoCompletoPorFolio(ss, a.folio, fecha, notaTexto)
        : registrarAbono(ss, { folio: a.folio, monto: a.monto, fecha: fecha, referencia: 'Conciliación bancaria' });
      if (r.error) return { error: 'Error al registrar folio ' + a.folio + ': ' + r.error };
      resultados.push(r);
    }
  }

  if (huella) {
    var shHist = obtenerOCrearHoja(ss, 'ConciliacionBancaria_Historial',
      ['Fingerprint', 'Fecha', 'Descripcion', 'Monto', 'Cliente', 'Folios']);
    var folios = soloRevisado
      ? (folioReferencia || '(revisado, sin folio asociado)')
      : asignaciones.map(function(a) { return a.folio; }).join(', ');
    shHist.appendRow([huella, fecha, descripcion, monto, clienteNombre || '', folios]);
    _marcarConciliadoEnDrive(ss, huella);
    try { eliminarFilasEnHoja(ss, 'ConciliacionBancaria_Pendientes', huella, 0); } catch (ePend) {}
  }

  if (clienteNombre && descripcion) {
    var shEquiv = obtenerOCrearHoja(ss, 'Equivalencias_Cartola', ['Descripcion_Normalizada', 'Cliente']);
    var descNorm = _normalizarTextoCartola(descripcion);
    var yaExiste = shEquiv.getDataRange().getValues().slice(1)
      .some(function(r) { return String(r[0]).trim() === descNorm; });
    if (!yaExiste) shEquiv.appendRow([descNorm, clienteNombre]);
  }

  return { ok: true, resultados: resultados, revisado: soloRevisado };
}

function getAbonos(ss) {
  var sh = ss.getSheetByName('Abonos');
  if (!sh) return [];
  var data = sh.getDataRange().getValues();
  if (data.length < 2) return [];
  var headers = data[0];
  return data.slice(1).filter(function(r){ return r[0]; }).map(function(r){
    var obj = {};
    headers.forEach(function(h, i){ obj[h] = r[i]; });
    return obj;
  });
}

// =========================================
// ELIMINAR ORDEN
// =========================================

function deleteOrden(ss, body) {
  const { nOrden } = body;
  eliminarFilasEnHoja(ss, 'Detalle Ventas', nOrden, 0);
  eliminarFilasEnHoja(ss, 'Resumen Facturas', nOrden, 0);
  return { ok: true };
}

// Eliminación definitiva desde el botón "🗑️ Eliminar" de la app — distinta de
// la llamada interna que hace updateOrden al editar (esa NO debe tocar el
// historial, o se borraría cada vez que se edita una orden). Esta sí limpia
// también Ediciones_ordenes, porque acá la orden desaparece para siempre.
function eliminarOrdenDefinitivo(ss, body) {
  var resultado = deleteOrden(ss, body);
  eliminarFilasEnHoja(ss, 'Ediciones_ordenes', body.nOrden, 0);
  return resultado;
}

// =========================================
// EDITAR ORDEN
// =========================================

function updateOrden(ss, body) {
  const nOrden = body.nOrden;
  // Capturamos las líneas ANTES de borrar, para poder armar el resumen de
  // cambios (trazabilidad de devoluciones/adiciones) comparando contra las
  // líneas nuevas que se están por guardar.
  const lineasAntes = _leerLineasOrden(ss, nOrden);

  deleteOrden(ss, { nOrden: nOrden });
  const resultado = addOrden(ss, body);

  const diff = _compararLineasEdicion(lineasAntes, body.lineas || []);
  if (diff.cambios.length && body.motivo) {
    _registrarEdicionOrden(ss, nOrden, body.motivo, diff.resumenTexto.join('\n'), diff.cambios);
  }

  return resultado;
}

function _leerLineasOrden(ss, nOrden) {
  var sh = ss.getSheetByName('Detalle Ventas');
  var data = sh.getDataRange().getValues();
  var headers = data[0];
  var colProducto = headers.indexOf('Producto');
  var colCantidad = headers.indexOf('Cantidad');
  var out = [];
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(nOrden)) {
      out.push({ producto: String(data[i][colProducto] || ''), cantidad: Number(data[i][colCantidad]) || 0 });
    }
  }
  return out;
}

// Compara las líneas de una orden antes/después de editar y arma tanto un
// resumen legible (para mostrar) como un array estructurado (para reconstruir
// "cantidad original" más adelante, ej. al regenerar el PDF).
function _compararLineasEdicion(antes, despues) {
  var mapaAntes = {};
  antes.forEach(function(l){ mapaAntes[l.producto] = (mapaAntes[l.producto] || 0) + l.cantidad; });
  var mapaDespues = {};
  (despues || []).forEach(function(l){ mapaDespues[l.producto] = (mapaDespues[l.producto] || 0) + (Number(l.cantidad) || 0); });

  var resumenTexto = [];
  var cambios = [];
  var vistos = {};
  Object.keys(mapaAntes).forEach(function(prod){
    vistos[prod] = true;
    var cantAntes = mapaAntes[prod];
    var cantDespues = mapaDespues[prod] || 0;
    if (cantDespues === cantAntes) return; // sin cambios: no se registra
    cambios.push({ producto: prod, cantidadAntes: cantAntes, cantidadDespues: cantDespues });
    if (cantDespues === 0) {
      resumenTexto.push(prod + ': eliminado (ten\u00eda ' + cantAntes + ')');
    } else if (cantDespues < cantAntes) {
      resumenTexto.push(prod + ': ' + cantAntes + ' \u2192 ' + cantDespues + ' (devuelto: ' + (cantAntes - cantDespues) + ')');
    } else {
      resumenTexto.push(prod + ': ' + cantAntes + ' \u2192 ' + cantDespues + ' (agregado: ' + (cantDespues - cantAntes) + ')');
    }
  });
  Object.keys(mapaDespues).forEach(function(prod){
    if (vistos[prod]) return;
    cambios.push({ producto: prod, cantidadAntes: 0, cantidadDespues: mapaDespues[prod] });
    resumenTexto.push(prod + ': agregado x' + mapaDespues[prod] + ' (producto nuevo)');
  });

  return { resumenTexto: resumenTexto, cambios: cambios };
}

function _registrarEdicionOrden(ss, nOrden, motivo, resumenTexto, cambios) {
  var sh = obtenerOCrearHoja(ss, 'Ediciones_ordenes', ['N\u00b0 Orden', 'Fecha edici\u00f3n', 'Motivo', 'Resumen', 'Cambios (JSON)']);
  sh.appendRow([nOrden, '', motivo, resumenTexto, JSON.stringify(cambios)]);
  var celdaFecha = sh.getRange(sh.getLastRow(), 2);
  celdaFecha.setNumberFormat('@STRING@');
  celdaFecha.setValue(_hoyStrGS());
}

function getEdicionesOrdenes(ss) {
  var sh = obtenerOCrearHoja(ss, 'Ediciones_ordenes', ['N\u00b0 Orden', 'Fecha edici\u00f3n', 'Motivo', 'Resumen', 'Cambios (JSON)']);
  var data = sh.getDataRange().getValues();
  if (data.length < 2) return [];
  var headers = data[0];
  return data.slice(1).filter(function(r){ return r[0]; }).map(function(r){
    var obj = {};
    headers.forEach(function(h,i){ obj[h] = r[i]; });
    return obj;
  });
}

// Edición para casos históricos: permite corregir una orden que YA tiene folio
// SII asignado (el flujo normal lo bloquea). A diferencia de updateOrden, esta
// versión PRESERVA el folio existente (nunca se edita el folio SII acá), y
// además permite corregir explícitamente el estado/fecha de pago si el body
// trae "fechaPagoAdmin" — si no viene, se restaura tal como estaba. Pensada
// para uso exclusivo del admin, para corregir discordancias entre la orden y
// la factura ya emitida en el SII (esto NO modifica nada en el SII, solo los
// datos internos de la orden).
function updateOrdenAdmin(ss, body) {
  var nOrden = body.nOrden;
  var shResumen = ss.getSheetByName('Resumen Facturas');
  var dataRF = shResumen.getDataRange().getValues();
  var headersRF = dataRF[0];
  var colFolio = headersRF.indexOf('Folio SII');
  var colEstado = headersRF.indexOf('Estado Pago');
  var colFechaPago = headersRF.indexOf('Fecha Pago');
  var colFechaFolio = headersRF.indexOf('Fecha Folio'); // puede no existir aún

  var folioActual = '', estadoActual = 'PENDIENTE', fechaPagoActual = '', fechaFolioActual = '';
  for (var i = 1; i < dataRF.length; i++) {
    if (String(dataRF[i][0]) === String(nOrden)) {
      folioActual = colFolio !== -1 ? dataRF[i][colFolio] : '';
      estadoActual = colEstado !== -1 ? dataRF[i][colEstado] : 'PENDIENTE';
      fechaPagoActual = colFechaPago !== -1 ? dataRF[i][colFechaPago] : '';
      fechaFolioActual = colFechaFolio !== -1 ? dataRF[i][colFechaFolio] : '';
      break;
    }
  }

  // Si se editó explícitamente la fecha de pago: con fecha -> PAGADO, vacía -> PENDIENTE.
  // Si no se tocó ese campo, se restaura tal como estaba (comportamiento anterior).
  var huboEdicionPago = typeof body.fechaPagoAdmin !== 'undefined';
  var estadoFinal = estadoActual;
  var fechaPagoFinal = fechaPagoActual;
  if (huboEdicionPago) {
    if (body.fechaPagoAdmin) {
      estadoFinal = 'PAGADO';
      fechaPagoFinal = body.fechaPagoAdmin;
    } else {
      estadoFinal = 'PENDIENTE';
      fechaPagoFinal = '';
    }
  }

  var resultado = updateOrden(ss, body);

  var tieneFolio = folioActual && String(folioActual).trim() !== '' && String(folioActual).trim().toUpperCase() !== 'PENDIENTE';
  if (tieneFolio) {
    actualizarColumnaEnHoja(ss, 'Detalle Ventas', nOrden, 0, 11, folioActual);
    actualizarColumnaEnHoja(ss, 'Resumen Facturas', nOrden, 0, 8, folioActual);
  }

  // El estado/fecha de pago se aplica a TODAS las órdenes del mismo folio (si
  // tiene), igual que hace registrarPago/registrarAbono, para que nunca queden
  // órdenes de un mismo folio con estados de pago distintos entre sí.
  var nordenesAfectados = [nOrden];
  if (tieneFolio) {
    var infoFolio = totalFolioEnResumen(ss, folioActual);
    if (infoFolio.nordenes.length) nordenesAfectados = infoFolio.nordenes;
  }
  nordenesAfectados.forEach(function(n) {
    actualizarColumnaEnHoja(ss, 'Detalle Ventas', n, 0, 9, estadoFinal);
    actualizarColumnaEnHoja(ss, 'Resumen Facturas', n, 0, 6, estadoFinal);
    actualizarColumnaEnHojaTexto(ss, 'Detalle Ventas', n, 0, 10, fechaPagoFinal);
    actualizarColumnaEnHojaTexto(ss, 'Resumen Facturas', n, 0, 7, fechaPagoFinal);
  });

  if (tieneFolio && fechaFolioActual) {
    var colDV = obtenerOCrearColumnaPorNombre(ss.getSheetByName('Detalle Ventas'), 'Fecha Folio');
    var colRF = obtenerOCrearColumnaPorNombre(ss.getSheetByName('Resumen Facturas'), 'Fecha Folio');
    actualizarColumnaEnHojaTexto(ss, 'Detalle Ventas', nOrden, 0, colDV, fechaFolioActual);
    actualizarColumnaEnHojaTexto(ss, 'Resumen Facturas', nOrden, 0, colRF, fechaFolioActual);
  }

  return resultado;
}

// =========================================
// HELPERS
// =========================================

// Devuelve la cantidad de filas efectivamente actualizadas (0 = no encontró
// ninguna fila con ese valor — antes esto fallaba en silencio).
function actualizarColumnaEnHoja(ss, nombreHoja, valorBuscar, colBuscar, colActualizar, nuevoValor) {
  const sh = ss.getSheetByName(nombreHoja);
  const data = sh.getDataRange().getValues();
  let encontradas = 0;
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][colBuscar]) === String(valorBuscar)) {
      sh.getRange(i + 1, colActualizar + 1).setValue(nuevoValor);
      encontradas++;
    }
  }
  return encontradas;
}

function actualizarColumnaEnHojaTexto(ss, nombreHoja, valorBuscar, colBuscar, colActualizar, nuevoValor) {
  const sh = ss.getSheetByName(nombreHoja);
  const data = sh.getDataRange().getValues();
  let encontradas = 0;
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][colBuscar]) === String(valorBuscar)) {
      const cell = sh.getRange(i + 1, colActualizar + 1);
      cell.setNumberFormat('@STRING@');
      cell.setValue(nuevoValor);
      encontradas++;
    }
  }
  return encontradas;
}

function eliminarFilasEnHoja(ss, nombreHoja, valorBuscar, colBuscar) {
  const sh = ss.getSheetByName(nombreHoja);
  const data = sh.getDataRange().getValues();
  for (let i = data.length - 1; i >= 1; i--) {
    if (String(data[i][colBuscar]) === String(valorBuscar)) {
      sh.deleteRow(i + 1);
    }
  }
}

// =========================================
// AGREGAR CLIENTE
// =========================================

function addCliente(ss, body) {
  const sh = ss.getSheetByName('Clientes');
  const nombreNuevo = String(body.nombre || '').trim();
  if (!nombreNuevo) return { error: 'Falta el nombre del cliente' };
  const data = sh.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]).trim().toLowerCase() === nombreNuevo.toLowerCase()) {
      return { error: 'Ya existe un cliente llamado "' + nombreNuevo + '". Usa "Editar" en vez de crear uno nuevo.' };
    }
  }
  sh.appendRow([
    nombreNuevo, body.rut, body.razonSocial,
    body.giro, body.dir, body.email, body.tel, body.contacto
  ]);
  return { ok: true };
}

// Edita los datos de un cliente ya existente. Si body.nombreNuevo viene y es
// distinto de nombreActual, primero propaga el cambio de nombre a TODAS las
// hojas que guardan "Cliente" como texto suelto (no como ID) — si no se
// propagara, las órdenes y precios especiales ya guardados quedarían
// apuntando al nombre viejo, invisibles para el cliente "nuevo".
function editarCliente(ss, body) {
  const sh = ss.getSheetByName('Clientes');
  const nombreActual = String(body.nombreActual || '').trim();
  if (!nombreActual) return { error: 'Falta el nombre del cliente a editar' };
  const nombreNuevo = String(body.nombreNuevo || nombreActual).trim();
  if (!nombreNuevo) return { error: 'El nombre no puede quedar vacío' };

  const data = sh.getDataRange().getValues();
  let filaCliente = -1;
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]).trim().toLowerCase() === nombreActual.toLowerCase()) { filaCliente = i; break; }
  }
  if (filaCliente === -1) return { error: 'Cliente no encontrado: ' + nombreActual };

  var propagacion = null;
  // Comparación EXACTA (no case-insensitive): un cambio de solo mayúsculas/
  // minúsculas ("Café Rivoz" → "CAFÉ RIVOZ") también cuenta como cambio —
  // si no, ni siquiera se corregía el nombre en la ficha del cliente.
  if (nombreNuevo !== nombreActual) {
    // No permitir renombrar a un nombre que ya usa OTRO cliente con distinto
    // mayúsculas/minúsculas es DISTINTO caso: eso sí sigue siendo "el mismo
    // cliente" para efectos de fusión, así que la comprobación de duplicado
    // sigue siendo case-insensitive (evita fusionar dos clientes distintos).
    for (var k = 1; k < data.length; k++) {
      if (k !== filaCliente && String(data[k][0]).trim().toLowerCase() === nombreNuevo.toLowerCase()) {
        return { error: 'Ya existe otro cliente llamado "' + nombreNuevo + '". No se puede renombrar (se fusionarían).' };
      }
    }
    propagacion = _renombrarClienteEnHojas(ss, nombreActual, nombreNuevo);
    sh.getRange(filaCliente + 1, 1).setValue(nombreNuevo);
  }

  // Columnas B..H, en el mismo orden en que las escribe addCliente:
  // RUT, Razón Social, Giro, Dirección, Email, Teléfono, Contacto.
  sh.getRange(filaCliente + 1, 2, 1, 7).setValues([[
    body.rut, body.razonSocial, body.giro,
    body.dir, body.email, body.tel, body.contacto
  ]]);
  return { ok: true, propagacion: propagacion };
}

// Reemplaza el nombre del cliente en todas las hojas donde se guarda como
// texto suelto en la columna "Cliente" (no como referencia a un ID).
// Devuelve cuántas filas se tocaron en cada hoja, para poder mostrarlo.
function _renombrarClienteEnHojas(ss, nombreActual, nombreNuevo) {
  var resultado = {};

  // Resumen Facturas / Detalle Ventas (activas e históricas): columna C = Cliente (índice 2)
  ['Resumen Facturas', 'Detalle Ventas', 'Resumen Facturas Historico', 'Detalle Ventas Historico'].forEach(function(nombreHoja) {
    var sh = ss.getSheetByName(nombreHoja);
    if (!sh) { resultado[nombreHoja] = 0; return; }
    var data = sh.getDataRange().getValues();
    var n = 0;
    for (var i = 1; i < data.length; i++) {
      if (String(data[i][2]).trim().toLowerCase() === nombreActual.toLowerCase()) {
        sh.getRange(i + 1, 3).setValue(nombreNuevo);
        n++;
      }
    }
    resultado[nombreHoja] = n;
  });

  // Precios especiales: columna A = Cliente (índice 0)
  var shPrecios = ss.getSheetByName('Precios');
  var nPrecios = 0;
  if (shPrecios) {
    var dataPrecios = shPrecios.getDataRange().getValues();
    for (var j = 1; j < dataPrecios.length; j++) {
      if (String(dataPrecios[j][0]).trim().toLowerCase() === nombreActual.toLowerCase()) {
        shPrecios.getRange(j + 1, 1).setValue(nombreNuevo);
        nPrecios++;
      }
    }
  }
  resultado['Precios'] = nPrecios;

  return resultado;
}

// =========================================
// AGREGAR PRODUCTO
// =========================================

function addProducto(ss, body) {
  const sh = ss.getSheetByName('Productos');
  const nombreNuevo = String(body.nombre || '').trim();
  if (!nombreNuevo) return { error: 'Falta el nombre del producto' };
  const data = sh.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]).trim().toLowerCase() === nombreNuevo.toLowerCase()) {
      return { error: 'Ya existe un producto llamado "' + nombreNuevo + '". Usa "Editar producto" en vez de crear uno nuevo.' };
    }
  }
  sh.appendRow([nombreNuevo, body.precio, body.categoria]);
  return { ok: true };
}

function editarProducto(ss, body) {
  var sh = ss.getSheetByName('Productos');
  var data = sh.getDataRange().getValues();
  var nombreActual = String(body.nombreActual || '').trim();
  var nombreNuevo = String(body.nombreNuevo || '').trim();
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]).trim().toLowerCase() === nombreActual.toLowerCase()) {
      sh.getRange(i + 1, 1).setValue(nombreNuevo || data[i][0]);
      sh.getRange(i + 1, 2).setValue(typeof body.precio !== 'undefined' ? body.precio : data[i][1]);
      sh.getRange(i + 1, 3).setValue(typeof body.categoria !== 'undefined' ? body.categoria : data[i][2]);

      var preciosActualizados = 0;
      // Precios especiales (por cliente) es estado ACTUAL, no histórico como
      // Detalle Ventas — si el producto se renombra, deben seguir el cambio
      // para no quedar huérfanos (dejarían de aplicarse en órdenes nuevas).
      if (nombreNuevo && nombreNuevo.toLowerCase() !== nombreActual.toLowerCase()) {
        var shPrecios = ss.getSheetByName('Precios');
        if (shPrecios) {
          var dataPrecios = shPrecios.getDataRange().getValues();
          for (var j = 1; j < dataPrecios.length; j++) {
            if (String(dataPrecios[j][1]).trim().toLowerCase() === nombreActual.toLowerCase()) {
              shPrecios.getRange(j + 1, 2).setValue(nombreNuevo);
              preciosActualizados++;
            }
          }
        }
      }
      return { ok: true, preciosActualizados: preciosActualizados };
    }
  }
  return { error: 'Producto no encontrado: ' + nombreActual };
}

// =========================================
// AGREGAR PRECIO ESPECIAL
// =========================================

function addPrecio(ss, body) {
  const sh = ss.getSheetByName('Precios');
  const data = sh.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]).trim().toLowerCase() === body.cliente.toLowerCase() &&
        String(data[i][1]).trim().toLowerCase() === body.producto.toLowerCase()) {
      sh.getRange(i + 1, 3).setValue(body.precio);
      return { ok: true, updated: true };
    }
  }
  sh.appendRow([body.cliente, body.producto, body.precio]);
  return { ok: true, created: true };
}

function eliminarPrecio(ss, body) {
  const sh = ss.getSheetByName('Precios');
  const data = sh.getDataRange().getValues();
  for (let i = data.length - 1; i >= 1; i--) {
    if (String(data[i][0]).trim().toLowerCase() === String(body.cliente || '').trim().toLowerCase() &&
        String(data[i][1]).trim().toLowerCase() === String(body.producto || '').trim().toLowerCase()) {
      sh.deleteRow(i + 1);
      return { ok: true };
    }
  }
  return { error: 'No se encontró ese precio especial' };
}

// =========================================
// LEER HISTORICO
// =========================================

function getOrdenesHistorico(ss) {
  var sh = ss.getSheetByName('Resumen Facturas Historico');
  if (!sh) return [];
  var data = sh.getDataRange().getValues();
  if (data.length < 2) return [];
  var headers = data[0];
  return data.slice(1).filter(function(r){ return r[0]; }).map(function(r){
    var obj = {};
    headers.forEach(function(h, i){ obj[h] = r[i]; });
    return obj;
  });
}

function getDetallesHistorico(ss) {
  var sh = ss.getSheetByName('Detalle Ventas Historico');
  if (!sh) return [];
  var data = sh.getDataRange().getValues();
  if (data.length < 2) return [];
  var headers = data[0];
  return data.slice(1).filter(function(r){ return r[0]; }).map(function(r){
    var obj = {};
    headers.forEach(function(h, i){ obj[h] = r[i]; });
    return obj;
  });
}

// =========================================
// ARCHIVAR ORDENES
// Criterios (los 3 deben cumplirse):
// 1. Estado Pago distinto de PENDIENTE
// 2. Folio SII asignado (no vacío ni Pendiente)
// 3. Fecha anterior a hace 45 días
// =========================================

function archivarOrdenes(ss) {
  var shRF  = ss.getSheetByName('Resumen Facturas');
  var shDV  = ss.getSheetByName('Detalle Ventas');
  var shRFH = ss.getSheetByName('Resumen Facturas Historico');
  var shDVH = ss.getSheetByName('Detalle Ventas Historico');

  if (!shRFH || !shDVH) {
    return { error: 'No se encontraron las hojas de historico.' };
  }

  function parseFechaGS(val) {
    if (!val) return '';
    var d = (val instanceof Date) ? val : new Date(val);
    if (isNaN(d.getTime())) return String(val).slice(0, 10);
    return d.getFullYear() + '-' +
      String(d.getMonth()+1).padStart(2,'0') + '-' +
      String(d.getDate()).padStart(2,'0');
  }

  // Límite: hace 45 días
  var hoy = new Date();
  var limite = new Date(hoy.getTime() - 45 * 24 * 60 * 60 * 1000);
  var limiteStr = limite.getFullYear() + '-' +
    String(limite.getMonth()+1).padStart(2,'0') + '-' +
    String(limite.getDate()).padStart(2,'0');

  var dataRF = shRF.getDataRange().getValues();
  var headersRF = dataRF[0];
  var colFecha  = headersRF.indexOf('Fecha');
  var colEstado = headersRF.indexOf('Estado Pago');
  var colFolio  = headersRF.indexOf('Folio SII');
  var colTotal  = headersRF.indexOf('Total');

  // Se arman UNA sola vez, no por cada fila (evita releer las hojas cientos de veces)
  var mapaTotalFolio   = construirMapaTotalPorFolio(dataRF, colFolio, colTotal);
  var mapaAbonadoFolio = construirMapaAbonadoPorFolio(ss);

  var filasArchivarRF = [];
  var nordensArchivados = {};

  for (var i = dataRF.length - 1; i >= 1; i--) {
    var fila = dataRF[i];
    if (!fila[0]) continue;

    var fechaStr = parseFechaGS(fila[colFecha]);
    var estado = String(fila[colEstado] || '').trim().toUpperCase();
    var folio  = String(fila[colFolio]  || '').trim().toUpperCase();

    // Debe decir explícitamente PAGADO (un folio con abono PARCIAL no cumple esto)
    // Aceptamos cualquier variante que contenga "PAGADO" (ej. la histórica
    // "PAGADO EN MES"), no solo el texto exacto "PAGADO". PARCIAL y PENDIENTE
    // nunca contienen esa palabra, así que igual quedan excluidos correctamente.
    var esPagada   = estado.indexOf('PAGADO') !== -1;
    var tieneFolio = folio !== '' && folio !== 'PENDIENTE' && folio !== 'NAN';
    var esAntigua  = fechaStr <= limiteStr;

    // Verificación adicional: SOLO para folios que efectivamente tienen abonos
    // registrados en la bitácora, exigimos que el saldo (total - abonos) sea $0.
    // Si el folio nunca usó el sistema de abonos (se pagó por la vía simple),
    // confiamos directamente en que el estado diga PAGADO — no todo pago pasa
    // por la bitácora de abonos.
    var saldoOk = true;
    if (esPagada && tieneFolio && mapaAbonadoFolio.hasOwnProperty(folio)) {
      var totalF = mapaTotalFolio[folio] || 0;
      var abonadoF = mapaAbonadoFolio[folio] || 0;
      saldoOk = (totalF - abonadoF) <= 0;
    }

    if (esPagada && tieneFolio && esAntigua && saldoOk) {
      filasArchivarRF.push(i + 1);
      nordensArchivados[String(fila[0])] = true;
    }
  }

  if (filasArchivarRF.length === 0) {
    return { ok: true, archivadas: 0, mensaje: 'No hay ordenes que cumplan los 3 criterios (pagada + folio SII + más de 45 días).', fechaLimite: limiteStr };
  }

  // Copiar a histórico RF
  var dataRFH = shRFH.getDataRange().getValues();
  if (dataRFH.length < 1 || !dataRFH[0][0]) {
    shRFH.appendRow(headersRF);
  }
  var filasRFOrdenadas = filasArchivarRF.slice().reverse();
  filasRFOrdenadas.forEach(function(numFila){
    shRFH.appendRow(dataRF[numFila - 1]);
  });
  filasArchivarRF.forEach(function(numFila){
    shRF.deleteRow(numFila);
  });

  // Copiar a histórico DV
  var dataDV = shDV.getDataRange().getValues();
  var headersDV = dataDV[0];
  var filasArchivarDV = [];

  for (var j = dataDV.length - 1; j >= 1; j--) {
    var filaDV = dataDV[j];
    if (!filaDV[0]) continue;
    if (nordensArchivados[String(filaDV[0])]) {
      filasArchivarDV.push(j + 1);
    }
  }

  var dataDVH = shDVH.getDataRange().getValues();
  if (dataDVH.length < 1 || !dataDVH[0][0]) {
    shDVH.appendRow(headersDV);
  }
  var filasDVOrdenadas = filasArchivarDV.slice().reverse();
  filasDVOrdenadas.forEach(function(numFila){
    shDVH.appendRow(dataDV[numFila - 1]);
  });
  filasArchivarDV.forEach(function(numFila){
    shDV.deleteRow(numFila);
  });

  PropertiesService.getScriptProperties().setProperty('ultimo_archivado',
    Utilities.formatDate(hoy, Session.getScriptTimeZone(), 'yyyy-MM-dd'));

  return {
    ok: true,
    archivadas: filasArchivarRF.length,
    lineasDetalle: filasArchivarDV.length,
    fechaLimite: limiteStr,
    mensaje: 'Archivado exitoso. ' + filasArchivarRF.length + ' órdenes movidas al histórico.'
  };
}

// =========================================
// ESTADÍSTICAS DE ARCHIVADO
// =========================================

function getEstadisticasArchivado(ss) {
  function getOrdenes(nombreHoja) {
    var sh = ss.getSheetByName(nombreHoja);
    if (!sh) return [];
    var data = sh.getDataRange().getValues();
    if (data.length < 2) return [];
    var set = {};
    for (var i = 1; i < data.length; i++) {
      if (data[i][0]) set[String(data[i][0])] = true;
    }
    return Object.keys(set);
  }

  var ordenesActivas    = getOrdenes('Resumen Facturas');
  var ordenesHistorico  = getOrdenes('Resumen Facturas Historico');
  var detalleActivas    = getOrdenes('Detalle Ventas');
  var detalleHistorico  = getOrdenes('Detalle Ventas Historico');

  // Comparar activo — ignorar órdenes que ya están en histórico
  var setActivas = {};
  ordenesActivas.forEach(function(n){ setActivas[n]=true; });
  var setDetalleHist = {};
  detalleHistorico.forEach(function(n){ setDetalleHist[n]=true; });
  // Órdenes en Detalle activo que no están en Resumen activo NI en histórico = problema real
  var soloEnDetalle = detalleActivas.filter(function(n){ return !setActivas[n] && !setDetalleHist[n]; });
  var soloEnResumen = ordenesActivas.filter(function(n){
    return detalleActivas.indexOf(n) === -1;
  });

  // Comparar histórico
  var setHistorico = {};
  ordenesHistorico.forEach(function(n){ setHistorico[n]=true; });
  var setDetalleActivo = {};
  detalleActivas.forEach(function(n){ setDetalleActivo[n]=true; });
  // Órdenes en Resumen histórico que no están en Detalle histórico NI en Detalle activo = problema real
  var soloEnResumenHist = ordenesHistorico.filter(function(n){
    return !setDetalleHist[n] && !setDetalleActivo[n];
  });
  var soloEnDetalleHist = detalleHistorico.filter(function(n){ return !setHistorico[n]; });

  var ultimoArchivado = PropertiesService.getScriptProperties().getProperty('ultimo_archivado') || '';

  return {
    ok: true,
    activo: {
      resumen: ordenesActivas.length,
      detalle: detalleActivas.length,
      sincronizado: soloEnDetalle.length === 0 && soloEnResumen.length === 0,
      soloEnDetalle: soloEnDetalle,
      soloEnResumen: soloEnResumen
    },
    historico: {
      resumen: ordenesHistorico.length,
      detalle: detalleHistorico.length,
      sincronizado: soloEnDetalleHist.length === 0 && soloEnResumenHist.length === 0,
      soloEnDetalle: soloEnDetalleHist,
      soloEnResumen: soloEnResumenHist
    },
    ultimoArchivado: ultimoArchivado
  };
}

// =========================================
// VERIFICAR ORDENES A ARCHIVAR (sin ejecutar)
// =========================================

function verificarArchivado(ss) {
  var shRF = ss.getSheetByName('Resumen Facturas');

  function parseFechaGS(val) {
    if (!val) return '';
    var d = (val instanceof Date) ? val : new Date(val);
    if (isNaN(d.getTime())) return String(val).slice(0, 10);
    return d.getFullYear() + '-' +
      String(d.getMonth()+1).padStart(2,'0') + '-' +
      String(d.getDate()).padStart(2,'0');
  }

  var hoy = new Date();
  var limite = new Date(hoy.getTime() - 45 * 24 * 60 * 60 * 1000);
  var limiteStr = limite.getFullYear() + '-' +
    String(limite.getMonth()+1).padStart(2,'0') + '-' +
    String(limite.getDate()).padStart(2,'0');

  var dataRF = shRF.getDataRange().getValues();
  var headersRF = dataRF[0];
  var colFecha  = headersRF.indexOf('Fecha');
  var colEstado = headersRF.indexOf('Estado Pago');
  var colFolio  = headersRF.indexOf('Folio SII');
  var colCliente = headersRF.indexOf('Cliente');
  var colTotal  = headersRF.indexOf('Total');

  // Se arman UNA sola vez, no por cada fila (esto era lo que dejaba la
  // verificación pegada en "Verificando..." con cientos de órdenes)
  var mapaTotalFolio   = construirMapaTotalPorFolio(dataRF, colFolio, colTotal);
  var mapaAbonadoFolio = construirMapaAbonadoPorFolio(ss);

  var ordenes = [];
  var diag = {
    columnasEncontradas: { Fecha: colFecha !== -1, 'Estado Pago': colEstado !== -1, 'Folio SII': colFolio !== -1, Total: colTotal !== -1 },
    totalFilas: 0, pasaPagada: 0, pasaFolio: 0, pasaAntigua: 0, pasaSaldo: 0,
    ejemplosRechazados: [],
    estadosVistos: {}
  };

  for (var i = 1; i < dataRF.length; i++) {
    var fila = dataRF[i];
    if (!fila[0]) continue;
    diag.totalFilas++;

    var fechaStr = parseFechaGS(fila[colFecha]);
    var estado = String(fila[colEstado] || '').trim().toUpperCase();
    var folio  = String(fila[colFolio]  || '').trim().toUpperCase();
    diag.estadosVistos[estado] = (diag.estadosVistos[estado] || 0) + 1;

    // Igual criterio que archivarOrdenes: acepta cualquier variante con "PAGADO"
    // (incluye la histórica "PAGADO EN MES"), pero PARCIAL/PENDIENTE quedan excluidos.
    var esPagada   = estado.indexOf('PAGADO') !== -1;
    var tieneFolio = folio !== '' && folio !== 'PENDIENTE' && folio !== 'NAN';
    var esAntigua  = fechaStr <= limiteStr;
    if (esPagada) diag.pasaPagada++;
    if (tieneFolio) diag.pasaFolio++;
    if (esAntigua) diag.pasaAntigua++;

    var saldoOk = true;
    if (esPagada && tieneFolio && mapaAbonadoFolio.hasOwnProperty(folio)) {
      var totalF = mapaTotalFolio[folio] || 0;
      var abonadoF = mapaAbonadoFolio[folio] || 0;
      saldoOk = (totalF - abonadoF) <= 0;
      if (saldoOk) diag.pasaSaldo++;
    } else if (esPagada && tieneFolio) {
      diag.pasaSaldo++; // sin abonos registrados: se confía en el estado PAGADO
    }

    if (esPagada && tieneFolio && esAntigua && saldoOk) {
      ordenes.push({
        nOrden: String(fila[0]),
        cliente: String(fila[colCliente] || ''),
        fecha: fechaStr,
        estado: estado,
        folio: folio
      });
    } else if (diag.ejemplosRechazados.length < 8) {
      diag.ejemplosRechazados.push({
        nOrden: String(fila[0]), estadoCrudo: estado, folioCrudo: folio,
        fecha: fechaStr, esPagada: esPagada, tieneFolio: tieneFolio, esAntigua: esAntigua, saldoOk: saldoOk
      });
    }
  }

  return { ok: true, total: ordenes.length, ordenes: ordenes, fechaLimite: limiteStr, diagnostico: diag };
}

// =========================================
// FECHA ULTIMO ARCHIVADO
// =========================================

function getUltimoArchivado(ss) {
  var fecha = PropertiesService.getScriptProperties().getProperty('ultimo_archivado') || '';
  return { ultimoArchivado: fecha };
}

// =========================================
// SINCRONIZAR DETALLE VENTAS HISTORICO
// =========================================

function sincronizarDetalleHistorico(ss) {
  var shDV  = ss.getSheetByName('Detalle Ventas');
  var shDVH = ss.getSheetByName('Detalle Ventas Historico');
  var shRFH = ss.getSheetByName('Resumen Facturas Historico');

  if (!shDVH || !shRFH) {
    return { error: 'No se encontraron las hojas de historico.' };
  }

  var dataRFH = shRFH.getDataRange().getValues();
  var nordensHistorico = {};
  for (var h = 1; h < dataRFH.length; h++) {
    if (dataRFH[h][0]) nordensHistorico[String(dataRFH[h][0])] = true;
  }
  var totalHistorico = Object.keys(nordensHistorico).length;

  var dataDVH = shDVH.getDataRange().getValues();
  var nordensYaEnDetHistorico = {};
  for (var y = 1; y < dataDVH.length; y++) {
    if (dataDVH[y][0]) nordensYaEnDetHistorico[String(dataDVH[y][0])] = true;
  }

  var dataDV = shDV.getDataRange().getValues();
  var headersDV = dataDV[0];
  var filasAMover = [];

  for (var i = dataDV.length - 1; i >= 1; i--) {
    var fila = dataDV[i];
    if (!fila[0]) continue;
    var nOrden = String(fila[0]);
    if (nordensHistorico[nOrden] && !nordensYaEnDetHistorico[nOrden]) {
      filasAMover.push(i + 1);
    }
  }

  if (filasAMover.length === 0) {
    return { ok: true, movidas: 0, mensaje: 'No hay filas pendientes de sincronizar.' };
  }

  if (dataDVH.length < 1 || !dataDVH[0][0]) {
    shDVH.appendRow(headersDV);
  }

  var filasOrdenadas = filasAMover.slice().reverse();
  filasOrdenadas.forEach(function(numFila) {
    shDVH.appendRow(dataDV[numFila - 1]);
  });
  filasAMover.forEach(function(numFila) {
    shDV.deleteRow(numFila);
  });

  return {
    ok: true,
    movidas: filasAMover.length,
    ordenesHistorico: totalHistorico,
    mensaje: 'Sincronizacion completada.'
  };
}

// =========================================
// ACTUALIZAR MODALIDAD FACTURACION CLIENTE
// =========================================

function updateClienteFacturacion(ss, body) {
  var sh = ss.getSheetByName('Clientes');
  var data = sh.getDataRange().getValues();
  var headers = data[0];
  var colNombre = headers.indexOf('Nombre');
  var colFact = headers.indexOf('Facturacion');
  if (colFact === -1) colFact = 8;
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][colNombre]).trim().toLowerCase() === body.nombre.toLowerCase()) {
      sh.getRange(i + 1, colFact + 1).setValue(body.facturacion || '');
      return { ok: true };
    }
  }
  return { error: 'Cliente no encontrado: ' + body.nombre };
}

// =========================================
// ACTUALIZAR FRECUENCIA DE PAGO CLIENTE
// =========================================

function updateClienteFrecuenciaPago(ss, body) {
  var sh = ss.getSheetByName('Clientes');
  var colFreq = obtenerOCrearColumnaFrecuenciaPago(sh); // se autocrea si no existe
  var data = sh.getDataRange().getValues();
  var headers = data[0];
  var colNombre = headers.indexOf('Nombre');
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][colNombre]).trim().toLowerCase() === body.nombre.toLowerCase()) {
      sh.getRange(i + 1, colFreq + 1).setValue(body.frecuenciaPago || '');
      return { ok: true };
    }
  }
  return { error: 'Cliente no encontrado: ' + body.nombre };
}

// =========================================
// CONEXIÓN CON FËN-PRODUCCIÓN (Maestro de recetas)
// =========================================
// Fuente única de verdad para nombres de productos entre sistemas. Ver diseño
// coordinado con la instancia de Claude de fën-producción — reglas clave:
// - El campo "Nombre" de Productos NUNCA se sobreescribe automáticamente.
// - Solo se sincronizan ID_receta_fen (que el admin asigna a mano, Parte 2) y
//   el área correspondiente, en una columna separada ("Área (fën)") que NO
//   reemplaza la Categoría existente.
// - Esta sincronización es manual e independiente del sync diario de ventas,
//   para que un problema del servidor de fën-producción nunca bloquee el
//   registro normal de órdenes.

// Descarga y parsea el CSV publicado por fën-producción. Devuelve un array de
// {ID_receta, nombre, area, estado}. Ignora recetas descontinuadas al indexar
// por ID en sincronizarConFen, pero igual se devuelven aquí (por transparencia).
function getMaestroRecetasFen() {
  var resp = UrlFetchApp.fetch(FEN_MAESTRO_CSV_URL, { muteHttpExceptions: true });
  if (resp.getResponseCode() !== 200) {
    return { error: 'No se pudo descargar el listado de fën-producción (HTTP ' + resp.getResponseCode() + ')' };
  }
  var filas = Utilities.parseCsv(resp.getContentText());
  if (!filas.length) return { ok: true, recetas: [] };
  var headers = filas[0].map(function(h){ return h.trim(); });
  var colId = headers.indexOf('ID_receta');
  var colNombre = headers.indexOf('nombre');
  var colArea = headers.indexOf('área') !== -1 ? headers.indexOf('área') : headers.indexOf('area');
  var colEstado = headers.indexOf('estado');
  var recetas = [];
  for (var i = 1; i < filas.length; i++) {
    var f = filas[i];
    if (!f[colId]) continue;
    recetas.push({
      ID_receta: String(f[colId]).trim(),
      nombre: colNombre !== -1 ? String(f[colNombre]).trim() : '',
      area: colArea !== -1 ? String(f[colArea]).trim() : '',
      estado: colEstado !== -1 ? String(f[colEstado]).trim() : ''
    });
  }
  return { ok: true, recetas: recetas };
}

// Sincroniza Área (fën) para las filas de Productos que YA tienen un
// ID_receta_fen asignado (asignarlo es manual, Parte 2). Si el ID ya no
// aparece en el listado (receta descontinuada/eliminada), NO se borra el
// ID_receta_fen de Productos — el ancla nunca queda huérfana por esto, solo
// se reporta para que el admin lo revise si quiere.
// El área que llega de fën-producción viene como palabra completa (ej.
// "Bollería", "Reventa"). En B2B se usa la convención de código corto de 3
// letras (AA, BOL, PAN, PAS...) — igual que ya usan en Categoría — así que
// siempre se guarda truncado, sin importar por qué flujo entró el dato.
function _codigoArea(area) {
  return String(area || '').trim().slice(0, 3).toUpperCase();
}

function sincronizarConFen(ss) {
  var maestro = getMaestroRecetasFen();
  if (maestro.error) return maestro;

  var porId = {};
  maestro.recetas.forEach(function(r){ porId[r.ID_receta] = r; });

  var sh = ss.getSheetByName('Productos');
  var colIdReceta = obtenerOCrearColumnaPorNombre(sh, 'ID_receta_fen');
  var colArea = obtenerOCrearColumnaPorNombre(sh, 'Área (fën)');
  var data = sh.getDataRange().getValues();

  var actualizados = 0;
  var noEncontrados = [];
  for (var i = 1; i < data.length; i++) {
    var idReceta = String(data[i][colIdReceta] || '').trim();
    if (!idReceta) continue; // sin vincular todavía: nada que sincronizar
    var receta = porId[idReceta];
    if (!receta) {
      noEncontrados.push({ nombreProducto: String(data[i][0] || ''), idReceta: idReceta });
      continue;
    }
    var areaActual = String(data[i][colArea] || '').trim();
    var areaNueva = _codigoArea(receta.area);
    if (areaActual !== areaNueva) {
      sh.getRange(i + 1, colArea + 1).setValue(areaNueva);
      actualizados++;
    }
  }

  return {
    ok: true,
    actualizados: actualizados,
    noEncontrados: noEncontrados,
    totalMaestro: maestro.recetas.length,
    maestro: maestro.recetas // se devuelve completo para que el frontend lo cachee (útil para el picker de la Parte 2)
  };
}

// Vincula (o desvincula, si idReceta/area vienen vacíos) una fila de Productos
// con una receta de fën. Varias filas de Productos pueden compartir el mismo
// idReceta (ej. Ciabatta / Ciabatta Mini / Ciabatta x Kilo → misma receta,
// distinto nombre de venta y precio) — no hay restricción de "uno a uno".
// El campo Nombre de Productos NUNCA se toca acá.
function vincularProductoFen(ss, body) {
  var sh = ss.getSheetByName('Productos');
  var colIdReceta = obtenerOCrearColumnaPorNombre(sh, 'ID_receta_fen');
  var colArea = obtenerOCrearColumnaPorNombre(sh, 'Área (fën)');
  var data = sh.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]).trim().toLowerCase() === String(body.nombreProducto || '').trim().toLowerCase()) {
      sh.getRange(i + 1, colIdReceta + 1).setValue(body.idReceta || '');
      sh.getRange(i + 1, colArea + 1).setValue(_codigoArea(body.area));
      return { ok: true };
    }
  }
  return { error: 'Producto no encontrado: ' + body.nombreProducto };
}

// =========================================
// RECONCILIACIÓN DE NOMBRES HISTÓRICOS (cliente + mes, acotado)
// =========================================
// Nunca se reescribe el histórico en bloque. El admin revisa cliente por
// cliente, mes por mes, y decide caso a caso: guardar solo la equivalencia
// (no toca ninguna orden) o reescribir esas filas puntuales ya acotadas.

function _hoyStrGS() {
  var d = new Date();
  return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
}

function _mesDeCeldaFecha(val) {
  if (!val) return '';
  if (val instanceof Date) {
    return val.getFullYear() + '-' + String(val.getMonth()+1).padStart(2,'0');
  }
  var s = String(val).trim();
  // Si ya viene como texto "YYYY-MM-DD" (como se guarda Fecha Pago, forzado a
  // @STRING@), tomamos año-mes directo del texto. Nunca pasar esto por
  // new Date(s): un string sin hora se interpreta como medianoche UTC, y al
  // convertir a hora de Chile (detrás de UTC) puede caer en el día anterior,
  // corriendo el mes hacia atrás — exactamente el bug que hacía que "1 de
  // septiembre" se contara como agosto.
  var m = s.match(/^(\d{4})-(\d{2})-\d{2}/);
  if (m) return m[1] + '-' + m[2];
  // Filas antiguas donde la fecha quedó guardada como número de serie de
  // Sheets (días desde el 30-dic-1899) en vez de texto o fecha real. Se
  // convierte con getters UTC (no locales) porque el cálculo del offset ya es
  // exactamente UTC por construcción — usar getters locales aquí reintroduce
  // el mismo corrimiento de día que acabamos de corregir arriba.
  var n = Number(s);
  if (!isNaN(n) && n >= 30000 && n <= 100000) {
    var dtSerie = new Date((n - 25569) * 86400 * 1000);
    return dtSerie.getUTCFullYear() + '-' + String(dtSerie.getUTCMonth()+1).padStart(2,'0');
  }
  var d = new Date(s);
  if (isNaN(d.getTime())) return s.slice(0,7);
  return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0');
}

// Equivalencias: nombre histórico (texto tal cual aparece en ventas viejas) -> receta vigente.
// Es solo una tabla de referencia, NUNCA toca Detalle Ventas por sí sola.
function getEquivalenciasNombres(ss) {
  var sh = obtenerOCrearHoja(ss, 'Equivalencias_nombres', ['nombre_historico', 'ID_receta_fen', 'nombre_fen', 'area', 'fecha_creada']);
  var data = sh.getDataRange().getValues();
  if (data.length < 2) return [];
  var headers = data[0];
  return data.slice(1).filter(function(r){ return r[0]; }).map(function(r){
    var obj = {};
    headers.forEach(function(h,i){ obj[h] = r[i]; });
    return obj;
  });
}

// Lista de precios para clientes nuevos: tabla independiente y editada a mano.
// Nunca toca Precio Base ni Precios especiales — es un documento de trabajo
// aparte, pensado para negociaciones que avanzan a ritmos distintos por cliente.
function getListaPreciosNuevosClientes(ss) {
  var sh = _obtenerHojaListaPreciosNuevos(ss);
  var data = sh.getDataRange().getValues();
  if (data.length < 2) return [];
  var headers = data[0];
  return data.slice(1).filter(function(r){ return r[0]; }).map(function(r){
    var obj = {};
    headers.forEach(function(h,i){ obj[h] = r[i]; });
    return obj;
  });
}

// Crea la hoja si no existe, y migra el encabezado si quedó de una versión
// anterior (sin la columna 'Incluir') — evita que las columnas queden
// desalineadas respecto a lo que el código espera.
function _obtenerHojaListaPreciosNuevos(ss) {
  var headersEsperados = ['Producto', 'Precio', 'Incluir', 'fecha_actualizado'];
  var sh = obtenerOCrearHoja(ss, 'ListaPreciosNuevosClientes', headersEsperados);
  var headerActual = sh.getLastRow() > 0 ? sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0] : [];
  var yaCorrecto = headerActual.length === headersEsperados.length &&
    headersEsperados.every(function(h, i){ return headerActual[i] === h; });
  if (!yaCorrecto) {
    var datos = sh.getLastRow() > 1 ? sh.getRange(2, 1, sh.getLastRow() - 1, Math.max(headerActual.length, 3)).getValues() : [];
    sh.clear();
    sh.appendRow(headersEsperados);
    datos.forEach(function(fila){
      // Estructura vieja: [Producto, Precio, fecha_actualizado] -> agregamos 'TRUE' por defecto
      if (fila[0]) sh.appendRow([fila[0], fila[1] || 0, 'TRUE', fila[2] || '']);
    });
  }
  return sh;
}

// Sobrescribe la lista completa con lo que venga del front (guardado explícito,
// no automático). body.filas = [{producto, precio, incluir}, ...]
// "incluir" controla solo si aparece en el PDF exportado — el precio se
// conserva igual aunque el producto quede desmarcado, para no perder el
// trabajo de edición si se vuelve a incluir más adelante.
function guardarListaPreciosNuevosClientes(ss, body) {
  var sh = _obtenerHojaListaPreciosNuevos(ss);
  var filas = body.filas || [];
  var ultimaFila = sh.getLastRow();
  if (ultimaFila > 1) sh.getRange(2, 1, ultimaFila - 1, 4).clearContent();
  var hoy = _hoyStrGS();
  var valores = filas
    .filter(function(f){ return f.producto && f.precio !== '' && f.precio !== null && f.precio !== undefined; })
    .map(function(f){ return [f.producto, Number(f.precio) || 0, f.incluir ? 'TRUE' : 'FALSE', hoy]; });
  if (valores.length) {
    var rango = sh.getRange(2, 1, valores.length, 4);
    rango.setValues(valores);
    sh.getRange(2, 4, valores.length, 1).setNumberFormat('@STRING@');
  }
  return { ok: true, total: valores.length };
}

function guardarEquivalenciaNombre(ss, body) {
  var sh = obtenerOCrearHoja(ss, 'Equivalencias_nombres', ['nombre_historico', 'ID_receta_fen', 'nombre_fen', 'area', 'fecha_creada']);
  var data = sh.getDataRange().getValues();
  var nombreHistorico = String(body.nombreHistorico || '').trim();
  if (!nombreHistorico) return { error: 'Falta el nombre histórico' };
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]).trim().toLowerCase() === nombreHistorico.toLowerCase()) {
      sh.getRange(i + 1, 2).setValue(body.idReceta || '');
      sh.getRange(i + 1, 3).setValue(body.nombreFen || '');
      sh.getRange(i + 1, 4).setValue(body.area || '');
      return { ok: true };
    }
  }
  sh.appendRow([nombreHistorico, body.idReceta || '', body.nombreFen || '', body.area || '', '']);
  var celdaFecha = sh.getRange(sh.getLastRow(), 5);
  celdaFecha.setNumberFormat('@STRING@');
  celdaFecha.setValue(_hoyStrGS());
  return { ok: true };
}

function eliminarEquivalenciaNombre(ss, body) {
  var sh = ss.getSheetByName('Equivalencias_nombres');
  if (!sh) return { ok: true };
  var data = sh.getDataRange().getValues();
  var nombreHistorico = String(body.nombreHistorico || '').trim().toLowerCase();
  for (var i = data.length - 1; i >= 1; i--) {
    if (String(data[i][0]).trim().toLowerCase() === nombreHistorico) {
      sh.deleteRow(i + 1);
      return { ok: true };
    }
  }
  return { error: 'No se encontró esa equivalencia' };
}

// Tabla de seguimiento Cliente × Mes, para que el admin no pierda el hilo de
// qué recortes ya revisó.
function getSeguimientoReconciliacion(ss) {
  var sh = obtenerOCrearHoja(ss, 'Reconciliacion_seguimiento', ['cliente', 'mes', 'estado', 'fecha']);
  var data = sh.getDataRange().getValues();
  if (data.length < 2) return [];
  var headers = data[0];
  return data.slice(1).filter(function(r){ return r[0]; }).map(function(r){
    var obj = {};
    headers.forEach(function(h,i){ obj[h] = r[i]; });
    return obj;
  });
}

function marcarSeguimientoReconciliacion(ss, body) {
  var sh = obtenerOCrearHoja(ss, 'Reconciliacion_seguimiento', ['cliente', 'mes', 'estado', 'fecha']);
  var data = sh.getDataRange().getValues();
  var cliente = String(body.cliente || '').trim();
  var mes = String(body.mes || '').trim();
  var fila = -1;
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]).trim().toLowerCase() === cliente.toLowerCase() && String(data[i][1]).trim() === mes) {
      fila = i + 1;
      break;
    }
  }
  if (fila === -1) {
    sh.appendRow([cliente, '', body.estado || 'Pendiente', '']);
    fila = sh.getLastRow();
  }
  // Forzamos formato de texto en "mes" y "fecha" — si no, Sheets las
  // interpreta como fechas reales al verse como "2026-08", y al leerlas de
  // vuelta aparecen con día de semana y huso horario, ilegible.
  var celdaMes = sh.getRange(fila, 2);
  celdaMes.setNumberFormat('@STRING@');
  celdaMes.setValue(mes);
  sh.getRange(fila, 3).setValue(body.estado || 'Pendiente');
  var celdaFecha = sh.getRange(fila, 4);
  celdaFecha.setNumberFormat('@STRING@');
  celdaFecha.setValue(_hoyStrGS());
  return { ok: true };
}

// Reescribe el campo "Producto" SOLO para las filas de Detalle Ventas (activo
// e histórico) que coincidan exactamente con cliente + mes + nombre viejo —
// nunca en bloque. También guarda la equivalencia de paso. nombreNuevo es el
// nombre vigente de la receta en fën (nombre_fen), no un nombre de venta
// específico — así todas las variantes viejas convergen en un solo texto
// reconocible para reportes futuros.
function reescribirNombreProducto(ss, body) {
  var cliente = String(body.cliente || '').trim().toLowerCase();
  var mes = String(body.mes || '').trim();
  var nombreViejo = String(body.nombreViejo || '').trim().toLowerCase();
  var nombreNuevo = String(body.nombreNuevo || '').trim();
  // Opcional: si viene precioFiltro, solo se reescriben las líneas de ese
  // nombre viejo que ADEMÁS tengan ese precio unitario exacto — permite
  // separar variantes que el histórico registró con el mismo nombre genérico
  // pero que el precio delata como distintas (ej. Ciabatta $460 vs Mini $125).
  var precioFiltro = (body.precioFiltro === '' || typeof body.precioFiltro === 'undefined' || body.precioFiltro === null)
    ? null : Number(body.precioFiltro);
  if (!cliente || !mes || !nombreViejo) return { error: 'Faltan datos (cliente, mes o nombre viejo)' };
  if (!nombreNuevo) return { error: 'Falta el nombre nuevo' };

  function reescribirEn(nombreHoja) {
    var sh = ss.getSheetByName(nombreHoja);
    if (!sh) return 0;
    var data = sh.getDataRange().getValues();
    var headers = data[0];
    var colCliente = headers.indexOf('Cliente');
    var colFecha = headers.indexOf('Fecha');
    var colProducto = headers.indexOf('Producto');
    var colPrecio = headers.indexOf('Precio Neto Unit.');
    if (colCliente === -1 || colFecha === -1 || colProducto === -1) return 0;
    var n = 0;
    for (var i = 1; i < data.length; i++) {
      if (!data[i][0]) continue;
      if (String(data[i][colCliente] || '').trim().toLowerCase() !== cliente) continue;
      if (_mesDeCeldaFecha(data[i][colFecha]) !== mes) continue;
      if (String(data[i][colProducto] || '').trim().toLowerCase() !== nombreViejo) continue;
      if (precioFiltro !== null) {
        if (colPrecio === -1) continue;
        if (Number(data[i][colPrecio]) !== precioFiltro) continue;
      }
      sh.getRange(i + 1, colProducto + 1).setValue(nombreNuevo);
      n++;
    }
    return n;
  }

  var nActivo = reescribirEn('Detalle Ventas');
  var nHistorico = reescribirEn('Detalle Ventas Historico');

  // Nota: antes esta función también guardaba la equivalencia de forma
  // automática — se quitó a propósito. "Reescribir" es una acción acotada a
  // un cliente+mes puntual; guardar la equivalencia es una decisión global y
  // deliberada, y debe quedar completamente separada (ver tarjeta de
  // Reconciliación). Si el nombre es realmente inequívoco, el admin puede
  // guardar la equivalencia aparte, a propósito.

  return { ok: true, actualizadasActivo: nActivo, actualizadasHistorico: nHistorico, total: nActivo + nHistorico };
}

// =========================================
// RECETAS OCULTAS (lista "sin producto en B2B")
// =========================================
// Reversible: ocultar una receta de la lista de "recetas sin producto" no
// borra nada, solo la pliega. Se puede volver a mostrar en cualquier momento.

function getRecetasOcultasB2B(ss) {
  var sh = obtenerOCrearHoja(ss, 'Recetas_ocultas_B2B', ['ID_receta', 'nombre', 'fecha_ocultada']);
  var data = sh.getDataRange().getValues();
  if (data.length < 2) return [];
  var headers = data[0];
  return data.slice(1).filter(function(r){ return r[0]; }).map(function(r){
    var obj = {};
    headers.forEach(function(h,i){ obj[h] = r[i]; });
    return obj;
  });
}

function ocultarRecetaB2B(ss, body) {
  var sh = obtenerOCrearHoja(ss, 'Recetas_ocultas_B2B', ['ID_receta', 'nombre', 'fecha_ocultada']);
  var data = sh.getDataRange().getValues();
  var idReceta = String(body.idReceta || '').trim();
  if (!idReceta) return { error: 'Falta el ID de receta' };
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]).trim() === idReceta) return { ok: true }; // ya estaba oculta
  }
  sh.appendRow([idReceta, body.nombre || '', _hoyStrGS()]);
  return { ok: true };
}

function mostrarRecetaB2B(ss, body) {
  var sh = obtenerOCrearHoja(ss, 'Recetas_ocultas_B2B', ['ID_receta', 'nombre', 'fecha_ocultada']);
  var data = sh.getDataRange().getValues();
  var idReceta = String(body.idReceta || '').trim();
  for (var i = data.length - 1; i >= 1; i--) {
    if (String(data[i][0]).trim() === idReceta) {
      sh.deleteRow(i + 1);
    }
  }
  return { ok: true };
}

// =========================================
// VENTAS MENSUALES POR RECETA (para fën-producción)
// =========================================
// Agregación mensual (no factura por factura) por ID_receta_fen. Se
// reconstruye completa cada vez que se genera — no es un libro incremental,
// es un reporte derivado. Código 100% aditivo: no toca Órdenes, Facturación
// ni Detalle Ventas existentes, solo los LEE.
//
// monto_neto = suma de "Neto Total" de cada línea (ya es neto en B2B: el IVA
// se calcula sumando sobre el neto, nunca se parte de un precio con IVA
// incluido, así que no hace falta dividir por 1.19 como en B2C).

function generarVentasMensualesFen(ss) {
  var shProd = ss.getSheetByName('Productos');
  var dataProd = shProd.getDataRange().getValues();
  var headersProd = dataProd[0];
  var colNombreProd = headersProd.indexOf('Nombre');
  var colIdRecetaProd = headersProd.indexOf('ID_receta_fen');

  var mapaProductoAId = {};        // nombre (normalizado) -> ID_receta_fen
  var nombresProductosConocidos = {}; // nombre (normalizado) -> true
  for (var i = 1; i < dataProd.length; i++) {
    var nombre = String(dataProd[i][colNombreProd] || '').trim().toLowerCase();
    if (!nombre) continue;
    nombresProductosConocidos[nombre] = true;
    var idReceta = colIdRecetaProd !== -1 ? String(dataProd[i][colIdRecetaProd] || '').trim() : '';
    if (idReceta) mapaProductoAId[nombre] = idReceta;
  }

  // Respaldo: nombres históricos reconciliados con "Guardar equivalencia" (sin
  // reescribir Detalle Ventas). Sin esto, esas ventas quedaban fuera del total
  // mensual aunque la equivalencia ya estuviera documentada.
  var mapaEquivalencias = {}; // nombre_historico (normalizado) -> ID_receta_fen
  var shEquiv = ss.getSheetByName('Equivalencias_nombres');
  if (shEquiv) {
    var dataEquiv = shEquiv.getDataRange().getValues();
    for (var e = 1; e < dataEquiv.length; e++) {
      var nombreHist = String(dataEquiv[e][0] || '').trim().toLowerCase();
      var idRecetaEquiv = String(dataEquiv[e][1] || '').trim();
      if (nombreHist && idRecetaEquiv) mapaEquivalencias[nombreHist] = idRecetaEquiv;
    }
  }

  function leerLineas(nombreHoja) {
    var sh = ss.getSheetByName(nombreHoja);
    if (!sh) return [];
    var data = sh.getDataRange().getValues();
    if (data.length < 2) return [];
    var headers = data[0];
    var colProducto = headers.indexOf('Producto');
    var colFecha = headers.indexOf('Fecha');
    var colCantidad = headers.indexOf('Cantidad');
    var colNeto = headers.indexOf('Neto Total');
    var out = [];
    for (var i = 1; i < data.length; i++) {
      if (!data[i][0]) continue;
      out.push({
        producto: String(data[i][colProducto] || '').trim(),
        mes: _mesDeCeldaFecha(data[i][colFecha]),
        cantidad: Number(data[i][colCantidad]) || 0,
        neto: Number(data[i][colNeto]) || 0
      });
    }
    return out;
  }

  // Activo + histórico archivado — nunca hace falta filtrar "anuladas": en
  // B2B cancelar una orden la borra físicamente, así que si una línea existe
  // acá es porque efectivamente se vendió.
  var lineas = leerLineas('Detalle Ventas').concat(leerLineas('Detalle Ventas Historico'));

  var agregados = {};  // "idReceta|mes" -> {idReceta, mes, cantidad, neto}
  var huerfanas = {};  // nombreProducto tal cual -> {filas, monto, meses:{}}

  lineas.forEach(function(l) {
    if (!l.producto || !l.mes) return;
    var nombreNorm = l.producto.toLowerCase();
    var idReceta = mapaProductoAId[nombreNorm] || mapaEquivalencias[nombreNorm];
    if (!idReceta) {
      // Puede ser (a) producto existe pero sin ID_receta_fen (normal, se omite
      // en silencio) o (b) el nombre no corresponde a NINGÚN producto actual
      // ni a ninguna equivalencia guardada (huérfana real: el producto fue
      // borrado o renombrado a mano en la Sheet, sin reconciliar).
      if (!nombresProductosConocidos[nombreNorm]) {
        if (!huerfanas[l.producto]) huerfanas[l.producto] = { filas: 0, monto: 0, meses: {} };
        huerfanas[l.producto].filas++;
        huerfanas[l.producto].monto += l.neto;
        huerfanas[l.producto].meses[l.mes] = true;
      }
      return;
    }
    var clave = idReceta + '|' + l.mes;
    if (!agregados[clave]) agregados[clave] = { idReceta: idReceta, mes: l.mes, cantidad: 0, neto: 0 };
    agregados[clave].cantidad += l.cantidad;
    agregados[clave].neto += l.neto;
  });

  var sh = obtenerOCrearHoja(ss, 'VentasMensualesFenB2B', ['ID_receta_fen', 'mes', 'cantidad_vendida', 'monto_neto']);
  sh.clearContents();
  sh.appendRow(['ID_receta_fen', 'mes', 'cantidad_vendida', 'monto_neto']);

  var filas = Object.keys(agregados).map(function(k){ return agregados[k]; }).sort(function(a,b){
    if (a.mes !== b.mes) return a.mes < b.mes ? -1 : 1;
    return a.idReceta < b.idReceta ? -1 : (a.idReceta > b.idReceta ? 1 : 0);
  });
  filas.forEach(function(f) {
    sh.appendRow([f.idReceta, f.mes, f.cantidad, Math.round(f.neto)]);
  });

  var avisoHuerfanas = Object.keys(huerfanas).map(function(nombre) {
    return {
      producto: nombre,
      filas: huerfanas[nombre].filas,
      monto: Math.round(huerfanas[nombre].monto),
      meses: Object.keys(huerfanas[nombre].meses).sort()
    };
  });

  return { ok: true, filasEscritas: filas.length, avisoHuerfanas: avisoHuerfanas };
}

// =========================================
// TOTAL NETO MENSUAL — fuente de verdad (sin depender de vínculo a fën)
// =========================================
// A diferencia de generarVentasMensualesFen (que agrupa por receta y omite
// productos sin vincular), esta función suma el Total Neto real de TODAS las
// órdenes del mes, tal cual está en Resumen Facturas — sirve para que
// fën-producción pueda verificar que la suma de lo que le enviamos por
// receta efectivamente cuadra con el total real de B2B ese mes.
function generarVentasMensualesTotalB2B(ss) {
  function leerOrdenes(nombreHoja) {
    var sh = ss.getSheetByName(nombreHoja);
    if (!sh) return [];
    var data = sh.getDataRange().getValues();
    if (data.length < 2) return [];
    var headers = data[0];
    var colFecha = headers.indexOf('Fecha');
    var colNeto = headers.indexOf('Total Neto');
    var out = [];
    for (var i = 1; i < data.length; i++) {
      if (!data[i][0]) continue;
      out.push({
        mes: _mesDeCeldaFecha(data[i][colFecha]),
        neto: Number(data[i][colNeto]) || 0
      });
    }
    return out;
  }

  // Activo + histórico archivado — igual que en generarVentasMensualesFen,
  // sin filtrar nada más: si la fila existe, es porque se vendió de verdad.
  var ordenes = leerOrdenes('Resumen Facturas').concat(leerOrdenes('Resumen Facturas Historico'));

  var porMes = {};
  ordenes.forEach(function(o) {
    if (!o.mes) return;
    if (!porMes[o.mes]) porMes[o.mes] = 0;
    porMes[o.mes] += o.neto;
  });

  var meses = Object.keys(porMes).sort();
  var sh = obtenerOCrearHoja(ss, 'VentasMensualesTotalB2B', ['mes', 'total_neto']);
  var ultimaFila = sh.getLastRow();
  if (ultimaFila > 1) sh.getRange(2, 1, ultimaFila - 1, 2).clearContent();
  var valores = meses.map(function(m) { return [m, Math.round(porMes[m])]; });
  if (valores.length) {
    sh.getRange(2, 1, valores.length, 2).setValues(valores);
    sh.getRange(2, 1, valores.length, 1).setNumberFormat('@STRING@');
  }
  return { ok: true, filasEscritas: valores.length };
}

// =========================================
// DIAGNÓSTICO: detalle línea por línea de qué cuenta generarCobrosMensualesB2B
// para un mes específico — mismo criterio exacto, para poder comparar contra
// lo que muestra la app y encontrar diferencias puntuales.
// =========================================
function diagnosticoCobrosMes(ss, body) {
  var mesObjetivo = String(body.mes || '').trim();
  if (!mesObjetivo) return { error: 'Falta el mes (formato YYYY-MM)' };

  var foliosConAbono = {};
  var abonosDelMes = [];
  var shAbonos = ss.getSheetByName('Abonos');
  if (shAbonos) {
    var dataAbonos = shAbonos.getDataRange().getValues();
    for (var a = 1; a < dataAbonos.length; a++) {
      var folio = String(dataAbonos[a][0] || '').trim();
      var fecha = dataAbonos[a][1];
      var monto = Number(dataAbonos[a][2]) || 0;
      if (!folio || !fecha || !monto) continue;
      foliosConAbono[folio] = true;
      if (_mesDeCeldaFecha(fecha) === mesObjetivo) {
        abonosDelMes.push({ folio: folio, fecha: String(fecha), monto: monto });
      }
    }
  }

  function leerOrdenesPagadasDelMes(nombreHoja) {
    var sh = ss.getSheetByName(nombreHoja);
    if (!sh) return [];
    var data = sh.getDataRange().getValues();
    if (data.length < 2) return [];
    var headers = data[0];
    var colFolio = headers.indexOf('Folio SII');
    var colEstado = headers.indexOf('Estado Pago');
    var colFechaPago = headers.indexOf('Fecha Pago');
    var colTotal = headers.indexOf('Total');
    var colCliente = headers.indexOf('Cliente');
    var colNOrden = headers.indexOf('N° Orden');
    var out = [];
    for (var i = 1; i < data.length; i++) {
      if (!data[i][0]) continue;
      var estado = String(data[i][colEstado] || '').toUpperCase();
      if (estado.indexOf('PAGADO') === -1) continue;
      var folio = colFolio !== -1 ? String(data[i][colFolio] || '').trim() : '';
      if (folio && foliosConAbono[folio]) continue; // se cuenta vía abono, no acá
      var fechaPago = colFechaPago !== -1 ? data[i][colFechaPago] : '';
      if (!fechaPago) continue;
      if (_mesDeCeldaFecha(fechaPago) !== mesObjetivo) continue;
      out.push({
        nOrden: data[i][colNOrden],
        folio: folio,
        cliente: colCliente !== -1 ? data[i][colCliente] : '',
        total: colTotal !== -1 ? (Number(data[i][colTotal]) || 0) : 0,
        fechaPago: String(fechaPago),
        hoja: nombreHoja
      });
    }
    return out;
  }

  var ordenesDirectas = leerOrdenesPagadasDelMes('Resumen Facturas').concat(leerOrdenesPagadasDelMes('Resumen Facturas Historico'));

  var totalAbonos = abonosDelMes.reduce(function(s, a) { return s + a.monto; }, 0);
  var totalDirectas = ordenesDirectas.reduce(function(s, o) { return s + o.total; }, 0);

  return {
    ok: true,
    mes: mesObjetivo,
    abonos: abonosDelMes,
    ordenesDirectas: ordenesDirectas,
    totalAbonos: totalAbonos,
    totalDirectas: totalDirectas,
    totalGeneral: totalAbonos + totalDirectas
  };
}

// =========================================
// COBROS MENSUALES — fecha REAL en que entra la plata (para flujo de caja)
// =========================================
// No es lo mismo que "Fecha Pago": un folio pagado en abonos parciales tiene
// su plata entrando en fechas distintas, cada una con su propio monto — usar
// solo "Fecha Pago" (que se llena recién cuando el folio queda 100% saldado)
// atribuiría TODO el monto a un solo mes, aunque el dinero haya entrado a lo
// largo de varios meses. Por eso esta función combina dos fuentes sin duplicar:
//   1) Folios con abonos registrados -> se usa CADA abono, con su propia fecha
//      y monto (la fuente más granular y precisa que existe).
//   2) Órdenes pagadas de una sola vez (nunca pasaron por Abonos) -> se usa
//      el total de la orden completo, en el mes de su "Fecha Pago".
// Un folio nunca se cuenta por las dos vías a la vez.
function generarCobrosMensualesB2B(ss) {
  var porMes = {};

  // 1) Abonos: cada uno con su propia fecha y monto real
  var foliosConAbono = {};
  var shAbonos = ss.getSheetByName('Abonos');
  if (shAbonos) {
    var dataAbonos = shAbonos.getDataRange().getValues();
    for (var a = 1; a < dataAbonos.length; a++) {
      var folio = String(dataAbonos[a][0] || '').trim();
      var fecha = dataAbonos[a][1];
      var monto = Number(dataAbonos[a][2]) || 0;
      if (!folio || !fecha || !monto) continue;
      foliosConAbono[folio] = true;
      var mesAbono = _mesDeCeldaFecha(fecha);
      if (!mesAbono) continue;
      if (!porMes[mesAbono]) porMes[mesAbono] = 0;
      porMes[mesAbono] += monto;
    }
  }

  // 2) Órdenes pagadas de una sola vez (sin folios que ya se contaron por abonos)
  function leerOrdenesPagadas(nombreHoja) {
    var sh = ss.getSheetByName(nombreHoja);
    if (!sh) return [];
    var data = sh.getDataRange().getValues();
    if (data.length < 2) return [];
    var headers = data[0];
    var colFolio = headers.indexOf('Folio SII');
    var colEstado = headers.indexOf('Estado Pago');
    var colFechaPago = headers.indexOf('Fecha Pago');
    var colTotal = headers.indexOf('Total');
    var out = [];
    for (var i = 1; i < data.length; i++) {
      if (!data[i][0]) continue;
      var estado = String(data[i][colEstado] || '').toUpperCase();
      if (estado.indexOf('PAGADO') === -1) continue;
      var folio = colFolio !== -1 ? String(data[i][colFolio] || '').trim() : '';
      if (folio && foliosConAbono[folio]) continue; // ya contado vía Abonos
      var fechaPago = colFechaPago !== -1 ? data[i][colFechaPago] : '';
      if (!fechaPago) continue;
      out.push({
        mes: _mesDeCeldaFecha(fechaPago),
        total: colTotal !== -1 ? (Number(data[i][colTotal]) || 0) : 0
      });
    }
    return out;
  }

  var ordenesPagadas = leerOrdenesPagadas('Resumen Facturas').concat(leerOrdenesPagadas('Resumen Facturas Historico'));
  ordenesPagadas.forEach(function(o) {
    if (!o.mes) return;
    if (!porMes[o.mes]) porMes[o.mes] = 0;
    porMes[o.mes] += o.total;
  });

  var meses = Object.keys(porMes).sort();
  var sh = obtenerOCrearHoja(ss, 'CobrosMensualesB2B', ['mes', 'monto_cobrado']);
  var ultimaFila = sh.getLastRow();
  if (ultimaFila > 1) sh.getRange(2, 1, ultimaFila - 1, 2).clearContent();
  var valores = meses.map(function(m) { return [m, Math.round(porMes[m])]; });
  if (valores.length) {
    sh.getRange(2, 1, valores.length, 2).setValues(valores);
    sh.getRange(2, 1, valores.length, 1).setNumberFormat('@STRING@');
  }
  return { ok: true, filasEscritas: valores.length };
}

// Busca la columna "Frecuencia Pago" en la hoja Clientes; si no existe, la crea
// automáticamente al final (agrega el encabezado en la primera columna vacía).
// Devuelve el índice de columna en base 0 (mismo formato que headers.indexOf).
function obtenerOCrearColumnaFrecuenciaPago(sh) {
  var ultimaCol = Math.max(sh.getLastColumn(), 1);
  var headers = sh.getRange(1, 1, 1, ultimaCol).getValues()[0];
  var col = headers.indexOf('Frecuencia Pago');
  if (col !== -1) return col;
  var nuevaCol = ultimaCol + 1;
  sh.getRange(1, nuevaCol).setValue('Frecuencia Pago');
  return nuevaCol - 1;
}

// Función opcional para correr UNA VEZ manualmente desde el editor de Apps Script
// (menú desplegable de funciones → seleccionar "crearColumnaFrecuenciaPago" → ▶ Ejecutar),
// por si prefieres crear la columna de antemano en vez de esperar al primer uso.
function crearColumnaFrecuenciaPago() {
  var ss = SpreadsheetApp.openById(SHEET_ID);
  var sh = ss.getSheetByName('Clientes');
  var ultimaCol = Math.max(sh.getLastColumn(), 1);
  var headers = sh.getRange(1, 1, 1, ultimaCol).getValues()[0];
  if (headers.indexOf('Frecuencia Pago') !== -1) {
    Logger.log('La columna "Frecuencia Pago" ya existe. No se hicieron cambios.');
    return;
  }
  var nuevaCol = ultimaCol + 1;
  sh.getRange(1, nuevaCol).setValue('Frecuencia Pago');
  Logger.log('Columna "Frecuencia Pago" creada en la columna ' + nuevaCol + ' de la hoja Clientes.');
}