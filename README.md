# fën ventas B2B · v2.0.0 (seguridad)

**App:** v2.0.0 · **Apps Script:** v2.0.0 (`Code.gs` + `Seguridad.gs`) · Requiere **Asistencia Apps Script v5.2.0** · 2 de octubre de 2026

Cuarta entrega de la Fase 0 de Sistema Fën. Hasta ahora, cualquiera con la dirección del script podía leer clientes, precios y órdenes, o asignar folios, registrar pagos y borrar órdenes. Desde esta versión entran dos tipos de persona:

- **Tú (dueño):** con tu contraseña de dueño, la misma del panel de Asistencia. Ves y haces todo, como hasta ahora.
- **Despacho:** con su PIN de Asistencia, desde un equipo que autorizaste una vez. Solo ve **Órdenes**: puede crear órdenes y editar las que todavía no tienen folio ni pago.

Las pantallas son las mismas.

## Qué cambia

| Antes (v1) | Ahora (v2) |
| --- | --- |
| El script aceptaba cualquier llamada | Ninguna acción funciona sin sesión, y cada acción revisa quién la pide |
| Quien despachaba usaba la app completa | Despacho ve solo **Órdenes** (nueva orden y lista). Folios, pagos, cartolas, estado de cuenta, análisis, clientes, productos, precios y configuración quedan solo para ti, y el servidor lo exige aunque alguien intente saltarse la pantalla |
| Editar una orden con folio estaba bloqueado solo en la pantalla | El servidor tampoco deja que despacho edite una orden con folio o con pago registrado |
| Si Google entregaba una respuesta rota, la app reintentaba y una escritura podía repetirse | Cada escritura lleva una clave única: los reintentos nunca duplican |
| — | **⚙️ Config → 🔒 Seguridad**: eliges quién es de despacho (puede ser más de una persona) y ves o cierras equipos y sesiones |

**Detalles de despacho:**
- Sí ve los precios dentro de las órdenes, porque los necesita para armarlas, igual que hoy. No puede cambiar la lista de precios.
- Su sesión dura 12 horas. Al recargar la página vuelve a poner su PIN.
- Si la sacas de la lista o cierras su equipo en Seguridad, pierde el acceso de inmediato.

## Archivos

```
index.html     igual que v1 + carga fen-acceso.js + tarjeta 🔒 Seguridad + estilos de despacho → GitHub (raíz del repo de B2B)
fen-acceso.js  NUEVO: pantalla de entrada (dueño / despacho con PIN) y conexión segura             → GitHub (junto a index.html)
Code.gs        el script de v1; su doGet/doPost/handleRequest ahora se llama ejecutarAccionLegada   → Apps Script (reemplaza todo el archivo principal)
Seguridad.gs   NUEVO: recibe todas las llamadas y revisa sesión y permisos                          → Apps Script (archivo nuevo en el mismo proyecto)
README.md      este archivo                                                                        → GitHub (respaldo)
```

## Antes de empezar: Asistencia v5.2.0

Si ya la instalaste para Gastos, solo ejecuta en Asistencia la función `crearClaveServicioB2B`. Te da una clave `fsv-…` propia de B2B; cópiala directo en el paso 1.4 y no la guardes en ningún documento.

## 1. Probar en una copia

