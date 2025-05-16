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

// Ruta para ver el contenido de el carrito de un usuario
// Espera userId como query parameter: /api/cart?userId=..
//Opcional: recibir usrId en los headers o body si la peticion fuera POST/PUT/DELETE
//pero GET con query parameter es mas simple para este caso
app.get('/api/cart', (req, res) =>{
  // Obtener userId de los query parameters (ej: ?userId=123)
  const userId = req.query.userId;

  //Validacion userId
  if (userId === undefined || isNaN(userId)) {
    res.status(400).json({error: 'userId debe ser un numero valido requerido como query parameter'});
    return;
  }

//Sentencia SQL: JOIN cart_items con products para obtener detalles)
// Selecciona columnas relevantes del item del carrito y del producto
const sql = `
SELECT
    ci.user_id,
    ci.product_id,
    ci.quantity,
    p.name,
    p.price,
    p.image_url,
    p.stock as product_stock -- Renombrar para evitar conflicto con stock del carrito (aunque no tenemos stock en cart_items)
FROM cart_items ci
JOIN products p ON ci.product_id = p.id
WHERE ci.user_id = ?
`;
const params = [userId];

db.all(sql, params, (err, rows) => { // Usamos db.all porque esperamos múltiples filas (ítems del carrito)
if (err) {
    console.error('Error al obtener carrito:', err.message);
    res.status(500).json({ error: err.message });
    return;
}
// Responder con la lista de ítems en el carrito (con detalles del producto)
res.status(200).json(rows); // rows será un array de objetos { user_id, product_id, quantity, name, price, image_url, ... }
});
});
// Ruta para eliminar un producto del carrito de un usuario
// Espera userId en el body: { userId: ... }
// Recibe productId del parámetro de la URL
app.delete('/api/cart/items/:productId', (req, res) => {
  const productId = req.params.productId;
  const { userId } = req.body; // Obtener userId del body para asegurar qué usuario elimina

  // Validaciones básicas
   if (userId === undefined || productId === undefined) {
      res.status(400).json({ error: 'Faltan userId en el body o productId en la URL.' });
      return;
  }
  if (isNaN(userId) || isNaN(productId)) {
       res.status(400).json({ error: 'userId y productId deben ser números.' });
      return;
  }


  // Sentencia SQL para eliminar el ítem específico del carrito del usuario
  const sql = `
      DELETE FROM cart_items
      WHERE user_id = ? AND product_id = ?
  `;
  const params = [userId, productId];

  db.run(sql, params, function(err) { // Usamos function() para acceder a this.changes
      if (err) {
          console.error('Error al eliminar item del carrito:', err.message);
          res.status(500).json({ error: err.message });
          return;
      }
       if (this.changes === 0) {
          // Si this.changes es 0, significa que no se encontró y eliminó ninguna fila
           res.status(404).json({ message: 'Item no encontrado en el carrito del usuario.' });
       } else {
          res.status(200).json({ message: 'Item de carrito eliminado exitosamente', changes: this.changes });
       }
  });
});


// Opcional: Ruta para vaciar todo el carrito de un usuario
// Espera userId en el body: { userId: ... }
app.delete('/api/cart', (req, res) => {
  const { userId } = req.body;

  // Validar userId
  if (userId === undefined || isNaN(userId)) {
      res.status(400).json({ error: 'userId requerido en el body.' });
      return;
  }

  // Sentencia SQL para eliminar todos los ítems del carrito del usuario
  const sql = `
      DELETE FROM cart_items
      WHERE user_id = ?
  `;
  const params = [userId];

  db.run(sql, params, function(err) { // Usamos function() para acceder a this.changes
      if (err) {
          console.error('Error al vaciar carrito:', err.message);
          res.status(500).json({ error: err.message });
          return;
      }
       // this.changes indicará cuántos ítems se eliminaron
      res.status(200).json({ message: 'Carrito vaciado exitosamente', changes: this.changes });
  });
});


// --- Fin Rutas del Carrito ---
//- Pedidos ( crear, ver historial, detalles de un pedido)

