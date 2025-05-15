// =============================================================================
// backend/server.js
// Archivo principal del servidor backend
// =============================================================================

// --- Importación de Librerías ---
import express from 'express';       // Framework web Express
import cors from 'cors';             // Middleware para manejar CORS
import sqlite3 from 'sqlite3';       // Librería para SQLite
const { verbose } = sqlite3;
const Database = verbose().Database;
// --- Fin de importación de librerías ---


// --- Configuración Inicial de Express ---
const app = express();
const PORT = process.env.PORT || 3000; // Puerto en el que el servidor escuchara
// ---Fin de la configuracion inicial express ---


// --- Configuración de la Base de Datos SQLite ---
const DB_PATH = './mydatabase.db';  // Ruta al archibo de la base de datos. Se creara si no existe

// Conectar o crear la base de datos
const db = new Database(DB_PATH, (err) => {
  if (err){
    console.error('Error conectando a la base de datos:', err.message);
    // Considerar process.exit(1) en producción para errores críticos de DB
  } else {
    console.log('Conectado a la base de datos SQLite en:', DB_PATH);
    // llamar a la funcion para crear tablas si no existen y poblar (opcional)
    createTables(db);
  }
});

// Nota: Dejamos la función createTables AQUÍ (después de crear 'db') porque
// necesita la variable 'db' para operar, pero puede ser definida antes de llamarla.
// El código de la función createTables es el mismo que el que tenías actualizado
// con el poblamiento, ya que esa parte parecía correcta en estructura.
// Solo asegúrate de que la ortografía de las columnas SQL (como is_available) sea la correcta.

