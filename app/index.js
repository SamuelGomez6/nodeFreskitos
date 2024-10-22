const express = require('express');
const dotenv = require('dotenv');
const bcryptjs = require('bcryptjs');
const session = require('express-session');
const mysql = require('mysql');
const path = require('path');
const nodemailer = require('nodemailer');
const Swal = require('sweetalert2');

//Server
const app = express();
app.set("port", 3036);
app.listen(app.get("port"));
console.log("Servidor corriendo en el puerto",app.get("port"));

//Configuracion 
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
//Configuracion de Middleware y express-session
app.use(session({
    secret: 'secret', 
    resave: false, 
    saveUninitialized: true, 
    cookie: { secure: false } 
}));
//Configurando nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'samuelgomezhenao6@gmail.com', 
        pass: 'w i c w v c n x q o k a g n c p', // Contraseña generada para aplicaciones
    },
});
//Middleware para verificar si el usuario está autenticado
function checkAuth(req, res, next) {
    if (req.session.loggedin) {
      next();
    }else{
        res.send(`<script>
            alert('Necesitas estar registrado para acceder a esta página.');
            window.location.href = '/';
          </script>`);
    }
}
//Cierre de Sesion
app.post('/logout', (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).send('Error al cerrar sesión');
      }
      res.clearCookie('connect.sid');
      res.redirect('/');
    });
});

//conectamos en la base de datos
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'nodefreskitos'
});
connection.connect((error)=> {
    if(error){
        console.log('El error de conexion es: '+error);
        return;
    }
    console.log('¡Conectado a la base de datos!');
});

//Registro
app.post('/Registro', async (req, res)=> {
    const nombre = req.body.nombre;
    const apellido = req.body.apellido;
    const usuario = req.body.usuario;
    const correo = req.body.correo;
    const direccion = req.body.direccion;
    const edad = req.body.edad;
    const contraseña = req.body.contraseña;
    let passwordHaash = await bcryptjs.hash(contraseña, 8);

    connection.query('INSERT INTO usuarios SET ?', 
    {nombre:nombre, apellido:apellido, usuario:usuario, correo:correo, direccion:direccion, edad:edad, contraseña:passwordHaash}, 
    (error, results) => {
        if(error) {
            console.log(error);
            res.json({ success: false, message: "Error al registrar" });
        } else {
            req.session.loggedin = true;
            res.json({ success: true, message: "¡Registro exitoso!" });
        }
    });
});

//Autenticacion (Login)
app.post('/Login', async (req, res) => {
    const usuario = req.body.usuario;
    const contraseña = req.body.contraseña;
    let passwordHaash = await bcryptjs.hash(contraseña, 8);

    if (usuario && contraseña) {
        connection.query('SELECT * FROM usuarios WHERE usuario = ?', [usuario], async (error, results) => {
            if (error) {
                console.log(error);
                return res.json({ success: false, message: "Error en la consulta" });
            }
            if (results.length == 0 || !(await bcryptjs.compare(contraseña, results[0].contraseña))) {
                return res.json({ success: false, message: "Usuario o contraseña incorrectos" });
            } else {
                // Guardamos la sesión del usuario
                req.session.loggedin = true;
                req.session.userId = results[0].id;
                req.session.user = {
                    usuario: results[0].usuario,
                    nombre: results[0].nombre,
                    apellido: results[0].apellido,
                    correo: results[0].correo,
                    direccion: results[0].direccion,
                    edad: results[0].edad
                };
                return res.json({ success: true, message: "¡Login correcto!" });
            }
        });
    } else {
        res.json({ success: false, message: "Por favor ingrese todos los campos" });
    }
});

//Obtener Datos del Usuario
app.get("/Perfil", checkAuth, (req, res) => { 
    res.sendFile(path.join(__dirname, 'public', 'perfil.html'));
});
app.get('/get-user-data', checkAuth, (req, res) => {
    if (req.session.loggedin) {
        const user = req.session.user;
        // Enviar los datos como respuesta JSON
        res.json({
            usuario: user.usuario,
            nombre: user.nombre,
            apellido: user.apellido,
            correo: user.correo,
            direccion: user.direccion,
            edad: user.edad
        });
    } else {
        // Si no está logueado, enviar un error
        res.status(401).json({ error: 'Usuario no autenticado' });
    }
});