// Ruta para que un usuario (comprador) realice un pedido a partir de su carrito
// Espera en el body: { userId: ..., deliveryAddressId: ..., paymentMethod?: ... }
app.post('/api/orders', (req, res) => {
  const { userId, deliveryAddressId } = req.body; // Podrías añadir paymentMethod si lo modelas

  // Validaciones básicas
  if (userId === undefined || deliveryAddressId === undefined) {
      res.status(400).json({ error: 'Faltan campos requeridos (userId, deliveryAddressId).' });
      return;
  }
  if (isNaN(userId) || isNaN(deliveryAddressId)) {
      res.status(400).json({ error: 'userId y deliveryAddressId deben ser números.' });
      return;
  }

  // --- Secuencia de operaciones para realizar el pedido ---
  // NOTA: Para un prototipo simple, ejecutamos las operaciones secuencialmente.
  // En una aplicación real, estas operaciones deberían ejecutarse dentro de una
  // TRANSACCIÓN de base de datos para asegurar que sean atómicas (o se completan todas, o ninguna).
  // SQLite soporta transacciones, pero implementarlas con el API de callbacks de sqlite3
  // puede añadir bastante complejidad de manejo de errores y rollback.

  database.serialize(() => { // Usamos serialize para asegurar el orden
      // 1. Obtener los ítems del carrito del usuario
      const getCartSql = 'SELECT ci.product_id, ci.quantity, p.price FROM cart_items ci JOIN products p ON ci.product_id = p.id WHERE ci.user_id = ?';
      database.all(getCartSql, [userId], (err, cartItems) => {
          if (err) {
              console.error('Error al obtener carrito para pedido:', err.message);
              res.status(500).json({ error: err.message });
              // En una transacción real, harías ROLLBACK aquí
              return;
          }

          if (cartItems.length === 0) {
              res.status(400).json({ message: 'El carrito del usuario está vacío.' });
              // En una transacción real, harías ROLLBACK aquí
              return;
          }

          // Calcular el monto total del pedido
          const totalAmount = cartItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);

          // 2. Crear el registro principal del pedido en la tabla 'orders'
          const createOrderSql = `
              INSERT INTO orders (user_id, delivery_address_id, total_amount, status, payment_status)
              VALUES (?, ?, ?, ?, ?)
          `;
          const createOrderParams = [userId, deliveryAddressId, totalAmount, 'pendiente', 'sin pagar']; // Estado iniciales
          database.run(createOrderSql, createOrderParams, function(err) { // Usamos function() para this.lastID
              if (err) {
                  console.error('Error al crear pedido:', err.message);
                  res.status(500).json({ error: err.message });
                  // En una transacción real, harías ROLLBACK aquí
                  return;
              }

              const orderId = this.lastID; // ID del pedido recién creado

              // 3. Insertar los ítems del pedido en la tabla 'order_items'
              // Esto debe hacerse para cada item del carrito
              let itemsInserted = 0;
              cartItems.forEach(item => {
                  const createOrderItemSql = `
                      INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase)
                      VALUES (?, ?, ?, ?)
                  `;
                  const createOrderItemParams = [orderId, item.product_id, item.quantity, item.price]; // Usar el precio del producto en el momento de la compra

                  database.run(createOrderItemSql, createOrderItemParams, (err) => {
                      if (err) {
                          console.error('Error al crear item de pedido:', err.message);
                          // Esto es problemático en el modelo secuencial. En transacción real, harías ROLLBACK.

                          // Para el prototipo, simplemente logueamos y el pedido estará incompleto.
                          return; // No salimos de la función externa para permitir que los otros ítems se inserten si es posible
                      }
                       itemsInserted++;
                       // Opcional: Reducir stock aquí (si no se hizo en una fase posterior más robusta)
                       // database.run('UPDATE products SET stock = stock - ? WHERE id = ?', [item.quantity, item.product_id], (err) => { /* manejar error */ });

                       // Cuando todos los ítems se hayan intentado insertar (exitoso o con error logueado)
                       if (itemsInserted === cartItems.length) {
                           // 4. Vaciar el carrito del usuario (si todos los ítems fueron procesados, incluso con errores intermedios logueados)
                           const clearCartSql = 'DELETE FROM cart_items WHERE user_id = ?';
                           database.run(clearCartSql, [userId], (err) => {
                               if (err) {
                                  console.error('Error al vaciar carrito después de pedido:', err.message);
                                  // Esto también es problemático en secuencial. En transacción real, harías ROLLBACK.
                                  // Para el prototipo, simplemente logueamos.
                               }
                               // --- Pedido realizado (o intentado) ---
                               // Responder al cliente
                               res.status(201).json({ message: 'Pedido realizado exitosamente', orderId: orderId, totalAmount: totalAmount });
                               // En una transacción real, harías COMMIT aquí si todo salió bien
                           });
                       }
                  });
              });
          });
      });
  });
  // --- Fin Secuencia de operaciones ---
});

