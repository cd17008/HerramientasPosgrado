# Herramientas de Posgrado – FIA UES

Aplicación web desarrollada para apoyar y agilizar los procesos administrativos de la Escuela de Posgrado de la Facultad de Ingeniería y Arquitectura (FIA) de la Universidad de El Salvador (UES), mediante herramientas para la gestión de información académica y la generación de documentos institucionales.

## Funcionalidades

### 📅 Calendario de programación docente

Herramienta para gestionar y visualizar la programación de actividades académicas de los docentes.

Entre sus principales funcionalidades se encuentran:

- Registro y edición de asignaciones docentes.
- Configuración de programas académicos, asignaturas y cargos.
- Definición de períodos de ejecución y horarios semanales.
- Visualización de sesiones académicas en un calendario.
- Gestión de excepciones para modificar o cancelar sesiones específicas.
- Identificación automática de días de asueto.
- Detección de conflictos y superposición de horarios entre asignaciones.
- Cálculo automático de horas y sesiones programadas.
- Consulta de resúmenes de horas por asignación, semana y mes.

### 📄 Generación de documentos

Generación automática de documentos a partir de la información registrada en la programación docente.

- **Expediente de contratación en Excel:** genera un libro de Excel con las hojas de requerimiento de contratación y detalle de horarios.
- **Correo institucional en Word:** genera un documento con el contenido del correo para solicitar la gestión de contratación docente.

### 📚 Catálogos académicos

La aplicación utiliza catálogos locales para facilitar el registro y la consulta de información:

- Programas académicos.
- Asignaturas.
- Docentes.
- Cohortes y estudiantes.
- Tarifas y categorías docentes.
- Clasificaciones y factores de sobrecupo.
- Nacionalidades y grados académicos.
- Otros catálogos administrativos.

## Tecnologías utilizadas

El proyecto está construido utilizando las siguientes tecnologías:

| Tecnología | Descripción |
|---|---|
| React 19 | Desarrollo de la interfaz de usuario. |
| Vite 8 | Herramienta de desarrollo y construcción. |
| JavaScript | Lenguaje principal de programación. |
| Tailwind CSS 4 | Estilización de la interfaz. |
| Lucide React | Biblioteca de iconos. |
| SheetJS (xlsx-js-style) | Generación y formato de archivos Excel. |
| docx | Generación de documentos Word. |
| React Hot Toast | Notificaciones de la aplicación. |

## Requisitos previos

Para ejecutar el proyecto localmente se necesita:

- [Node.js](https://nodejs.org/) (versión compatible con Vite 8).
- npm (incluido con Node.js).
- Git.

## Instalación y ejecución

### 1. Clonar el repositorio

```bash
git clone https://github.com/cd17008/HerramientasPosgrado.git
```

### 2. Acceder al directorio

```bash
cd HerramientasPosgrado
```

### 3. Instalar dependencias

```bash
npm install
```

### 4. Ejecutar el servidor de desarrollo

```bash
npm run dev
```

Vite mostrará la dirección local donde estará disponible la aplicación, generalmente:

```text
http://localhost:5173
```

### 5. Generar versión de producción

Para generar los archivos optimizados de la aplicación:

```bash
npm run build
```

Los archivos generados se almacenarán en el directorio `dist/`.

Para visualizar la versión de producción localmente:

```bash
npm run preview
```

## Estructura del proyecto

La organización principal del código fuente es la siguiente:

```text
HerramientasPosgrado/
│
├── public/                  # Archivos públicos
│
├── src/
│   ├── const/               # Constantes y configuraciones académicas
│   │
│   ├── data/                # Catálogos y datos locales en JSON
│   │
│   ├── services/
│   │   ├── excel/           # Generación de archivos Excel
│   │   ├── word/            # Generación de documentos Word
│   │   └── catalogService.js
│   │
│   ├── utils/               # Funciones auxiliares
│   │
│   ├── App.jsx              # Componente principal
│   ├── CalendarioDocente.jsx # Herramienta de programación docente
│   ├── index.css            # Estilos globales
│   └── main.jsx             # Punto de entrada de React
│
├── index.html
├── package.json
├── package-lock.json
├── vite.config.js
└── README.md
```

## Scripts disponibles

| Comando | Descripción |
|---|---|
| `npm run dev` | Inicia el servidor de desarrollo. |
| `npm run build` | Construye la aplicación para producción. |
| `npm run preview` | Previsualiza la versión de producción. |
| `npm run lint` | Ejecuta ESLint para revisar el código. |

## Desarrollo y mantenimiento

El proyecto utiliza una arquitectura basada en componentes y servicios, buscando mantener separadas las responsabilidades de la interfaz, la lógica de procesamiento y la generación de documentos.

Para incorporar nuevas herramientas se recomienda:

1. Desarrollar cada herramienta en un componente independiente.
2. Mantener las operaciones de procesamiento de datos en módulos de servicios.
3. Centralizar los catálogos y configuraciones reutilizables.
4. Mantener separados los procesos de generación de documentos según su formato.
5. Reutilizar componentes y funciones auxiliares cuando sea posible.

## Repositorio

Código fuente: [github.com/cd17008/HerramientasPosgrado](https://github.com/cd17008/HerramientasPosgrado)

---

**Escuela de Posgrado**  
Facultad de Ingeniería y Arquitectura  
Universidad de El Salvador (UES)
