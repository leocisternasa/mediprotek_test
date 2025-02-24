# Proyecto Mediprotek

## Descripción

Proyecto monorepo desarrollado con Nx, que integra un frontend en Angular y microservicios backend en NestJS. El sistema implementa autenticación JWT y gestión de usuarios con diferentes niveles de acceso.

## Stack Tecnológico

### Monorepo y Herramientas

- Nx: Gestión de monorepo y herramientas de desarrollo
- Docker: Contenedorización y servicios
- Git: Control de versiones

### Frontend

- Angular 17
- Angular Material
- RxJS
- TypeScript

### Backend Microservicios

- NestJS
- TypeORM
- PostgreSQL
- RabbitMQ
- JWT

## Requisitos Previos

1. **PostgreSQL**

   - Base de datos relacional para almacenamiento
   - Puertos por defecto: 5432

2. **Docker Desktop**

   - Necesario para RabbitMQ
   - Gestión de contenedores

3. **Nx (instalación global)**

   ```bash
   npm install -g nx
   ```

4. **Node.js y npm**
   - Node.js v18 o superior
   - npm v9 o superior

## Guía de Instalación

### Pasos Adicionales

1. **Software Complementario**
   - Git
   - Node.js (v18 o superior)
   - npm (v9 o superior)

## Instalación y Configuración

### 1. Clonar el Repositorio

```bash
git clone https://github.com/leocisternasa/mediprotek_test.git
cd mediprotek_test
cd mediprotek
npm install
```

### 2. Configurar RabbitMQ

```bash

docker run -d --name rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:3-management

```

### 3. Configurar PostgreSQL

1. Crear las bases de datos requeridas:

   ```sql
   CREATE DATABASE mediprotek_auth;
   CREATE DATABASE mediprotek_users;
   ```

2. Configurar archivos .env en los servicios:

   **auth-service/.env**:

   ```va en el archivo apps/backend/auth-service/.env , para comodidad se comparte en el repo

   ```

   **user-service/.env**:

   ```va en el archivo apps/backend/auth-service/.env , para comodidad se comparte en el repo

   ```

### 4. Iniciar los Servicios

En terminales separadas, ejecutar:

```bash
# Frontend (Puerto 4200)
nx serve frontend

# API Gateway
nx serve api-gateway

# Servicio de Autenticación
nx serve auth-service

# Servicio de Usuarios
nx serve user-service
```

## Funcionalidades y Características

### Autenticación y Autorización

- Implementación de JWT para autenticación segura
- Rutas protegidas en el dashboard
- Roles de usuario: Admin y User

### Gestión de Usuarios

1. **Administradores (ADMIN)**

   - CRUD completo de todos los usuarios
   - Creación de nuevos usuarios y administradores
   - Acceso total al dashboard

2. **Usuarios (USER)**
   - Gestión del perfil propio
   - Sin permisos para crear nuevos usuarios
   - Acceso limitado al dashboard

### Registro Inicial

- Acceso desde el link en la página de login
- El primer usuario creado recibe rol de Admin
- Acceso inmediato al dashboard después del registro

### Comandos Útiles

```bash
# Gestión de RabbitMQ
docker stop rabbitmq          # Detener RabbitMQ
docker start rabbitmq         # Iniciar RabbitMQ
docker logs rabbitmq          # Ver logs
docker ps | grep rabbitmq     # Verificar estado

# Gestión de Servicios Nx
nx reset                      # Limpiar cache de Nx
nx run-many --target=serve --projects=api-gateway,auth-service,user-service,frontend  # Iniciar todos los servicios
nx affected:test              # Ejecutar tests afectados
nx graph                      # Ver dependencias del proyecto
```

### Solución de Problemas Comunes

1. **Bases de Datos**

   - Verificar que existan las bases de datos: mediprotek_auth y mediprotek_users
   - Confirmar credenciales en archivos .env de auth-service y user-service
   - Verificar que PostgreSQL esté corriendo en el puerto configurado

2. **Microservicios**

   - Asegurar que RabbitMQ esté corriendo y accesible
   - Verificar que los archivos .env estén correctamente configurados
   - Comprobar que los puertos no estén en uso

3. **Autenticación**
   - Para el primer uso, registrar un nuevo usuario desde el link en el login
   - El primer usuario registrado tendrá rol de Admin
   - Verificar las variables JWT_SECRET y JWT_REFRESH_SECRET en auth-service

## Puertos y Endpoints

- Frontend: http://localhost:4200
- API Gateway: http://localhost:3000
- Auth Service: http://localhost:3001
- User Service: http://localhost:3002
- RabbitMQ Management: http://localhost:15672
- PostgreSQL: 5432

## Consideraciones Importantes

1. **Desarrollo**

   - Nx debe estar instalado globalmente
   - Docker Desktop debe estar corriendo
   - PostgreSQL debe estar configurado correctamente

2. **Seguridad**

   - Las contraseñas se almacenan hasheadas
   - JWT con refresh tokens implementado
   - Rutas protegidas por roles

3. **Mantenimiento**
   - Usar los comandos de Nx para gestionar el monorepo
   - Mantener actualizados los archivos .env
   - Revisar los logs para debugging