1. En Drive, haz una copia de la planilla de B2B y llámala `fen b2b PRUEBA`. Copia su ID: la parte de la URL entre `/d/` y `/edit`.
2. Abre la copia → **Extensiones → Apps Script**. Si no aparece el código, búscalo en [script.google.com](https://script.google.com) y usa **Hacer una copia**.
3. En el script de la copia:
   - Reemplaza el archivo principal por `Code.gs`.
   - Crea un archivo nuevo `Seguridad` y pega `Seguridad.gs`.
   - **Importante:** en `Code.gs`, cambia `SHEET_ID` por el ID de la copia. Si no, la prueba escribiría en tu planilla real.
4. Ve a **⚙️ Configuración del proyecto → Propiedades del script** y agrega:
   - `ASISTENCIA_URL` = la misma URL de Asistencia de siempre.
   - `ASISTENCIA_CLAVE` = la clave `fsv-…` de B2B.
5. En `Seguridad.gs`, ejecuta `instalarSeguridad`. Debe decir "Conexión con Asistencia OK (v5.2.0)".
6. Ve a **Implementar → Nueva implementación → Aplicación web**, con "Ejecutar como: Yo" y "Acceso: Cualquier persona". Copia la URL.
7. Sube la carpeta `prueba` del zip `prueba-b2b.zip` al repo de B2B.
   - (i) La versión de prueba guarda su dirección y sus sesiones aparte (`fen_gs_prueba`), así no le cambia la configuración a la app real en tu navegador.
8. Abre `…/prueba/`. Aparece el aviso amarillo para conectar: pega la URL del paso 6 y presiona **Conectar**. Ahí te pide entrar: elige **Entrar como dueño**.
9. Revisa la lista de verificación.

## 2. Pasar a producción

1. Haz una copia de respaldo de la planilla real.
2. En el script real, repite los pasos 1.3 (sin cambiar `SHEET_ID`), 1.4 y 1.5.
3. Ve a **Implementar → Gestionar implementaciones → ✏️ → Nueva versión → Implementar**. La URL no cambia.
4. En la raíz del repo, sube `index.html` y `fen-acceso.js`, más `Code.gs`, `Seguridad.gs` y `README.md` como respaldo.
5. Abre la app como dueño → **⚙️ Config → 🔒 Seguridad** → marca a la persona de despacho → **Guardar**.
6. En el celular o computador de despacho: abre la app → **Autorizar este equipo** (escribes tu contraseña una vez) → ella toca su nombre y pone su PIN.

## Lista de verificación en la copia

**Dueño:**
- [ ] Al abrir pide entrar. Como dueño, con tu contraseña, todo carga como antes.
- [ ] Crear, editar y eliminar una orden, asignar un folio, registrar un pago, procesar una cartola de prueba.
- [ ] Clientes, productos, precios, análisis, estado de cuenta y archivado funcionan.
- [ ] **⚙️ Config → 🔒 Seguridad** muestra "Conectada" y las personas de Asistencia. Marca a alguien de despacho y guarda.

**Despacho** (en otro equipo o en una ventana de incógnito):
- [ ] Pide autorizar el equipo con tu contraseña. Luego aparece su nombre y entra con su PIN; un PIN malo avisa.
- [ ] Solo aparece la pestaña **Órdenes**, y en la lista no aparecen los botones Pago ni Eliminar.
- [ ] Puede crear una orden y editar una sin folio. La orden con folio sale bloqueada.
- [ ] En Seguridad (como dueño), al cerrar su sesión o sacarla de la lista, en su siguiente acción le pide entrar de nuevo.

## Si algo sale mal

- **"Falta conectar esta app con Asistencia" o "No se pudo conectar":** revisa las dos propiedades y que Asistencia tenga implementada la v5.2.0.
- **La persona no aparece en "¿Quién entra?":** márcala en 🔒 Seguridad. Si dice "Sin PIN", asígnale uno en el panel de Asistencia.
- **Volver a v1:** en **Gestionar implementaciones**, vuelve a la versión anterior y restaura `index.html` desde el historial de GitHub. No se pierde ningún dato: v2 no cambia ninguna hoja.

## Pruebas automáticas

Corrieron en el simulador, con B2B y Asistencia conectados y datos ficticios:
- **7 pruebas del script:** editar una orden sin productos válidos no la borra (ni para el dueño); nada funciona sin sesión; el dueño hace todo; despacho entra solo si está en la lista y desde un equipo autorizado; despacho crea órdenes y edita solo las que no tienen folio ni pago; queda bloqueado en folios, pagos, abonos, eliminar, precios, productos, clientes, cartolas, archivado y Seguridad; pierde el acceso al sacarla o cerrar su equipo; el bloqueo de PIN se comparte con la tablet.
- **3 pruebas en el navegador:** dueño en computador, y despacho en celular con autorización del equipo, PIN, solo Órdenes, y un folio forzado desde la consola que el servidor rechaza.

## Riesgos conocidos (para el rediseño 2027)

- "Eliminar orden" sigue borrando las filas de verdad (solo lo puede hacer el dueño). En el sistema nuevo se anulará en vez de borrar.
- Si la planilla de B2B está compartida con "cualquier persona con el enlace", conviene pasarla a **Restringido**. Producción lee sus pestañas publicadas (ventas y cobros mensuales), y eso sigue funcionando porque la publicación web es independiente del acceso general.
