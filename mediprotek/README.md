# Mediprotek - Sistema de Autenticación y Gestión de Usuarios

## 💻 Guía de Instalación

### Requisitos Previos

1. **Software Necesario**
   - Docker Desktop
   - Git
   - Node.js (v18 o superior)
   - npm (v9 o superior)

### Pasos de Instalación

1. **Clonar el Repositorio**
   ```bash
   git clone [URL_DEL_REPOSITORIO]
   cd mediprotek
   ```

2. **Instalar Dependencias del Proyecto**
   ```bash
   npm install
   ```

3. **Configurar Variables de Entorno**
   ```bash
   # Copiar el archivo de ejemplo
   cp .env.example .env
   ```
   Editar el archivo `.env` con los valores correctos:
   ```env
   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/mediprotek
   JWT_SECRET=tu_secret_key
   JWT_REFRESH_SECRET=tu_refresh_secret_key
   PORT=3000
   ```

4. **Iniciar los Contenedores Docker**
   ```bash
   # Iniciar todos los servicios
   docker-compose up -d
   ```
   Esto iniciará:
   - PostgreSQL (puerto 5432)
   - Redis (puerto 6379)
   - Otros servicios necesarios

5. **Verificar los Contenedores**
   ```bash
   # Verificar que los contenedores estén corriendo
   docker ps
   ```

6. **Ejecutar Migraciones**
   ```bash
   # Esperar unos segundos a que la base de datos esté lista
   npm run migration:run
   ```

7. **Iniciar los Microservicios**

   En terminales separadas, ejecutar:

   ```bash
   # Terminal 1 - API Gateway
   npm run start:api

   # Terminal 2 - Servicio de Autenticación
   npm run start:auth

   # Terminal 3 - Servicio de Usuarios
   npm run start:users

   # Terminal 4 - Frontend
   npm run start:frontend
   ```

### Verificación

Los servicios estarán disponibles en:

- Frontend: http://localhost:4200
- API Gateway: http://localhost:3000
- Servicio de Autenticación: http://localhost:3001
- Servicio de Usuarios: http://localhost:3002
- Swagger Docs: http://localhost:3000/api/docs

### Comandos Útiles

```bash
# Ver logs de los contenedores
docker-compose logs -f

# Detener todos los servicios
docker-compose down

# Reiniciar un servicio específico
docker-compose restart [servicio]

# Reconstruir contenedores
docker-compose up -d --build
```

### Solución de Problemas

1. **Error de Conexión a la Base de Datos**
   ```bash
   # Verificar que PostgreSQL esté corriendo
   docker ps | grep postgres
   
   # Ver logs de PostgreSQL
   docker-compose logs postgres
   ```

2. **Error en las Migraciones**
   ```bash
   # Resetear la base de datos
   npm run migration:reset
   
   # Ejecutar migraciones nuevamente
   npm run migration:run
   ```

3. **Problemas con los Puertos**
   ```bash
   # Verificar puertos en uso
   netstat -an | grep LISTEN
   
   # Detener servicios que puedan estar usando los puertos
   docker-compose down
   ```

### Usuario de Prueba

Puedes usar las siguientes credenciales para probar la aplicación:

```
Email: admin@example.com
Contraseña: Admin123!
```

## ⚠️ Consideraciones Importantes

1. La aplicación usa cookies HttpOnly para el manejo de tokens
2. Los tokens de acceso expiran cada 15 minutos
3. Los tokens de refresh expiran cada 7 días
4. Asegúrate de que todos los puertos necesarios estén disponibles
5. El sistema está configurado para desarrollo local. Para producción, se deben ajustar las configuraciones de seguridad

## 📖 Documentación Adicional

- La documentación completa de la API está disponible en Swagger: http://localhost:3000/api/docs
- Para más detalles sobre la arquitectura y los servicios, consulta la carpeta `docs/`
