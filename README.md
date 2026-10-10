# Cartera · v0.4
Registro personal de acciones, CEDEARs, bonos, ON, letras y criptomonedas Spot. Referencia de conversión: dólar CCL. Sin opciones ni futuros.

## Estado
Código preparado para GitHub Pages. No desplegado. Integración Drive implementada, pendiente de configurar el cliente OAuth y probar con una cuenta real. Cálculos verificados con `node test.cjs`; sintaxis JS comprobada. QA visual pendiente por limitaciones del entorno.

## GitHub Pages
Subir los archivos de esta carpeta a la raíz de un repositorio. En Settings → Pages elegir Deploy from a branch, main, /(root). Abrir la URL informada por GitHub. No publicar respaldos ni credenciales privadas en el repositorio.
Guía oficial: https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site

## Archivos y sincronización (v0.4)
La interfaz usa archivos JSON locales y Google Drive. Ver [DRIVE.md](DRIVE.md) para configurar el cliente OAuth web, el acceso privado y las versiones. Ya no se utiliza Supabase en la app; supabase.sql se conserva solo como archivo histórico sin ejecutar.
La descarga local funciona inmediatamente. Drive requiere un ID OAuth y autorización del usuario, pendientes de configurar. Cada guardado crea una versión nueva. Hay guardado automático opcional mientras la pestaña está abierta; no fusión automática entre dispositivos. No se realizaron pruebas con credenciales reales.

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
Exportar JSON periódicamente. Guardado local por dominio y navegador; borrarlo elimina la copia local. Importar reemplaza datos tras validarlos. No incorpora configuración de conexión ni credenciales al respaldo. La v0.4 admite respaldos de la v0.1; operaciones anteriores se muestran sin clasificar cuando corresponda.

## Inicio de cartera y Spot (v0.4)
“Empezar de cero” abre la carga de la primera operación; no elimina registros existentes. “Cargar tenencias actuales” y “Tenencia inicial” permiten agregar posiciones manualmente, una por vez. No se implementó todavía importación masiva CSV/Excel; la restauración JSON es independiente.
Para costos conocidos, ingresar lotes históricos con cantidad, precio unitario incluyendo gastos y CCL de esa fecha. Para costos desconocidos, elegir Referencia y usar fecha/precio/CCL de inicio: la app etiqueta los resultados como medidos desde referencia. No es una ganancia histórica reconstruida. En la tenencia inicial no se carga comisión adicional.
Comprar cripto con USDT/USDC consume el saldo de la moneda cotizada y agrega el activo recibido. Vender hace lo inverso. Cargar antes los saldos iniciales correspondientes; se rechazan saldos insuficientes. Compras/ventas contra ARS/USD representan flujos externos: no hay cuenta de caja fiat.
Cantidad Spot significa cantidad bruta negociada. Comisión en activo: al comprar resta unidades recibidas; al vender suma unidades entregadas. Comisión en moneda cotizada: aumenta gasto de compra o reduce cobro de venta. Comisión BNB: descuenta BNB, necesita precio USD de BNB de la fecha y refleja su disposición a valor de mercado; ese valor integra los gastos de la operación principal. Una operación puede generar varias filas FIFO, incluyendo disposición de USDT/USDC o BNB, sin duplicar el saldo.
Planes: IEB+ Investor, IOL Gold, Cocos Común, Eco sin asesor y Binance Spot. El botón de referencia completa tarifas orientativas editables según las fuentes de COMISIONES.md. Los campos desconocidos permanecen vacíos. Guardar activa la regla. Eco toma como referencia sin Club ni intradía; confirmar beneficio. La membresía IEB+ no está incluida en resultados y sigue pendiente su registro como gasto mensual.
La integración Drive continúa pendiente de probar con una cuenta real. No hay QA visual de esta versión. Pruebas unitarias adicionales cubren compra/venta Spot, comisiones en tres monedas, costos iniciales y stablecoin fuera de paridad.