// ... siguientes rutas de pedidos ...

// --- Fin Rutas de Pedidos ---

//- Inventarui del vendedor ( listar, añadir, editar, eliminar productos)

// --- Rutas de Gestión de Inventario del Vendedor ---

// Ruta para obtener todos los productos de un vendedor específico

// Recibe sellerId del parámetro de la URL

app.get('/api/sellers/:sellerId/products', (req, res) => {
  const sellerId = req.params.sellerId;

  // Validar sellerId
  if (isNaN(sellerId)) {
      res.status(400).json({ error: 'El ID de vendedor debe ser un número válido.' });
      return;
  }

  // Sentencia SQL para seleccionar todos los productos que pertenecen a este vendedor
  const sql = 'SELECT * FROM products WHERE seller_id = ? ORDER BY created_at DESC'; // Ordenar por fecha de creación
  const params = [sellerId];

  db.all(sql, params, (err, products) => { // db.all porque esperamos múltiples productos
      if (err) {
          console.error('Error al obtener inventario del vendedor:', err.message);
          res.status(500).json({ error: err.message });
          return;
      }
      // Responder con la lista de productos del vendedor (puede estar vacía)
      res.status(200).json(products); // products será un array de objetos producto
  });
});

// ... siguientes rutas de inventario ...

// Ruta para que un vendedor añada un nuevo producto

// Recibe sellerId del parámetro de la URL

