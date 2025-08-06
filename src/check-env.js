// Script para verificar variables de entorno
import { config } from "dotenv";

config();

console.log('🔧 Verificando variables de entorno...\n');

// Variables requeridas
const requiredVars = {
  'DB_USER': process.env.DB_USER,
  'DB_PASSWORD': process.env.DB_PASSWORD,
  'DB_HOST': process.env.DB_HOST,
  'DB_DATABASE': process.env.DB_DATABASE,
  'DB_PORT': process.env.DB_PORT,
  'CLERK_SECRET_KEY': process.env.CLERK_SECRET_KEY,
  'CLERK_PUBLISHABLE_KEY': process.env.CLERK_PUBLISHABLE_KEY,
  'CLERK_JWT_KEY': process.env.CLERK_JWT_KEY,
  'PORT': process.env.PORT
};

// Variables opcionales con valores por defecto
const optionalVars = {
  'DB_USER (default)': process.env.DB_USER || 'root',
  'DB_PASSWORD (default)': process.env.DB_PASSWORD || 'hachepassword',
  'DB_HOST (default)': process.env.DB_HOST || 'localhost',
  'DB_DATABASE (default)': process.env.DB_DATABASE || 'gastosdb',
  'DB_PORT (default)': process.env.DB_PORT || 3306,
  'CLERK_FRONTEND_URL (default)': process.env.CLERK_FRONTEND_URL || 'http://localhost:5173',
  'PORT (default)': process.env.PORT || 3000
};

console.log('📋 Variables Requeridas:');
console.log('========================');

let allRequiredSet = true;

Object.entries(requiredVars).forEach(([key, value]) => {
  if (value) {
    console.log(`✅ ${key}: ${key.includes('PASSWORD') || key.includes('SECRET') || key.includes('JWT') || key.includes('PUBLISHABLE') ? '***HIDDEN***' : value}`);
  } else {
    console.log(`❌ ${key}: NO CONFIGURADA`);
    allRequiredSet = false;
  }
});

console.log('\n📋 Variables Opcionales (con valores por defecto):');
console.log('==================================================');

Object.entries(optionalVars).forEach(([key, value]) => {
  console.log(`ℹ️  ${key}: ${key.includes('PASSWORD') || key.includes('SECRET') || key.includes('JWT') || key.includes('PUBLISHABLE') ? '***HIDDEN***' : value}`);
});

console.log('\n🔍 Verificación de Configuración:');
console.log('================================');

if (allRequiredSet) {
  console.log('✅ Todas las variables requeridas están configuradas');
  console.log('✅ La aplicación debería funcionar correctamente');
} else {
  console.log('❌ Faltan variables requeridas');
  console.log('❌ La aplicación puede fallar al iniciar');
  console.log('\n💡 Para configurar las variables faltantes:');
  console.log('   1. Crear archivo .env en la raíz del proyecto');
  console.log('   2. Agregar las variables faltantes');
  console.log('   3. En producción, configurar en el dashboard del proveedor');
}

console.log('\n🌐 Entorno Detectado:');
console.log('====================');
console.log(`NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
console.log(`Puerto: ${process.env.PORT || 3000}`);
console.log(`Base de Datos: ${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 3306}`);
console.log(`Frontend URL: ${process.env.CLERK_FRONTEND_URL || 'http://localhost:5173'}`);

console.log('\n📝 Ejemplo de archivo .env:');
console.log('==========================');
console.log(`DB_USER=${process.env.DB_USER || 'tu_usuario'}`);
console.log(`DB_PASSWORD=${process.env.DB_PASSWORD || 'tu_password'}`);
console.log(`DB_HOST=${process.env.DB_HOST || 'tu_host'}`);
console.log(`DB_DATABASE=${process.env.DB_DATABASE || 'gastosdb'}`);
console.log(`DB_PORT=${process.env.DB_PORT || 3306}`);
console.log(`CLERK_SECRET_KEY=${process.env.CLERK_SECRET_KEY || 'sk_test_tu_clerk_secret_key'}`);
console.log(`CLERK_PUBLISHABLE_KEY=${process.env.CLERK_PUBLISHABLE_KEY || 'pk_test_tu_clerk_publishable_key'}`);
console.log(`CLERK_JWT_KEY=${process.env.CLERK_JWT_KEY || 'tu_clerk_jwt_key'}`);
console.log(`CLERK_FRONTEND_URL=${process.env.CLERK_FRONTEND_URL || 'http://localhost:5173'}`);
console.log(`PORT=${process.env.PORT || 3000}`);

console.log('\n🚀 Estado Final:');
console.log('================');
if (allRequiredSet) {
  console.log('🎉 ¡Listo para desplegar!');
} else {
  console.log('⚠️  Configurar variables faltantes antes de desplegar');
} 