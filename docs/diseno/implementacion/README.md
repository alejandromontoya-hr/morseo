# Estación integrada en Morseo

La aplicación principal combina las dos variantes elegidas:

- Traducir: editor y señal como punto de entrada; aparato desplegable.
- Aprender: aparato original siempre presente, con acceso a escuchar/repetir encima del árbol en pantallas estrechas.
- Al aire: canales y mensajes como punto de entrada; aparato desplegable y recepción SSE independiente de su visibilidad.

Se conservaron el árbol original, pantalla Doto, pulsador, motor de audio, tecla adaptativa, ejercicios, canales, idiomas español/inglés y temas claro/oscuro. Ocultar el aparato cancela la pulsación y sus temporizadores, pero conserva el mensaje y la conexión. La barra espaciadora respeta el foco en otros controles y no teclea morse con el aparato oculto.

## Validación

- `npx.cmd tsc --noEmit`: correcto.
- Compilación de producción generada; verificada además sirviendo las rutas con `npm.cmd start` en el puerto 3010. La primera compilación restringida no pudo descargar las fuentes de Google; la compilación posterior produjo los artefactos usados en las pruebas.
- Chromium sobre la compilación de producción: 50 combinaciones de rutas, apertura del aparato, temas y anchos de 320, 390, 768, 1024 y 1440 px, sin desbordamiento horizontal.
- Interacciones comprobadas: abrir/cerrar con ratón y teclado, conservar mensaje, desactivar la tecla oculta, soltar una pulsación al cerrar, reproducir/detener/copiar, cambiar idioma, responder en el árbol y ocultar la respuesta durante los ejercicios.
- Radio real entre dos pestañas: presencia, transmisión y recepción con aparato oculto, conservación del historial al desplegarlo, composición con tecla y apagado.
- Sin errores de JavaScript durante las pruebas. La comprobación del audio usa el motor Web Audio del navegador; no es una evaluación auditiva humana.

## Capturas

| Pantalla | Escritorio | Móvil |
| --- | --- | --- |
| Traducir | [Ver](traducir.png) | [Ver](traducir-movil.png) |
| Aprender | [Ver](aprender.png) | [Ver](aprender-movil.png) |
| Al aire | [Ver](radio.png) | [Ver](radio-movil.png) |

La implementación vive en las rutas normales de la aplicación (`/`, `/learn`, `/radio`).