// --- Función para crear tablas si no existen y poblar (ACTUALIZADA con poblamiento) ---
function createTables(database) {
  database.serialize(() => {
    database.run("PRAGMA foreign_keys = ON;");

    // 1. Tabla users
    database.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        email TEXT UNIQUE,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL CHECK (role IN ('buyer', 'seller', 'driver')),
        phone_number TEXT NOT NULL, -- Cambiado a TEXT para flexibilidad
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `, function(err) {
      if (err) { console.error('Error creando tabla users:', err.message); }
      else {
        console.log('Tabla users verificada/creada.');
        database.get("SELECT COUNT(*) AS count FROM users", (err, row) => {
          if (err) { console.error("Error contando usuarios:", err.message); return; }
          if (row.count === 0) {
            console.log("Tabla users vacía, insertando datos de prueba...");
            database.run("INSERT INTO users (username, email, password_hash, role, phone_number) VALUES (?, ?, ?, ?, ?)",
              ['seller_user', 'seller@example.com', 'pass_seller', 'seller', '111222333']);
            database.run("INSERT INTO users (username, email, password_hash, role, phone_number) VALUES (?, ?, ?, ?, ?)",
              ['buyer_user', 'buyer@example.com', 'pass_buyer', 'buyer', '444555666']);
            database.run("INSERT INTO users (username, email, password_hash, role, phone_number) VALUES (?, ?, ?, ?, ?)",
              ['driver_user', 'driver@example.com', 'pass_driver', 'driver', '777888999']);
            console.log("Usuarios por defecto (vendedor/comprador/driver) insertados.");
          }
        });
      }
    });

    // 2. Tabla addresses
    database.run(`
      CREATE TABLE IF NOT EXISTS addresses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        address_line1 TEXT NOT NULL,
        address_line2 TEXT,
        city TEXT NOT NULL,
        state_province TEXT NOT NULL,
        postal_code TEXT,
        is_default INTEGER DEFAULT 0 CHECK (is_default IN (0, 1)),
        latitude REAL,
        longitude REAL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `, function(err) {
      if (err) { console.error('Error creando tabla addresses:', err.message); }
      else {
        console.log('Tabla addresses verificada/creada.');
        database.get("SELECT COUNT(*) AS count FROM addresses", (err, row) => {
          if (err) { console.error("Error contando direcciones:", err.message); return; }
          if (row.count === 0) {
            console.log("Tabla addresses vacía, insertando datos de prueba...");
            database.get("SELECT id FROM users WHERE username = 'buyer_user'", (err, buyerRow) => {
              if (err || !buyerRow) { console.warn("No se encontró buyer_user para insertar direcciones de prueba:", err ? err.message : "User not found"); return; }
              database.run("INSERT INTO addresses (user_id, address_line1, address_line2, city, state_province, postal_code, is_default) VALUES (?, ?, ?, ?, ?, ?, ?)",
                [buyerRow.id, 'Calle Falsa 123', 'Apto 4B', 'Bogotá', 'Cundinamarca', '110111', 1],
                function(err) {
                  if (err) console.error("Error insertando direccion 1:", err.message);
                  else console.log(`Dirección 1 insertada con ID: ${this.lastID} para user_id ${buyerRow.id}`);
                });
              database.run("INSERT INTO addresses (user_id, address_line1, address_line2, city, state_province, postal_code, is_default) VALUES (?, ?, ?, ?, ?, ?, ?)",
                [buyerRow.id, 'Avenida Siempreviva 742', null, 'Bogotá', 'Cundinamarca', '110112', 0],
                function(err) {
                  if (err) console.error("Error insertando direccion 2:", err.message);
                  else console.log(`Dirección 2 insertada con ID: ${this.lastID} para user_id ${buyerRow.id}`);
                });
            });
          }
        });
      }
    });

    // 3. Tabla products
    database.run(`
      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        price REAL NOT NULL,
        stock INTEGER NOT NULL,
        category TEXT,
        is_available INTEGER NOT NULL DEFAULT 1 CHECK (is_available IN (0, 1)), -- Corregido is_avaible a is_available
        seller_id INTEGER NOT NULL,
        image_url TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `, function(err) {
      if (err) { console.error('Error creando tabla products:', err.message); }
      else {
        console.log('Tabla products verificada/creada.');
        database.get("SELECT COUNT(*) AS count FROM products", (err, row) => {
          if (err) { console.error("Error contando productos:", err.message); return; }
          if (row.count === 0) {
            console.log("Tabla products vacía, insertando datos de prueba...");
            database.get("SELECT id FROM users WHERE username = 'seller_user'", (err, sellerRow) => {
              if (err || !sellerRow) { console.warn("No se encontró seller_user para insertar productos de prueba:", err ? err.message : "User not found"); return; }
              database.run("INSERT INTO products (name, description, price, stock, category, seller_id, image_url, is_available) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                ['Hamburguesa Clásica', 'Deliciosa hamburguesa con queso y lechuga', 15000, 50, 'Comida', sellerRow.id, 'http://localhost:3000/assets/images/burger.jpg', 1],
                function(err) {
                  if (err) { console.error('Error insertando producto 1:', err.message); }
                  else { console.log('Producto 1 insertado con ID:', this.lastID); }
                });
              database.run("INSERT INTO products (name, description, price, stock, category, seller_id, image_url, is_available) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                ['Pizza Pepperoni Grande', 'Pizza con abundante pepperoni y queso', 35000, 30, 'Comida', sellerRow.id, 'http://localhost:3000/assets/images/pizza.jpg', 1],
                function(err) {
                  if (err) { console.error('Error insertando producto 2:', err.message); }
                  else { console.log('Producto 2 insertado con ID:', this.lastID); }
                });
              database.run("INSERT INTO products (name, description, price, stock, category, seller_id, image_url, is_available) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                ['Refresco Cola 2L', 'Botella de refresco de cola de 2 litros', 5000, 100, 'Bebidas', sellerRow.id, 'http://localhost:3000/assets/images/soda.jpg', 1],
                function(err) {
                  if (err) { console.error('Error insertando producto 3:', err.message); }
                  else { console.log('Producto 3 insertado con ID:', this.lastID); }
                });
              database.run("INSERT INTO products (name, description, price, stock, category, seller_id, image_url, is_available) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                ['Producto Agotado', 'Este producto no tiene stock', 10000, 0, 'Varios', sellerRow.id, 'http://localhost:3000/assets/images/out_of_stock.jpg', 1],
                function(err) {
                  if (err) { console.error('Error insertando producto 4:', err.message); }
                  else { console.log('Producto 4 insertado con ID:', this.lastID); }
                });
              database.run("INSERT INTO products (name, description, price, stock, category, seller_id, image_url, is_available) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                ['Producto Inactivo', 'Este producto no está disponible temporalmente', 20000, 10, 'Varios', sellerRow.id, 'http://localhost:3000/assets/images/inactive.jpg', 0],
                function(err) {
                  if (err) { console.error('Error insertando producto 5:', err.message); }
                  else { console.log('Producto 5 insertado con ID:', this.lastID); }
                });
              console.log("Productos de prueba insertados.");
            });
          }
        });
      }
    });

    // 4. Tabla orders (Solo definición)
    database.run(`
      CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
         user_id INTEGER NOT NULL,
         delivery_address_id INTEGER NOT NULL,
         order_date TEXT DEFAULT CURRENT_TIMESTAMP,
         payment_status TEXT NOT NULL DEFAULT 'sin pagar' CHECK (payment_status IN ('sin pagar', 'pagado', 'cancelado')),
         notes TEXT,
         status TEXT DEFAULT 'pendiente' CHECK (status IN ('pendiente', 'en camino', 'entregado', 'cancelado')),
         total_amount REAL NOT NULL,
         updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
         FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
         FOREIGN KEY (delivery_address_id) REFERENCES addresses(id) -- Mantener sin ON DELETE CASCADE a menos que se requiera
       );
     `, (err) => {
        if (err) { console.error('Error creando tabla orders:', err.message); }
        else { console.log('Tabla orders verificada/creada.'); }
      });

      // 5. Tabla order_items (Solo definición)
      database.run(`
        CREATE TABLE IF NOT EXISTS order_items (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          order_id INTEGER NOT NULL,
          product_id INTEGER NOT NULL,
          quantity INTEGER NOT NULL,
          price_at_purchase REAL NOT NULL,
          FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
          FOREIGN KEY (product_id) REFERENCES products(id) -- Mantener sin ON DELETE CASCADE
        );
      `, (err) => {
         if (err) { console.error('Error creando tabla order_items:', err.message); }
         else { console.log('Tabla order_items verificada/creada.'); }
       });


       //6. Tabla cart_items (Solo definicion)
       database.run(`CREATE TABLE IF NOT EXISTS cart_items(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        quantity INTEGER NOT NULL, -- cantidad de productos en el carrito (debe ser al menos  1 )
        PRIMARY KEY (user_id, product_id) -- clave primaria compuesta por user_id y product_id
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id) -- Mantener sin ON DELETE CASCADE
        )`, (err) => {
          if (err) {console.error('Error creando tabla cart_items:', err.message)}
          else {console.log('Tabla cart_items verificada/creada')}
        })
       // 7. Tabla deliveries (Solo definición)
       database.run(`
         CREATE TABLE IF NOT EXISTS deliveries (
           id INTEGER PRIMARY KEY AUTOINCREMENT,
           order_id INTEGER NOT NULL UNIQUE,
           driver_id INTEGER,
           status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'assigned', 'picked_up', 'in_transit', 'delivered', 'failed')),
           pickup_time TEXT,
           delivery_time TEXT,
           delivery_notes TEXT,
           created_at TEXT DEFAULT CURRENT_TIMESTAMP,
           updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
           FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
           FOREIGN KEY (driver_id) REFERENCES users(id) ON DELETE SET NULL
         );
       `, (err) => {
          if (err) { console.error('Error creando tabla deliveries:', err.message); }
          else { console.log('Tabla deliveries verificada/creada.'); }
        });
      }); // Fin de db.serialize()
    } // Fin de la función createTables

    // Nota: Las FOREIGN KEYS ON DELETE CASCADE/SET NULL aseguran la consistencia de los datos.

//---- Middleware de express---
app.use(cors());
// permite que express lea el cuerpo de las solicitudes en formato JSON
app.use(express.json());
//--- fin de middleware de express---


//--- definicion de rutas de la API---

//---Ruta de ejemplo basica a la raiz
app.get('/', (req, res) => {
    res.send('Backend del prototipo funcionando y conectado a la base de datos'); // Corregido mensaje y ortografía
});

// Ruta para obtener todos los productos
// Corregido: Quitada la duplicidad. Corregida ortografía SQL 'is_available'.
app.get('/api/products', (req, res) => {
  // Consulta SQL para seleccionar productos disponibles y con stock > 0
  const sql = 'SELECT * FROM products WHERE is_available = 1 AND stock > 0';
  const params = [];

  db.all(sql, params, (err, rows) => {
    if (err){
      res.status(500).json({error: err.message});
      return;
    }
    // Si no hay errores, enviar los resultados (un array de productos)
    res.status(200).json(rows);
  });
});

// Ruta para obtener un producto por ID
// La parte ':id' en la URL es un parametro capturado por Express
app.get('/api/products/:id', (req, res) => {
  // Obtener el id del producto desde el parametro de la URL
  // Corregido: Usar 'productId' consistentemente
  const productId = req.params.id;

  // Validar que el id sea un numero
  if (isNaN(productId)){
    res.status(400).json({error: 'El ID del producto debe ser un número válido'}); // Corregido mensaje
    return;
  }

  //Sentencia SQL para obtener el producto por su ID
  // Corregido: Ortografía SQL 'is_available'. Mantener condición de stock/disponible o quitar según se necesite en detalle.
  const sql = 'SELECT * FROM products WHERE id = ? AND is_available = 1 AND stock > 0';
  const params = [productId]; // Pasar el ID del producto como parametro

  // Ejecutar la consulta para obtener UNA fila
  db.get(sql, params, (err, row) => {
    if (err){
      res.status(500).json({error: err.message});
      return;
    }
    if (!row) {
      // Si no se encuentra el producto, devolver un error 404
      res.status(404).json({error: 'Producto no encontrado'}); // Corregido error key a 'error' o 'message'
      return;
    }
    // Si se encuentra el producto, responder con estado 200 y el objeto del producto
    res.status(200).json(row);
  });
});

// Ruta para el registro de nuevos usuarios 
app.post('/api/register', (req, res) => {
  const { username, email, password, role, phone_number } = req.body;
  //Validacion de que todos los campos requeridos esten presentes
  if (!username || !email || !password || !role || !phone_number){
    res.status(400).json({error: 'Todos los campos son requeridos'});
    return;
  }
  //Validacion de que el rol sea valido
  if (!['buyer', 'seller', 'driver'].includes(role)){
    res.status(400).json({error: 'Rol invalido'});
    return;
  }
  // Insertar el nuevo usuario en la base de datos
  const sql = `INSERT INTO users (username, email, password_hash, role, phone_number)
    VALUES (?, ?, ?, ?, ?)`;
  const params = [username, email, password, role, phone_number]; // Usamos password para el prototipo pero es (INSEGURO)

  // Ejecutar la insercion
  db.run(sql, params, function(err){ // Usamos function() para acceder a this.lastID
    if (err){
      // Manejar posibles errores, como nombres de ususarios/emails duplicados (SQLite Unique Constraints)
      if (err.message.includes('UNIQUE constraint failed')) {
        res.status(409).json({error: 'El nombre de usuario o email ya esta en uso'}); //409 es codigo de error de conflicto
      } else{
        res.status(500).json({error: err.message});
      }
      return;
    } // si no hay errores, responder con estado 201 y el ID del nuevo usuario
    res.status(201).json({message: 'Usuario registrado exitosamente', userId: this.lastID}); // 201 es codigo de estado de creado
  });
});
//-Registro de usuarios Login              
app.post('/api/login', (req, res) => {
  //Obtener credenciales del cuerpo de la solicitud
  const {username_or_email, password} = req.body; // Podria recibir username o email


  //Validacion de que los  campos requeridos estan presentes
  if (!username_or_email || !password){
    res.status(400).json({error: 'Faltan credenciales (usuario/email y contraseña'});
    return;
  }

  //Sentencia SQL para obtener el usuario por username o email
  //Seleccionamos el id, username,role y la contraseña(insegura)
  const sql = `SELECT id,username,role,password FROM users WHERE username = ? OR email = ?`;
  const params = [username_or_email, username_or_email]; //Usamos el mismo valor para buscar en ambos campos

  //Ejecutar la consulta para obtener una fila (el ususario)
  db.get(sql, params, (err, userRow) => { // Usamos db.get por que esperamos 0 o 1 resultado
    if (err){
      res.status(500).json({error: err.message});
      return;
    }
    if (!userRow){
      //Si no se encuentra el usuario, responder con error 401 (no autorizado)
      res.status(401).json({error: 'credenciales invalidas'}); //401 es codigo de error de no autorizado
      return;
    }
    //Verificar la contraseña (INSEGURA PARA PROTOTIPO)
    // En una app real, se deberia usar bcrypt.compare() para hashear y comparar las contraseñas
    if (userRow.password_hash !== password){
      // comparacion simple
      // si la contraseña coincide, el login es exitoso
      // Responder con el ID y Rol del usuario para que el frontend lo guarde ( simulando el login)
      res.status(200).json({
        message: 'login exitoso',
        userId: userRow.id,
        username: userRow.username,
        role: userRow.role,
      });
    } else{
      // Si la contraseña no coincide responder con error 401 
      res.status(401).json({error: 'credenciales invalidas'}); //401 unauthorized (mismo mensaje para no dar pistas)
      return;
    }
  });
});

//--- Rutas de gestion de productos (CRUD) ---

// Ruta para obtener todos los productos disponibles


//- Gestion de productos (Crear, leer, actualizar, eliminar) -- Ya empezamos con leer         
//- Carrito (añadir, eliminar, actualizar productos
   // Rutas para la gestion de el carrito de compras
   //Ruta para agregar o actualizar un producto al carrito
   // espera en el body el {user_id..., product_id..., y quantity...}
   app.post('/api/cart', (req, res) => {
    const {user_id, product_id, quantity} = req.body;

    //Validaciones basicas
    if (!user_id || !product_id || !quantity){
      res.status(400).json({error: 'Faltan datos requeridos en el body (user_id, product_id, quantity.'});
      return;
    }
    if (isNaN(user_id) || isNaN(productId) || isNaN(quantity) || quantity <= 0){
      res.status(400).json({error: 'Datos invalidos en el body (user_id, product_id, quantity deben ser numeros positivos, quantity > 0.)'});
      return;
    }
    // Sentencia SQL : INSERT OR REPLACE INTO inserta un nuevo registro o si ya existe un registro con la misma clave primaria, actualiza el registro
    // con la misma clave primaria (user_id, product_id), lo reemplaza completamente.
    // Esto maneja tanto la adicion inicial como la actializacion de cantidad..
    const sql = `
    INSERT OR REPLACE INTO cart_items(user_id, product_id, quantity)
    values (?, ?, ?)
    `;
    const params = [userId, productId, quantity];
    //Ejecutar la sentencia SQL
    db.run(sql, params, function(err){
      if (err){
        console.error('Error al agregar/actualizar el carrito:', err.message);
        res.status(500).json({error: err.message});
        return;
      }
      // this.changes indica cuantas filas fueron modificadas (1 en este caso)
      res.status(200).json({message:'Item de carrito añadido/actualizado exitosamente', changes: this.changes});
    });
   });
// Ruta para ver el contenido del carrito de un usuario
// Espera userId como query parameter: /api/cart?userId=...
//Opcional: recibir usrId en los headers o body si la peticion fuera POST/PUT/DELETE,
//pero GET con query parameter es mas simple para este caso

//- Pedidos ( crear, ver historial, detalles de un pedido)
//- Inventarui del vendedor ( listar, añadir, editar, eliminar productos)
//- pedidos del comprador (ver historial, detalles de un pedido)
//-Gestion de usuarios (registro, login, perfil, etc) -- Empezaremos pronto
//-Manejo de pagos (simulado, integrar pasarela de pagos)
// ... usando db.all(), db.get(), db.run() para interactuar con la base de datos


// La ruta duplicada '/api/products' fue eliminada


// --- Fin Definicion de las rutas de la API---


// ---Inicio del servidor---
// El servidor solo empieza a escuchar solicitudes DESPUES de intentar conectar a la base de datos
// Esto asegura que la Base de datos este lista para recibir solicitudes ( o que la conexion se haya roto o se reporte un error)
// antes de que la app este disponible para recibir solicitudes.
app.listen(PORT, () => {
  // Corregido: Usar comillas invertidas (backticks) para interpolar ${PORT}
  console.log(`Servidor backend corriendo en http://localhost:${PORT}`);
});

//--- Fin del servidor---
//ahora vamos a empezar a revisar las bases de datos y como vamos a intehrar la creacion de las bases de
// datos que se necesitan para la aplicacion. y como vamos a integrar las rutas que se necesitan para la aplicacion.
//Script para crear la base de datos y las tablas: Basandote en el archivo server.js donde se palica la funcion de
// createTables(db) para crear las tablas en la base de datos. crea el codigo que se necesita para crear todas las 
// tablas y columnas que se necesitan para la aplicacion estas bases de datos y sus relaciones estan expuestas en
// el archivo database_schema.md pero igualemnte te las voy a dar para que puedas crear las tablas y columnas que necesita la aplicacion

