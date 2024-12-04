# Freskitos - Tienda Online de Minimarket

Bienvenido al repositorio de **Freskitos**, una tienda online diseñada para realizar pedidos en línea, enfocada en ofrecer productos frescos de un minimarket. Este proyecto ha sido desarrollado utilizando **Node.js**, **HTML**, **CSS**, y una base de datos gestionada con **MySQL** a través de **phpMyAdmin**.

## Características del Proyecto

- **Registro y Login de Usuarios:** Sistema de autenticación segura utilizando `bcryptjs` para el hash de contraseñas y `express-session` para la gestión de sesiones.
- **Gestión de Carrito de Compras:** Añadir, actualizar y eliminar productos del carrito de compras.
- **Actualización de Perfil de Usuario:** Los usuarios pueden editar sus datos personales.
- **Eliminación de Cuenta:** Funcionalidad para eliminar cuentas de usuario.
- **Alertas Dinámicas:** Uso de **SweetAlert2** para mostrar alertas visualmente atractivas.
- **Sistema de Pedidos:** Gestión de pedidos que se almacena en la base de datos.

## Tecnologías Utilizadas

- **Backend:**
  - [Node.js](https://nodejs.org/)
  - [Express](https://expressjs.com/)
  - [express-session](https://www.npmjs.com/package/express-session)
  - [bcryptjs](https://www.npmjs.com/package/bcryptjs)
  - [MySQL](https://www.mysql.com/)
  - [phpMyAdmin](https://www.phpmyadmin.net/)

- **Frontend:**
  - HTML5
  - CSS3
  - JavaScript
  - [Bootstrap](https://getbootstrap.com/)
  - [SweetAlert2](https://sweetalert2.github.io/)

## Instalación

1. **Clona este repositorio:**
   ```bash
   git clone https://github.com/tu-usuario/Minimarket-Freskitos.git
   ```

2. **Navega al directorio del proyecto:**
   ```bash
   cd Minimarket-Freskitos
   ```

3. **Instala las dependencias:**
   ```bash
   npm install
   ```

4. **Configura la base de datos:**
   - Crea una base de datos en MySQL llamada `nodefreskitos`.
   - Importa el archivo `nodefreskitos.sql` en phpMyAdmin para crear las tablas necesarias.

5. **Configura las variables de entorno:**
   Crea un archivo `.env` en la raíz del proyecto con el siguiente contenido:
   ```env
   DB_HOST=localhost
   DB_USER=tu_usuario
   DB_PASSWORD=tu_contraseña
   DB_NAME=nodefreskitos
   PORT=3000
   ```

6. **Inicia el servidor:**
   ```bash
   npm start
   ```

7. **Accede a la aplicación:**
   Abre tu navegador y dirígete a `http://localhost:3000`.

## Estructura del Proyecto

```plaintext
Minimarket-Freskitos/
│
├── public/             # Archivos estáticos (HTML, CSS, JS)
│   ├── index.html
│   ├── perfil.html
│   └── carrito.html
│
├── routes/             # Rutas para la API y manejo de vistas
│   ├── auth.js
│   ├── user.js
│   └── cart.js
│
├── db/                 # Conexión a la base de datos
│   └── connection.js
│
├── views/              # Archivos HTML
│
├── app.js              # Configuración principal del servidor
├── package.json        # Dependencias y configuración del proyecto
└── README.md           # Documentación del proyecto
```

## Funcionalidades Futuras

- Implementación de un sistema de pagos en línea.
- Sistema de gestión de inventario para administradores.
- Notificaciones por correo electrónico para confirmación de pedidos.

## Contribución

1. Haz un fork del proyecto.
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`).
3. Realiza tus cambios y haz commit (`git commit -m 'Añadir nueva funcionalidad'`).
4. Sube tus cambios (`git push origin feature/nueva-funcionalidad`).
5. Abre un Pull Request.

## Licencia

Este proyecto está bajo la Licencia MIT. Puedes ver más detalles en el archivo [LICENSE](LICENSE).

---

¡Gracias por visitar **Freskitos**! Si tienes alguna pregunta o sugerencia, no dudes en abrir un [issue](https://github.com/tu-usuario/Minimarket-Freskitos/issues).