// Actualizar los Datos del Usuario
app.post('/actualizar-datos', (req, res) => {
    const { nombre, apellido, correo, direccion, edad } = req.body;
    const userId = req.session.userId; // Asumiendo que tienes el ID del usuario en la sesión

    // Verificar si el usuario está autenticado
    if (!userId) {
        return res.status(401).json({ success: false, message: "Usuario no autenticado." });
    }

    // Validar datos (opcional, pero recomendado)
    if (!nombre || !apellido || !correo || !direccion || !edad) {
        return res.status(400).json({ success: false, message: "Todos los campos son requeridos." });
    }

    connection.query('UPDATE usuarios SET nombre = ?, apellido = ?, correo = ?, direccion = ?, edad = ? WHERE id = ?', 
        [nombre, apellido, correo, direccion, edad, userId], (error, results) => {
            if (error) {
                console.log(error);
                return res.status(500).json({ success: false, message: "Error al actualizar los datos." });
            }
            // Verifica si se actualizó al menos una fila
            if (results.affectedRows === 0) {
                return res.status(404).json({ success: false, message: "Usuario no encontrado." });
            }
            res.json({ success: true, message: "Datos actualizados exitosamente." });
        });
});


//Eliminacion de la cuenta de Usuario
app.delete('/eliminar-cuenta', (req, res) => {
    const userId = req.session.userId; // Asegúrate de que tienes el ID del usuario en la sesión

    connection.query('DELETE FROM usuarios WHERE id = ?', [userId], (error, results) => {
        if (error) {
            console.error(error);
            return res.json({ success: false, message: "Error al eliminar la cuenta." });
        }
        req.session.destroy(); // Destruir la sesión del usuario
        res.json({ success: true, message: "Tu cuenta ha sido eliminada exitosamente." });
    });
});

