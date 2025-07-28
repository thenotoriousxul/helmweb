# 📋 DOCUMENTACIÓN COMPLETA - HELM IoT

## 🏗️ **DESCRIPCIÓN GENERAL DEL PROYECTO**

**Helm** es una aplicación web Angular que implementa un sistema de monitoreo inteligente en tiempo real para cascos IoT utilizados en minería. El sistema permite rastrear la ubicación GPS, temperatura, frecuencia cardíaca, acelerómetro y otros sensores de los mineros para garantizar su seguridad y bienestar durante las operaciones mineras.

### **🎯 Objetivo Principal**
Proteger a los mineros mediante tecnología de vanguardia, proporcionando monitoreo continuo de sus condiciones físicas y ubicación en tiempo real, con alertas automáticas para situaciones de emergencia.

---

## 👥 **SISTEMA DE ROLES Y PERMISOS**

### **👑 Administrador (ADMIN)**
- **Gestión completa** del sistema
- **Creación y asignación** de cascos IoT
- **Vista de todas las estadísticas** globales
- **Control total** sobre equipos y usuarios
- **Configuración del sistema**

### **👔 Supervisor (SUPERVISOR)**
- **Gestión de equipos** asignados
- **Activación y asignación** de cascos
- **Monitoreo de mineros** bajo su responsabilidad
- **Creación de equipos** de minería
- **Reportes de seguridad**

### **⛏️ Minero (MINERO)**
- **Vista limitada** a su propio equipo
- **Monitoreo de sus datos** personales
- **Acceso a su ubicación** y estado de salud
- **Alertas personales**

---

## 📱 **MÓDULOS Y FUNCIONALIDADES PRINCIPALES**

### **1. 🏠 Landing Page (`/`)**
- **Página de presentación** del producto
- **Características principales** del sistema
- **Casos de éxito** y testimonios
- **Información de contacto**
- **Demo visual** del sistema

### **2. 🔐 Autenticación**
- **Login (`/login`)**: Formulario con email y contraseña
- **Registro (`/register`)**: Creación de nuevas cuentas
- **Botones de acceso rápido** para pruebas (Supervisor, Minero, Admin)
- **Información de roles** del sistema

### **3. 📊 Equipos (`/equipments`)**
- **Lista de equipos** de minería con estados
- **Creación de nuevos equipos** (nombre, tipo, ubicación, supervisor)
- **Edición y eliminación** de equipos
- **Estadísticas** por equipo (cascos activos, alertas)
- **Filtros avanzados** por tipo y estado

### **4. 🪖 Gestión de Cascos (`/helmets`)**
- **Inventario de cascos** IoT
- **Asignación** a mineros
- **Estado de batería** y conectividad
- **Configuración** de sensores
- **Historial** de uso

### **5. 👷 Gestión de Mineros (`/miners`)**
- **Registro de mineros** con datos personales completos
- **Asignación de cascos** y equipos
- **Información de contacto** y dirección
- **Estado** (online/offline/alert)
- **Historial médico** básico

### **6. 📈 Reportes (`/reports`)**
- **Generación de reportes** de seguridad
- **Análisis de datos** históricos
- **Exportación** de información
- **Gráficos** y estadísticas

### **7. 🚨 Alertas (`/alerts`)**
- **Sistema de notificaciones** en tiempo real
- **Diferentes tipos** de alertas (críticas, advertencias)
- **Historial** de alertas
- **Configuración** de umbrales

### **8. ⚙️ Configuración (`/settings`)**
- **Configuración del sistema**
- **Preferencias de usuario**
- **Configuración de notificaciones**
- **Gestión de perfil**

---

## 🛠️ **TECNOLOGÍAS UTILIZADAS**

### **Frontend**
- **Framework**: Angular 20
- **Lenguaje**: TypeScript
- **Estilos**: CSS personalizado con glassmorphism
- **Iconos**: Font Awesome
- **Estado**: RxJS BehaviorSubject
- **Rutas**: Angular Router

### **Mapas y Visualización**
- **Biblioteca de Mapas**: Leaflet.js
- **Capas de Mapa**: OpenStreetMap, CartoDB, Stadia Maps
- **Marcadores Personalizados**: Iconos SVG personalizados
- **Controles Interactivos**: Zoom, capas, popups

### **Diseño y UX**
- **Estilo**: Glassmorphism moderno
- **Tema**: Modo oscuro por defecto
- **Responsive**: Diseño adaptable
- **Animaciones**: Transiciones suaves
- **Accesibilidad**: Alto contraste

---

## 📊 **DATOS QUE SE MUESTRAN**

### **Sensores en Tiempo Real:**
- **GPS**: Latitud, longitud, altitud
- **Temperatura**: Temperatura corporal del minero
- **Frecuencia cardíaca**: Ritmo cardíaco
- **Acelerómetro**: Detección de caídas y movimientos
- **Batería**: Nivel de carga del casco
- **Conectividad**: Estado de comunicación

### **Información de Equipos:**
- Nombre y tipo de equipo
- Ubicación geográfica
- Supervisor asignado
- Cantidad de cascos activos/total
- Alertas pendientes
- Última actualización

### **Datos de Usuarios:**
- Información personal completa
- Rol y permisos
- Equipo asignado
- Historial de actividad
- Estado de salud básico

---

## 🎨 **PALETAS DE COLORES COMPLETAS**

