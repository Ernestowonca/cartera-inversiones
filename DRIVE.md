# Configurar Google Drive privado
La app usa un cliente OAuth propio y el permiso limitado `drive.file`. La conexión de ChatGPT a Google Drive no autoriza automáticamente a esta aplicación. No necesita Supabase, contraseña de Google en el código, API key ni client secret.

## Configuración única
1. Abrir https://console.cloud.google.com/ y crear o elegir un proyecto propio.
2. En APIs y servicios → Biblioteca, habilitar Google Drive API.
3. En Google Auth Platform configurar nombre de app, email de soporte y audiencia. Para uso personal en Testing, agregar tu propia cuenta en Test users.
4. En Clientes / Credenciales crear un ID OAuth de tipo Aplicación web.
5. Agregar a Orígenes JavaScript autorizados el origen del sitio, sin ruta: `https://ernestowonca.github.io`. Si la dirección real utiliza otro origen, usar ese. No agregar `/cartera-inversiones/` al origen.
6. Copiar el ID público terminado en `.apps.googleusercontent.com` (NO el secreto). En la app: Mis archivos → Configuración inicial de Google → pegar ID → Guardar configuración.
7. En ambos dispositivos usar el mismo ID y cuenta Google. Conectar Google y autorizar el acceso limitado.
8. Primera vez: Crear primera versión. En el segundo dispositivo: Actualizar lista → elegir la última versión → Abrir desde Drive.

La app funciona por HTTPS. El flujo de Google no está disponible al abrir index.html como archivo local. El cliente puede configurarse en cada navegador; el ID no es una contraseña. Si me compartís ese ID público puedo dejarlo precargado en la interfaz.

## Guardado
Guardar en Drive crea un JSON privado en Mi unidad sin modificar permisos. Se mantienen versiones con fecha en el nombre. Se listan las 100 más recientes. Opcionalmente, activar guardado automático después de abrir/crear una versión; crea una versión tras los cambios locales, con una espera de dos segundos.
No hay sincronización en segundo plano con la pestaña cerrada. Las credenciales temporales están solo en memoria; al expirar hay que volver a conectar. Los datos locales no se eliminan al desconectar.
Antes de guardar se verifica que no haya aparecido otra versión. Dos escrituras exactamente simultáneas pueden producir dos archivos: ambos se conservan, no se fusionan automáticamente. Elegir la versión correcta y conciliar operaciones desde un respaldo si fuera necesario. No se garantiza un único historial lineal ni bloqueo transaccional.
Ante un error de red, revisar la lista antes de reintentar: el archivo podría haberse guardado aunque no llegara la respuesta. No se borra ni se publica ningún archivo por código. El usuario puede compartir o borrar archivos manualmente desde Drive; eso queda fuera del control de la app.

## Disco
Descargar respaldo JSON funciona sin configurar Google. Abrir archivo carga el JSON tras validarlo y confirmar. Elegir archivo de destino usa File System Access cuando existe; Guardar en archivo actualiza ese archivo autorizado. En Firefox se descarga una nueva copia. El permiso de archivo no se conserva al recargar. Guardado en disco manual.

## Estado de verificación
Probados cálculos y casos de Drive con respuestas simuladas (conflictos, creación de versiones, sesión expirada). Falta probar OAuth, transferencia real y comportamiento visual en tu navegador una vez configurado el cliente. No se creó todavía un archivo real en tu Drive desde esta app.

Referencias oficiales:
- https://developers.google.com/identity/oauth2/web/guides/use-token-model
- https://developers.google.com/workspace/drive/api/guides/api-specific-auth
- https://developers.google.com/workspace/drive/api/guides/manage-uploads
