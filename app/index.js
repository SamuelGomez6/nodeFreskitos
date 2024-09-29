const express = require('express');
const dotenv = require('dotenv');
const bcryptjs = require('bcryptjs');
const session = require('express-session');
const mysql = require('mysql');
const path = require('path');

//Server
const app = express();
app.set("port", 3036);
app.listen(app.get("port"));
console.log("Servidor corriendo en el puerto",app.get("port"));

//Configuracion 
//Seteamos urlencoded para capturar los datos del formulario 
app.use(express.urlencoded({extended:false}));
app.use(express.json());
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
                return res.json({ success: true, message: "¡Login correcto!" });
            }
        });
    } else {
        res.json({ success: false, message: "Por favor ingrese todos los campos" });
    }
});


//directorio public y archivos estaticos
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, '../app/assets/css')));
app.use(express.static(path.join(__dirname, '../app/assets/icons')));
app.use(express.static(path.join(__dirname, '../app/assets/img')));
app.use(session({
    secret: 'secret',
    resave: 'true',
    saveUninitialized:true
}));

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
app.get("/index", (req, res) => { 
    res.sendFile(path.join(__dirname, 'public', 'index2.html'));
});