// Espera en el body: { name, description, price, stock, category, image_url }
app.post('/api/sellers/:sellerId/products', (req, res) => {
  const sellerId = req.params.sellerId;
  const { name, description, price, stock, category, image_url } = req.body;

  // Validaciones básicas de entrada
  if (!name || price === undefined || stock === undefined || isNaN(sellerId) || isNaN(price) || isNaN(stock) || stock < 0) {
       res.status(400).json({ error: 'Faltan campos requeridos o son inválidos (name, price, stock, sellerId numérico).' });
      return;
  }
   if (sellerId === undefined) { // Doble check aunque esté en URL
       res.status(400).json({ error: 'ID de vendedor no proporcionado en la URL.' });
       return;
   }

  // Sentencia SQL para insertar un nuevo producto. seller_id se obtiene de la URL.
  const sql = `
      INSERT INTO products (name, description, price, stock, category, seller_id, image_url)
      VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  const params = [name, description, price, stock, category, sellerId, image_url];

  db.run(sql, params, function(err) { // Usamos function() para this.lastID
      if (err) {
          console.error('Error al añadir nuevo producto:', err.message);
          res.status(500).json({ error: err.message });
          return;
      }
      // Responder con estado 201 (Creado) y el ID del nuevo producto
      res.status(201).json({ message: 'Producto añadido exitosamente', productId: this.lastID });
  });
});
// Ruta para que un vendedor edite uno de sus productos

// Recibe sellerId y productId de los parámetros de la URL

// Espera en el body los datos a actualizar: { name, description, price, stock, category, image_url, is_available }

app.put('/api/sellers/:sellerId/products/:productId', (req, res) => {
  const sellerId = req.params.sellerId;
  const productId = req.params.productId;
  // Obtener solo los campos que pueden ser actualizados por el vendedor
  const { name, description, price, stock, category, image_url, is_available } = req.body;

  // Validaciones básicas
   if (isNaN(sellerId) || isNaN(productId)) {
       res.status(400).json({ error: 'Los IDs de vendedor y producto deben ser números válidos.' });
       return;
   }
   // Validación mínima de al menos un campo a actualizar o campos clave
    if (!name && price === undefined && stock === undefined && category === undefined && image_url === undefined && is_available === undefined) {
       res.status(400).json({ error: 'Se requiere al menos un campo para actualizar (name, price, stock, category, image_url, is_available).' });
       return;
   }
     // Validar tipos si se proporcionan
     if (price !== undefined && isNaN(price)) { res.status(400).json({ error: 'El precio debe ser un número.' }); return; }
     if (stock !== undefined && isNaN(stock)) { res.status(400).json({ error: 'El stock debe ser un número.' }); return; }
     if (is_available !== undefined && (is_available !== 0 && is_available !== 1)) { res.status(400).json({ error: 'is_available debe ser 0 o 1.' }); return; }


    // Construir dinámicamente la parte SET de la sentencia SQL para solo actualizar los campos proporcionados
    const fieldsToUpdate = [];
    const params = [];

    if (name !== undefined) { fieldsToUpdate.push('name = ?'); params.push(name); }
    if (description !== undefined) { fieldsToUpdate.push('description = ?'); params.push(description); }
    if (price !== undefined) { fieldsToUpdate.push('price = ?'); params.push(price); }
    if (stock !== undefined) { fieldsToUpdate.push('stock = ?'); params.push(stock); }
    if (category !== undefined) { fieldsToUpdate.push('category = ?'); params.push(category); }
    if (image_url !== undefined) { fieldsToUpdate.push('image_url = ?'); params.push(image_url); }
     if (is_available !== undefined) { fieldsToUpdate.push('is_available = ?'); params.push(is_available); }


    // Si no hay campos para actualizar, responder error (aunque ya validamos arriba)
    if (fieldsToUpdate.length === 0) {
         res.status(400).json({ error: 'No se proporcionaron campos válidos para actualizar.' });
         return;
     }

    // Añadir el ID del producto y el ID del vendedor a los parámetros para la cláusula WHERE
    params.push(productId);
    params.push(sellerId);


    // Sentencia SQL para actualizar el producto.
    // ¡CRUCIAL!: WHERE id = ? AND seller_id = ? asegura que solo se actualiza el producto si pertenece al vendedor.
    const sql = `
        UPDATE products
        SET ${fieldsToUpdate.join(', ')}
        WHERE id = ? AND seller_id = ?
    `;

    db.run(sql, params, function(err) { // Usamos function() para this.changes
        if (err) {
            console.error('Error al editar producto:', err.message);
            res.status(500).json({ error: err.message });
            return;
        }

        if (this.changes === 0) {
            // Si this.changes es 0, significa que no se encontró el producto
            // CON ESE ID Y QUE PERTENECIERA A ESE VENDEDOR.
            // Podría ser que el producto no existe o que no pertenece a este vendedor.
             res.status(404).json({ message: 'Producto no encontrado o no pertenece a este vendedor.' });
         } else {
            // Si this.changes es 1, se actualizó 1 fila
            res.status(200).json({ message: 'Producto actualizado exitosamente', productId: productId });
         }
    });
});

// Ruta para que un vendedor elimine uno de sus productos
// Recibe sellerId y productId de los parámetros de la URL
app.delete('/api/sellers/:sellerId/products/:productId', (req, res) => {
  const sellerId = req.params.sellerId;
  const productId = req.params.productId;

  // Validar IDs
   if (isNaN(sellerId) || isNaN(productId)) {
       res.status(400).json({ error: 'Los IDs de vendedor y producto deben ser números válidos.' });
       return;
   }

  // Sentencia SQL para eliminar el producto.
  // ¡CRUCIAL!: WHERE id = ? AND seller_id = ? asegura que solo se elimina el producto si pertenece al vendedor.
  const sql = `
      DELETE FROM products
      WHERE id = ? AND seller_id = ?
  `;
  const params = [productId, sellerId];

  db.run(sql, params, function(err) { // Usamos function() para this.changes
      if (err) {
          console.error('Error al eliminar producto:', err.message);
          res.status(500).json({ error: err.message });
          return;
      }

       if (this.changes === 0) {
          // Si this.changes es 0, significa que no se encontró el producto
          // CON ESE ID Y QUE PERTENECIERA A ESE VENDEDOR.
           res.status(404).json({ message: 'Producto no encontrado o no pertenece a este vendedor.' });
       } else {
          // Si this.changes es 1, se eliminó 1 fila
          res.status(200).json({ message: 'Producto eliminado exitosamente', productId: productId });
       }
  });
});

// --- Fin Rutas de Gestión de Inventario del Vendedor ---
//- pedidos del comprador (ver historial, detalles de un pedido)
// --- Rutas de Pedidos Recibidos por el Vendedor ---

// Ruta para obtener la lista de pedidos que contienen productos de un vendedor específico
// Recibe sellerId del parámetro de la URL
app.get('/api/sellers/:sellerId/received-orders', (req, res) => {
  const sellerId = req.params.sellerId;

  // Validar sellerId
  if (isNaN(sellerId)) {
      res.status(400).json({ error: 'El ID de vendedor debe ser un número válido.' });
      return;
  }

  // Sentencia SQL para seleccionar pedidos (DISTINCT para evitar duplicados si un pedido tiene varios ítems del mismo vendedor)
  // que contienen productos de este vendedor.
  const sql = `
      SELECT DISTINCT o.*
      FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      JOIN products p ON oi.product_id = p.id
      WHERE p.seller_id = ?
      ORDER BY o.order_date DESC -- Mostrar los pedidos más recientes primero
  `;
  const params = [sellerId];

  db.all(sql, params, (err, orders) => { // db.all porque esperamos múltiples pedidos
      if (err) {
          console.error('Error al obtener lista de pedidos recibidos:', err.message);
          res.status(500).json({ error: err.message });
          return;
      }
      // Responder con la lista de pedidos (objetos pedido completos)
      res.status(200).json(orders); // orders será un array de objetos pedido
  });
});

// ... siguiente ruta (detalles de pedido recibido) ...
// Ruta para obtener los detalles de un pedido recibido específico para un vendedor
// Muestra los detalles del pedido y SOLO los ítems que pertenecen a este vendedor
// Incluye info del comprador y dirección de entrega
app.get('/api/sellers/:sellerId/received-orders/:orderId', async (req, res) => { // Usamos 'async'
  const sellerId = req.params.sellerId;
  const orderId = req.params.orderId;

  // Validar IDs
  if (isNaN(sellerId) || isNaN(orderId)) {
      res.status(400).json({ error: 'Los IDs de vendedor y pedido deben ser números válidos.' });
      return;
  }

  try {
      // --- Paso 1: Verificar que el pedido contenga productos de este vendedor ---
      // Esto es una verificación de seguridad para que un vendedor no vea cualquier pedido.
      const checkOrderRelevanceSql = `
          SELECT COUNT(*) AS count
          FROM order_items oi
          JOIN products p ON oi.product_id = p.id
          WHERE oi.order_id = ? AND p.seller_id = ?
      `;
      const relevanceCheck = await new Promise((resolve, reject) => {
           db.get(checkOrderRelevanceSql, [orderId, sellerId], (err, row) => {
               if (err) reject(err);
               else resolve(row);
           });
      });

      if (!relevanceCheck || relevanceCheck.count === 0) {
          // Si el pedido no existe o no contiene productos de este vendedor
          res.status(404).json({ message: 'Pedido no encontrado o no contiene productos de este vendedor.' });
          return;
      }

      // --- Paso 2: Obtener los detalles del pedido principal, comprador y dirección ---
      // Hacemos JOIN con users (para info del comprador) y addresses (para dirección de entrega)
      const getOrderDetailsSql = `
          SELECT
              o.*,
              u.username as buyer_username,
              u.email as buyer_email,
              u.phone_number as buyer_phone,
              a.address_line1,
              a.address_line2,
              a.city,
              a.state_province,
              a.postal_code
          FROM orders o
          JOIN users u ON o.user_id = u.id
          JOIN addresses a ON o.delivery_address_id = a.id
          WHERE o.id = ?
      `;
      const order = await new Promise((resolve, reject) => {
          db.get(getOrderDetailsSql, [orderId], (err, row) => {
              if (err) reject(err);
              else resolve(row);
          });
      });

       if (!order) { // Esto no debería pasar si el check anterior fue > 0, pero por seguridad
          res.status(404).json({ message: 'Pedido principal no encontrado (inconsistencia).' });
          return;
      }


      // --- Paso 3: Obtener SOLO los ítems de este pedido que pertenecen a ESTE vendedor ---
      const getSellerOrderItemsSql = `
          SELECT
              oi.product_id,
              oi.quantity,
              oi.price_at_purchase, -- Precio al momento de la compra
              p.name as product_name,
              p.description as product_description,
              p.image_url as product_image_url
          FROM order_items oi
          JOIN products p ON oi.product_id = p.id
          WHERE oi.order_id = ? AND p.seller_id = ?
      `;
      const sellerOrderItems = await new Promise((resolve, reject) => {
          db.all(getSellerOrderItemsSql, [orderId, sellerId], (err, rows) => {
              if (err) reject(err);
              else resolve(rows);
          });
      });

      // --- Combinar los resultados y responder ---
      // Estructura la respuesta para incluir el pedido principal, info del comprador/dirección,
      // y la lista de ítems *del vendedor* en ese pedido.
      const receivedOrderDetails = {
          ...order, // Copia todas las propiedades del objeto pedido, comprador y dirección
          seller_items_in_this_order: sellerOrderItems // Añade el array de ítems que le corresponden al vendedor
      };

      res.status(200).json(receivedOrderDetails);

  } catch (err) {
      console.error('Error al obtener detalles del pedido recibido:', err.message);
      res.status(500).json({ error: err.message });
  }
});

// --- Fin Rutas de Pedidos Recibidos por el Vendedor ---
// --- Rutas de Pedidos Recibidos por el Vendedor ---

// Ruta para obtener la lista de pedidos que contienen productos de un vendedor específico
// Recibe sellerId del parámetro de la URL
app.get('/api/sellers/:sellerId/received-orders', (req, res) => {
  const sellerId = req.params.sellerId;

  // Validar sellerId
  if (isNaN(sellerId)) {
      res.status(400).json({ error: 'El ID de vendedor debe ser un número válido.' });
      return;
  }

  // Sentencia SQL para seleccionar pedidos (DISTINCT para evitar duplicados si un pedido tiene varios ítems del mismo vendedor)
  // que contienen productos de este vendedor.
  const sql = `
      SELECT DISTINCT o.*
      FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      JOIN products p ON oi.product_id = p.id
      WHERE p.seller_id = ?
      ORDER BY o.order_date DESC -- Mostrar los pedidos más recientes primero
  `;
  const params = [sellerId];

  db.all(sql, params, (err, orders) => { // db.all porque esperamos múltiples pedidos
      if (err) {
          console.error('Error al obtener lista de pedidos recibidos:', err.message);
          res.status(500).json({ error: err.message });
          return;
      }
      // Responder con la lista de pedidos (objetos pedido completos)
      res.status(200).json(orders); // orders será un array de objetos pedido
  });
});

// ... siguiente ruta (detalles de pedido recibido) ...
//-Gestion de usuarios (registro, login, perfil, etc) -- Empezaremos pronto
//-Manejo de pagos (simulado, integrar pasarela de pagos)

// ... usando db.all(), db.get(), db.run() para interactuar con la base de datos


// La ruta duplicada '/api/products' fue eliminada


// --- Fin Definicion de las rutas de la API--


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

// para que puedas crear las tablas y columnas que necesita la aplicacion
}); // Close the app.listen callback