### **🌙 Colores Base (Modo Oscuro)**
```
Fondo Principal:     #0a192f (Azul marino muy oscuro)
Fondo Secundario:    #112240 (Azul marino oscuro)
Fondo Terciario:     #172a45 (Azul marino medio)
Fondo Cuaternario:   #233554 (Azul marino claro)
```

### **💎 Colores de Acento (Cian/Turquesa)**
```
Acento Principal:    #3df4f4 (Cian brillante)
Acento Secundario:   #64ffda (Turquesa)
Acento Terciario:    #20c997 (Verde turquesa)
Acento Suave:        #00d4aa (Turquesa medio)
```

### **📝 Colores de Texto**
```
Texto Principal:     #ccd6f6 (Blanco azulado claro)
Texto Secundario:    #8892b0 (Gris azulado)
Texto Muted:         #8892b0 (Gris azulado)
```

### **🚨 Colores de Estado**
```
Éxito/Activo:        #64ffda (Turquesa)
Advertencia:         #ffd93d (Amarillo)
Peligro/Error:       #ff6b6b (Rojo coral)
Crítico:             #dc3545 (Rojo)
```

### **👥 Colores de Roles (Botones Demo)**
```
Supervisor:          #007bff → #0056b3 (Azul)
Minero:              #28a745 → #20c997 (Verde)
Admin:               #6f42c1 → #5a32a3 (Púrpura)
```

### **🔧 Colores de Componentes**
```
Glassmorphism:       rgba(48, 60, 85, 0.4) (Fondo glass)
Borde Glass:         rgba(61, 244, 244, 0.2) (Borde cian)
Sombra Glass:        rgba(61, 244, 244, 0.3) (Sombra cian)
```

### **🗺️ Colores del Mapa**
```
Fondo Mapa:          #0a192f (Azul marino)
Popup Mapa:          rgba(23, 42, 69, 0.95) (Azul glass)
Control Mapa:        rgba(23, 42, 69, 0.9) (Azul glass)
```

### **📊 Colores de Sensores**
```
Temperatura:         rgba(255, 107, 107, 0.3) (Rojo)
Movimiento:          rgba(255, 217, 61, 0.3) (Amarillo)
GPS:                 rgba(61, 244, 244, 0.3) (Cian)
Presión:             rgba(100, 255, 218, 0.3) (Turquesa)
Batería:             rgba(255, 193, 7, 0.3) (Amarillo)
Analytics:           rgba(108, 117, 125, 0.3) (Gris)
```

### **⚡ Gradientes Principales**
```
Botón Primario:      linear-gradient(135deg, #3df4f4 0%, #64ffda 100%)
Botón Login:         linear-gradient(135deg, #64ffda, #20c997)
Fondo Principal:     linear-gradient(135deg, #0a192f 0%, #172a45 100%)
Fondo Login:         linear-gradient(135deg, #0a192f 0%, #112240 50%, #233554 100%)
Título Gradiente:    linear-gradient(135deg, #64ffda 0%, #00d4aa 100%)
```

### **🔋 Estados de Batería**
```
Batería Llena:       #28a745 (Verde)
Batería Media:       #ffc107 (Amarillo)
Batería Baja:        #dc3545 (Rojo)
```

### **🔍 Colores de Interacción**
```
Hover Primario:      rgba(61, 244, 244, 0.4) (Cian más intenso)
Hover Secundario:    rgba(100, 255, 218, 0.1) (Turquesa suave)
Focus Input:         rgba(61, 244, 244, 0.1) (Cian suave)
```

---

## 🎨 **RESUMEN DE LA PALETA**

**Tema Principal**: Modo oscuro con acentos cian/turquesa
**Estilo**: Glassmorphism moderno con transparencias
**Contraste**: Alto contraste para accesibilidad
**Consistencia**: Colores coherentes en toda la aplicación

Esta paleta crea una experiencia visual moderna, profesional y tecnológica que refleja la naturaleza avanzada del sistema de monitoreo IoT para minería.

---

## 🚀 **CARACTERÍSTICAS DE DISEÑO**

- **Interfaz moderna** con glassmorphism
- **Modo oscuro** por defecto
- **Responsive design** para diferentes dispositivos
- **Animaciones suaves** y transiciones
- **Iconografía clara** y consistente
- **Mensajes de estado** informativos
- **Navegación intuitiva** con breadcrumbs
- **Filtros avanzados** en todas las secciones

---

## 📱 **FUNCIONALIDADES AVANZADAS**

### **Sistema de Alertas Inteligente**
- Detección automática de anomalías
- Alertas en tiempo real
- Diferentes niveles de severidad
- Notificaciones push

### **Monitoreo GPS Avanzado**
- Rastreo en tiempo real
- Geofencing inteligente
- Historial de rutas
- Alertas de zona

### **Análisis de Datos**
- Reportes personalizados
- Gráficos interactivos
- Exportación de datos
- Análisis predictivo

### **Seguridad y Privacidad**
- Autenticación robusta
- Encriptación de datos
- Control de acceso por roles
- Auditoría de actividades

---

## 🔮 **FUTURAS MEJORAS**

- **Integración con IA** para predicción de incidentes
- **App móvil** nativa
- **API REST** para integraciones
- **Sistema de chat** interno
- **Notificaciones push** avanzadas
- **Integración con wearables** adicionales

---

*Documentación generada para el proyecto Helm IoT - Sistema de Monitoreo Inteligente para Minería* 