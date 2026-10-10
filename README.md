# Cartera · v0.3
Registro personal de acciones, CEDEARs, bonos, ON, letras y criptomonedas Spot. Referencia de conversión: dólar CCL. Sin opciones ni futuros.

## Estado
Código preparado para GitHub Pages. No desplegado. Sincronización implementada para Supabase, pendiente de configurar y de probar contra un proyecto real. Cálculos verificados con `node test.cjs`; sintaxis JS comprobada. QA visual pendiente por limitaciones del entorno.

## GitHub Pages
Subir los archivos de esta carpeta a la raíz de un repositorio. En Settings → Pages elegir Deploy from a branch, main, /(root). Abrir la URL informada por GitHub. No publicar respaldos ni credenciales privadas en el repositorio.
Guía oficial: https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site

## Sincronización privada
1. Crear un proyecto Supabase propio.
2. Ejecutar `supabase.sql` una sola vez en SQL Editor. Crea tabla, políticas por usuario y operaciones con control de versión.
3. En Authentication crear tu usuario de email y contraseña; desactivar altas públicas si solo vos usarás la app.
4. En el panel de sincronización de la app ingresar la URL del proyecto y su clave pública `sb_publishable_…`. No usar claves secret/service_role. Configurar en ambos dispositivos.
5. Iniciar sesión. Descargar primero; si la cuenta está vacía, subir la cartera local.
6. En el otro dispositivo iniciar sesión y descargar. Antes de editar descargar; al terminar subir. La sincronización es manual, no automática.
7. Si hay cambios concurrentes, la subida se rechaza. Exportar el respaldo local antes de descargar y conciliar; no existe combinación automática.

La sesión vive en memoria; al recargar hay que iniciar sesión otra vez. La copia local no se elimina al cerrar sesión. No usar un perfil compartido si no se desea que otros vean la cartera. Las políticas RLS restringen cada cartera al usuario autenticado; funciones con `security invoker`. Probar aislamiento con dos usuarios antes de poner datos reales. No se ha probado todavía autenticación, permisos ni concurrencia contra un servidor real. Los respaldos siguen siendo necesarios.
Documentación: https://supabase.com/docs/guides/database/postgres/row-level-security y https://supabase.com/docs/guides/getting-started/api-keys

## Brokers y gastos
En instalaciones nuevas se incluyen IEB+, IOL, Cocos Capital, Eco Valores y Binance. Las instalaciones con datos previos conservan sus brokers; se pueden agregar los faltantes. Binance Spot permite registrar criptomonedas con cotización ARS, USD, USDT o USDC y comisiones en moneda cotizada, activo comprado/vendido o BNB. No admite pares cripto/cripto con BTC/ETH como moneda cotizada ni P2P automático.
Configurar reglas por broker e instrumento: comisión porcentual, derechos porcentuales, IVA sobre cada componente y gasto fijo total en moneda operada. Los valores se deben confirmar según plan y boleto. Sin regla confirmada, cargar obligatoriamente el gasto real (incluso cero). No se cargan tarifas del video como si fueran universales.
Gastos = bruto × [comisión × (1 + IVA comisión / 100) + derechos × (1 + IVA derechos / 100)] / 100 + fijo.
El gasto real ingresado reemplaza el cálculo. Cada operación conserva el gasto y la regla aplicada; editar la regla no cambia operaciones anteriores. Las reglas no discriminan moneda, compra/venta ni fecha: usar gasto real cuando difieran. Membresías, mínimos, comisiones anualizadas, promociones e intradía no se calculan automáticamente ni se incluyen en el resultado global.

## Contabilidad
FIFO por ticker y broker. Ventas parciales y múltiples lotes. Misma fecha: orden de ingreso. USD histórico: cada flujo usa su CCL de la fecha. ARS histórico: compra/venta en USD se convierte al CCL de la fecha. Resultado realizado = venta neta − costo asignado. Resultado abierto = valor actual − costo restante. Rentabilidad nominal sobre costo; no es TIR, anualizada ni ajustada por inflación.
Precios y CCL se cargan manualmente. USD corresponde a la moneda de negociación; para USDT/USDC se ingresa su precio en USD por fecha sin asumir paridad. Para bonos, ON y letras elegir cotización por 1 o 100 nominales según corresponda. Mantener ticker y base coherentes. No une automáticamente especies D/C.
No incluye dividendos, cupones, amortizaciones, canjes, splits, transferencias entre brokers o rescates al vencimiento. Hasta incorporarlos, el rendimiento de renta fija solo refleja compras/ventas y valoración, no retorno total.

## Respaldo
Exportar JSON periódicamente. Guardado local por dominio y navegador; borrarlo elimina la copia local. Importar reemplaza datos tras validarlos. No incorpora configuración de conexión ni credenciales al respaldo. La v0.3 admite respaldos de la v0.1; operaciones anteriores se muestran sin clasificar cuando corresponda.

## Inicio de cartera y Spot (v0.3)
“Empezar de cero” abre la carga de la primera operación; no elimina registros existentes. “Cargar tenencias actuales” y “Tenencia inicial” permiten agregar posiciones manualmente, una por vez. No se implementó todavía importación masiva CSV/Excel; la restauración JSON es independiente.
Para costos conocidos, ingresar lotes históricos con cantidad, precio unitario incluyendo gastos y CCL de esa fecha. Para costos desconocidos, elegir Referencia y usar fecha/precio/CCL de inicio: la app etiqueta los resultados como medidos desde referencia. No es una ganancia histórica reconstruida. En la tenencia inicial no se carga comisión adicional.
Comprar cripto con USDT/USDC consume el saldo de la moneda cotizada y agrega el activo recibido. Vender hace lo inverso. Cargar antes los saldos iniciales correspondientes; se rechazan saldos insuficientes. Compras/ventas contra ARS/USD representan flujos externos: no hay cuenta de caja fiat.
Cantidad Spot significa cantidad bruta negociada. Comisión en activo: al comprar resta unidades recibidas; al vender suma unidades entregadas. Comisión en moneda cotizada: aumenta gasto de compra o reduce cobro de venta. Comisión BNB: descuenta BNB, necesita precio USD de BNB de la fecha y refleja su disposición a valor de mercado; ese valor integra los gastos de la operación principal. Una operación puede generar varias filas FIFO, incluyendo disposición de USDT/USDC o BNB, sin duplicar el saldo.
Planes: IEB+ Investor, IOL Gold, Cocos Común, Eco sin asesor y Binance Spot. El botón de referencia completa tarifas orientativas editables según las fuentes de COMISIONES.md. Los campos desconocidos permanecen vacíos. Guardar activa la regla. Eco toma como referencia sin Club ni intradía; confirmar beneficio. La membresía IEB+ no está incluida en resultados y sigue pendiente su registro como gasto mensual.
La sincronización continúa pendiente de probar contra un proyecto real. No hay QA visual de esta versión. Pruebas unitarias adicionales cubren compra/venta Spot, comisiones en tres monedas, costos iniciales y stablecoin fuera de paridad.