// Ruta para agregar productos al carrito
app.post('/add-to-cart', async (req, res) => {
    const { cart } = req.body;  // Asegúrate de recibir la estructura con el quantity desde el frontend
    const userId = req.session.userId;

    if (!userId) {
        return res.status(401).json({ success: false, message: "Usuario no autenticado." });
    }

    if (!cart || !Array.isArray(cart)) {
        return res.status(400).json({ success: false, message: "Carrito no válido." });
    }

    try {
        for (const product of cart) {
            const { id, quantity = 1, name: nombre_producto, price: precio_producto } = product;

            const results = await new Promise((resolve, reject) => {
                connection.query('SELECT * FROM carrito WHERE user_id = ? AND product_id = ?', [userId, id], (error, results) => {
                    if (error) return reject(error);
                    resolve(results);
                });
            });

            if (results.length > 0) {
                // Actualizar cantidad
                await new Promise((resolve, reject) => {
                    connection.query('UPDATE carrito SET cantidad = cantidad + ? WHERE user_id = ? AND product_id = ?', 
                    [quantity, userId, id], (updateError) => {
                        if (updateError) return reject(updateError);
                        resolve();
                    });
                });
            } else {
                // Insertar nuevo producto
                await new Promise((resolve, reject) => {
                    connection.query('INSERT INTO carrito (user_id, product_id, nombre_producto, precio_producto, cantidad) VALUES (?, ?, ?, ?, ?)', 
                    [userId, id, nombre_producto, precio_producto, quantity], (insertError) => {
                        if (insertError) return reject(insertError);
                        resolve();
                    });
                });
            }
        }

        res.json({ success: true, message: 'Carrito actualizado' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error al actualizar el carrito' });
    }
});


//Ruta para obtener los productos del carrito
app.get('/cart-items', (req, res) => {
    const userId = req.session.userId; // Obtén el ID del usuario autenticado desde la sesión

    if (!userId) {
        return res.status(401).json({ success: false, message: "Usuario no autenticado." });
    }

    // Consulta para obtener los productos del carrito del usuario
    connection.query('SELECT product_id, nombre_producto, precio_producto, cantidad FROM carrito WHERE user_id = ?', [userId], (error, results) => {
        if (error) {
            console.error('Error al recuperar el carrito:', error);
            return res.status(500).json({ success: false, message: 'Error al recuperar el carrito.' });
        }
        res.json({ success: true, cartItems: results });
    });
});

// Ruta para actualizar la cantidad de un producto en el carrito
app.post('/update-cart', (req, res) => {
    const { productId, quantity } = req.body;
    const userId = req.session.userId;

    if (!userId) {
        return res.status(401).json({ success: false, message: "Usuario no autenticado." });
    }

    if (quantity <= 0) {
        return res.status(400).json({ success: false, message: "La cantidad no puede ser menor o igual a 0." });
    }

    connection.query(
        'UPDATE carrito SET cantidad = ? WHERE user_id = ? AND product_id = ?',
        [quantity, userId, productId],
        (error, results) => {
            if (error) {
                console.error('Error al actualizar la cantidad:', error);
                return res.status(500).json({ success: false, message: 'Error al actualizar la cantidad.' });
            }
            res.json({ success: true, message: 'Cantidad actualizada correctamente.', cartItems: results });
        }
    );
});

//Ruta para eliminar productos del carrito
app.delete('/remove-from-cart/:productId', (req, res) => {
    const productId = req.params.productId;
    const userId = req.session.userId;

    if (!userId) {
        return res.status(401).json({ success: false, message: "Usuario no autenticado." });
    }

    const sql = 'DELETE FROM carrito WHERE product_id = ? AND user_id = ?';
    connection.query(sql, [productId, userId], (error, results) => {  // Cambia db por connection
        if (error) {
            console.error('Error al eliminar el producto del carrito:', error);
            return res.status(500).json({ success: false, message: 'Error al eliminar el producto del carrito.' });
        }
        res.json({ success: true, message: 'Producto eliminado del carrito.' });
    });
});

//Funcion para obtener usuario por ID
function obtenerUsuario(usuarioId) {
    return new Promise((resolve, reject) => {
        const query = 'SELECT * FROM usuarios WHERE id = ?'; // Ajusta el nombre de la tabla y columna según tu base de datos
        connection.query(query, [usuarioId], (error, results) => {
            if (error) {
                return reject(error);
            }
            if (results.length > 0) {
                resolve(results[0]); // Devuelve el primer resultado que coincide con el usuario
            } else {
                reject('Usuario no encontrado');
            }
        });
    });
}

//Funcion para obtener carrito 
function obtenerCarrito(userId) {
    return new Promise((resolve, reject) => {
        connection.query('SELECT product_id, nombre_producto, precio_producto, cantidad FROM carrito WHERE user_id = ?', [userId], (error, results) => {
            if (error) {
                return reject(error);
            }
            resolve(results);
        });
    });
}

// Ruta para la página de la factura
app.get('/factura-datos', async (req, res) => {
    try {
        const usuarioId = req.session.userId;
        const usuario = await obtenerUsuario(usuarioId);
        const carrito = await obtenerCarrito(usuarioId);

        // Calcular totales
        const subtotal = carrito.reduce((sum, product) => sum + (product.precio_producto * product.cantidad), 0);
        const impuestos = subtotal * 0.18; // Ejemplo de un impuesto del 18%
        const total = subtotal + impuestos;

        res.json({
            usuario,
            carrito,
            tienda: {
                nombre: "Minimarket Freskitos",
                direccion: "Av. Siempreviva 123",
                telefono: "+123456789",
                correo: "contacto@freskitos.com"
            },
            resumen: {
                subtotal,
                impuestos,
                total
            }
        });
    } catch (error) {
        console.error('Error al obtener los datos de la factura:', error);
        res.status(500).json({ error: 'Error al obtener los datos de la factura.' });
    }
});


//Configurar Nodemailer
const enviarMail = async (usuario, carrito) => {
    const config = {
        host: 'smtp.gmail.com',
        port: 587,
        auth: {
            user: 'freskistos@gmail.com',
            pass: 'zukj kjfn nxtx gkbt'
        }
    };

    const transport = nodemailer.createTransport(config);

    //Correo para el Usuario 
    const mensajeUsuario = {
        from: 'freskistos@gmail.com',
        to: usuario.correo, // El correo del usuario
        subject: 'Factura de tu compra en Freskitos',
        html: `
            <h1>¡Gracias por tu compra, ${usuario.nombre}!</h1>
            <h3>Datos de tu pedido:</h3>
            <ul>
                ${carrito.map(item => `
                    <li>${item.nombre_producto} - $${item.precio_producto} (Cantidad: ${item.cantidad})</li>
                `).join('')}
            </ul>
            <p>Total: $${carrito.reduce((total, item) => total + item.precio_producto * item.cantidad, 0)}</p>
            <h3>Información de la tienda:</h3>
            <p>Nombre: Minimarket Freskitos</p>
            <p>Dirección: Av. Siempreviva 123</p>
            <p>Teléfono: +123456789</p>
        `
    };

    //Correo para el administrador
    const mensajeAdmin = {
        from: 'freskistos@gmail.com',
        to: 'freskistos@gmail.com',
        subject: 'Nuevo pedido en Freskitos',
        html: `
            <h1>Nuevo pedido realizado por ${usuario.nombre} ${usuario.apellido}</h1>
            <h3>Datos del usuario:</h3>
            <p>Nombre: ${usuario.nombre}</p>
            <p>Apellido: ${usuario.apellido}</p>
            <p>Correo: ${usuario.correo}</p>
            <p>Dirección: ${usuario.direccion}</p>
            <p>Edad: ${usuario.edad}</p>

            <h3>Datos del pedido:</h3>
            <ul>
                ${carrito.map(item => `
                    <li>${item.nombre_producto} - $${item.precio_producto} (Cantidad: ${item.cantidad})</li>
                `).join('')}
            </ul>
            <p>Total del pedido: $${carrito.reduce((total, item) => total + item.precio_producto * item.cantidad, 0)}</p>
        `
    };

    // Enviar el correo al usuario
    await transport.sendMail(mensajeUsuario);
    // Enviar el correo al administrador
    await transport.sendMail(mensajeAdmin);
};

// Nueva ruta para enviar el correo con la factura
app.post('/enviar-correo-factura', async (req, res) => {
    try {
        const usuarioId = req.session.userId;
        
        if (!usuarioId) {
            return res.status(400).json({ error: 'No se encontró el ID del usuario en la sesión.' });
        }

        const usuario = await obtenerUsuario(usuarioId);
        const carrito = await obtenerCarrito(usuarioId);

        if (!usuario || !carrito) {
            return res.status(400).json({ error: 'No se pudieron obtener los datos del usuario o del carrito.' });
        }

        // Enviar el correo
        await enviarMail(usuario, carrito);

        res.status(200).json({ message: 'Correo enviado exitosamente' });
    } catch (error) {
        console.error('Error al enviar el correo:', error);
        res.status(500).json({ error: 'Error al enviar el correo.' });
    }
});


//directorio public y archivos estaticos
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, '../app/assets/css')));
app.use(express.static(path.join(__dirname, '../app/assets/icons')));
app.use(express.static(path.join(__dirname, '../app/assets/img')));

