#  App de Asistencia Odoo (React Native)

Una aplicación móvil profesional construida con **React Native (Expo)** para gestionar la asistencia de empleados, totalmente integrada con **Odoo ERP**. Permite a los empleados realizar Check-in/Check-out, ver su historial de asistencia y resumen semanal desde sus dispositivos móviles.

##  Características

- ** Autenticación de Usuario**: Inicio de sesión seguro utilizando credenciales de Odoo.
- ** Registro de Asistencia**: Check-in y Check-out con un solo toque y estado en tiempo real.
- ** Historial**: Visualización de registros pasados con cálculo de horas trabajadas.
- ** Resumen Semanal**: Resumen visual de las horas trabajadas en la semana actual.
- ** Integración Odoo**: Comunicación directa con el módulo hr.attendance de Odoo vía JSON-RPC.

##  Tecnologías

- **Frontend**: React Native, Expo
- **Navegación**: React Navigation (Native Stack)
- **Backend**: Odoo Community/Enterprise (v16/v17)
- **Almacenamiento**: Expo Secure Store (persistencia de sesión)

##  Estructura del Proyecto

`	ext
rn6/
 assets/              # Imágenes y recursos estáticos
 odoo-addons/         # Módulos personalizados de Odoo (si son necesarios)
 odoo-config/         # Configuración del servidor Odoo
 src/
    context/         # Estado global (AuthContext)
    navigation/      # Navegación de la app
    screens/         # Pantallas (Login, Home, History)
    services/        # Lógica de negocio y API (OdooApi, Attendance)
    styles/          # Tema, colores y estilos globales
    utils/           # Utilidades (Formato de fechas, Almacenamiento)
 App.js               # Punto de entrada
 docker-compose.yml   # Entorno local de Odoo con Docker
` 

##  Instalación y Uso

### Prerrequisitos

- **Node.js** (v18+)
- **npm** o **yarn**
- **Instancia de Odoo** con el módulo hr_attendance instalado.

### Pasos

1.  **Clonar el repositorio**:
    `ash
    git clone https://github.com/tu-usuario/rn6.git
    cd rn6
    ``n
2.  **Instalar dependencias**:
    `ash
    npm install
    ``n
3.  **Iniciar Backend (Opcional)**:
    Si deseas ejecutar Odoo localmente:
    `ash
    docker-compose up -d
    ``n
4.  **Ejecutar la App**:
    `ash
    npx expo start
    ``n    Presiona  para Android o i para iOS.

##  Configuración

La aplicación solicitará la URL del servidor Odoo y el nombre de la base de datos en la pantalla de inicio de sesión. Asegúrate de que el servidor Odoo sea accesible desde tu dispositivo móvil (usa la IP de tu red, no localhost, si pruebas en un dispositivo físico).

##  Licencia

Distribuido bajo la licencia MIT.
