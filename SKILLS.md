# Perfiles y Datos de Usuario (Contexto para IA)

## Estructura de Datos
Los datos base de cada perfil están en `assets/informacion/{rol}/castellano/`:
- `informacion-personal.txt` → `informacionPersonal`
- `experiencia-laboral.txt` → `experiencia` (JSON array)
- `tecnologias.txt` → `tecnologias` (líneas)
- `soft-skills.txt` → `softSkills` (líneas)
- `formacion.txt` → `formacion`
- `idiomas.txt` → `idiomas`
- `prompt.txt` → Prompt del sistema para IA
- `../foto_{rol}.jpg` → Foto del perfil

## Perfiles Base (Roles)

### 1. Desarrollador Frontend
- **Foto:** `/assets/foto_dev.jpg`
- **Prompt:** `assets/informacion/desarrollador/castellano/prompt.txt`
- **Soft Skills:** Análisis estructurado, Resolución de problemas, Mejora continua, Aprendizaje autónomo, Pensamiento crítico, Adaptabilidad, Autonomía, Flexibilidad, Comunicación efectiva, Orientación a la eficiencia.

### 2. Conductor VTC
- **Foto:** `/assets/foto_conductor.jpg`
- **Prompt:** `assets/informacion/conductor/castellano/prompt.txt`
- **Soft Skills:** Atención al cliente, Trato respetuoso, Comunicación clara, Gestión del estrés, Paciencia, Orientación al servicio, Puntualidad, Conducción segura, Adaptación a rutas, Resolución de incidencias.

### 3. Mozo de Almacén
- **Foto:** `/assets/foto_mozo.jpg`
- **Soft Skills:** Organización y orden, Atención al detalle, Trabajo en equipo, Gestión del tiempo, Resistencia física, Responsabilidad, Cumplimiento de procedimientos, Adaptación a ritmos intensos, Precisión, Seguridad.

## Datos Fijos del Usuario (NUNCA cambian)
- Nombre: Damián Nardini
- Teléfono: +34 717 719 387
- Dirección: 08018, Barcelona
- Email: damiannardini@gmail.com
- Web: www.damiannardini.com

## Instrucciones de Adaptación
1. **Sobre mí:** Reescribir `informacionPersonal` del perfil para que resuene con la oferta.
2. **Tecnologías:** Máximo 10 items. Priorizar las que aparecen en la oferta.
3. **Soft Skills:** Máximo 5 items. Seleccionar las que conecten con la cultura del puesto.
4. **Experiencia:** Adaptar tareas usando keywords de la oferta. Empresas, cargos y periodos SON REALES.
5. **Idiomas:** Siempre incluir los 3 idiomas fijos del usuario.
