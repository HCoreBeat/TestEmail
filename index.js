const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Configuración de CORS
const allowedOrigins = [
  "https://www.asereshops.com",
  "https://hcorebeat.github.io", 
  "http://127.0.0.1:5500"
];

app.use(cors({
  origin: function (origin, callback) {
    // Permitir solicitudes sin 'origin'
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("No permitido por CORS"));
    }
  },
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"],
  credentials: false
}));

app.use(express.json());

// Ruta para enviar el correo (pedido)
app.post('/send-email', async (req, res) => {
  try {
    const googleScriptUrl = process.env.GOOGLE_SCRIPT_URL;
    const orderData = req.body;

    // Validación básica
    if (!orderData.buyerName || !orderData.products || !Array.isArray(orderData.products)) {
      return res.status(400).json({ error: 'Faltan campos requeridos' });
    }

    // Calcular el total si no se envió
    if (!orderData.totalPrice) {
      orderData.totalPrice = orderData.products.reduce((sum, product) => sum + (product.quantity * product.unitPrice), 0);
    }

    await axios.post(googleScriptUrl, orderData);
    res.json({ message: 'Correo enviado exitosamente!' });
  } catch (error) {
    console.error('Error en el backend:', error);
    res.status(500).json({ error: 'Error al enviar el correo' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
