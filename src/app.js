import express from 'express'
import cors from 'cors'
import  usersRoutes from './routes/users.routes.js'
import presupuestosRoutes from './routes/presupuestos.routes.js'
import categoriasRoutes from './routes/categorias.routes.js'
import transaccionesRoutes from './routes/transacciones.routes.js'
import resumenCicloRoutes from './routes/resumenCiclo.routes.js'
import suscripcionesRoutes from './routes/suscripciones.routes.js'
import indexRoutes from './routes/index.routes.js'

const app = express()

// Configuración de CORS
const corsOptions = {
  origin: [
    'http://localhost:5173', // Tu frontend Vite
    'http://localhost:3000', // Frontend alternativo
    'http://127.0.0.1:5173', // IP local alternativa
    'http://127.0.0.1:3000'  // IP local alternativa
  ],
  credentials: true, // Permite cookies y headers de autenticación
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions))
app.use(express.json())

app.use(indexRoutes)
app.use('/api',usersRoutes)
app.use('/api',presupuestosRoutes)
app.use('/api',categoriasRoutes)
app.use('/api',transaccionesRoutes)
app.use('/api',resumenCicloRoutes)
app.use('/api',suscripcionesRoutes)

app.use((req,res,next) => {
    res.status(404).json({
        message: 'endpoint not found'
    })
})

export default app;