const express = require('express');
const client = require('prom-client');
const app = express();
const port = 3000;

// Inicia las métricas de Prometheus
const register = new client.Registry();

// Define una métrica de tipo "counter"
  const httpRequestCounter = new client.Counter({
    name: 'http_requests_total',
    help: 'Contador de las solicitudes HTTP recibidas',
    labelNames: ['method', 'status'],
});


register.registerMetric(httpRequestCounter);

// Middleware para contar las solicitudes
app.use((req, res, next) => {
  res.on('finish', () => {
    httpRequestCounter.inc({
      method: req.method,
      status: res.statusCode,
    });
  });
  next();
});

// Endpoint para la página principal
app.get('/', (req, res) => {
  res.send('¡Hola, Mundo!');
});

// Endpoint para las métricas de Prometheus
app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (err) {
    res.status(500).send(err);
  }
});

// Inicia el servidor
app.listen(port, () => {
  console.log(`Aplicación corriendo en http://localhost:${port}`);
});