//Rutas
app.get("/", (req, res) => { 
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
app.get("/Login", (req, res) => { 
    res.sendFile(path.join(__dirname, 'public', 'Login.html'));
});
app.get("/Registro", (req, res) => { 
    res.sendFile(path.join(__dirname, 'public', 'Registro.html'));
});
app.get("/Nosotros", (req, res) => { 
    res.sendFile(path.join(__dirname, 'public', 'Nosotros.html'));
});
app.get("/TerminosCondiciones", (req, res) => { 
    res.sendFile(path.join(__dirname, 'public', 'TerminosCondiciones.html'));
});
app.get("/PoliticaPrivacidad", (req, res) => { 
    res.sendFile(path.join(__dirname, 'public', 'PoliticaPrivacidad.html'));
});
app.get("/AyudaPreguntas", (req, res) => { 
    res.sendFile(path.join(__dirname, 'public', 'AyudaPreguntas.html'));
});
app.get("/Contactanos", (req, res) => { 
    res.sendFile(path.join(__dirname, 'public', 'contactanos.html'));
});
app.get("/index", checkAuth, (req, res) => { 
    res.sendFile(path.join(__dirname, 'public', 'index2.html'));
});
app.get("/CarritoCompras", checkAuth,  (req, res) => { 
    res.sendFile(path.join(__dirname, 'public', 'carrito.html'));
});
app.get("/Factura", checkAuth,  (req, res) => { 
    res.sendFile(path.join(__dirname, 'public', 'Factura.html'));
});