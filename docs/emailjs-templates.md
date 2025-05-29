# Plantillas de EmailJS para Soporte Técnico

## Configuración en EmailJS Dashboard

### 1. Template para Ticket de Soporte (Principal)

**Nombre del Template:** `support_ticket_template`

**Asunto del Email:**
```
{{subject}}
```

**Contenido del Email:**
```html
<!DOCTYPE html>
<html>
<head>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f9f9f9;
        }
        .header {
            background-color: #2c3e50;
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 5px 5px 0 0;
        }
        .content {
            background-color: white;
            padding: 30px;
            border-radius: 0 0 5px 5px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }
        .info-row {
            margin: 10px 0;
            padding: 10px;
            background-color: #f5f5f5;
            border-left: 4px solid #3498db;
        }
        .priority-urgent {
            border-left-color: #e74c3c !important;
        }
        .priority-high {
            border-left-color: #f39c12 !important;
        }
        .priority-medium {
            border-left-color: #3498db !important;
        }
        .priority-low {
            border-left-color: #95a5a6 !important;
        }
        .message-box {
            margin: 20px 0;
            padding: 20px;
            background-color: #f8f9fa;
            border-radius: 5px;
        }
        .footer {
            margin-top: 20px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            font-size: 12px;
            color: #666;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Nuevo Ticket de Soporte</h1>
            <p>ID: {{ticket_id}}</p>
        </div>
        
        <div class="content">
            <h2>Información del Ticket</h2>
            
            <div class="info-row">
                <strong>Usuario:</strong> {{from_name}}
            </div>
            
            <div class="info-row">
                <strong>Email:</strong> {{from_email}}
            </div>
            
            <div class="info-row">
                <strong>Categoría:</strong> {{category}}
            </div>
            
            <div class="info-row priority-{{priority}}">
                <strong>Prioridad:</strong> {{priority}}
            </div>
            
            <h3>Mensaje del Usuario:</h3>
            <div class="message-box">
                {{message}}
            </div>
            
            <div class="footer">
                <p>Este ticket ha sido enviado a través del sistema de Intranet de Coacharte.</p>
                <p>Para responder, utiliza el email: {{reply_to}}</p>
            </div>
        </div>
    </div>
</body>
</html>
```

**Configuración del Template:**
- **To Email:** `{{to_email}}`
- **Reply To:** `{{reply_to}}`
- **From Name:** `Sistema de Soporte Coacharte`

### 2. Template de Confirmación para el Usuario

**Nombre del Template:** `support_confirmation_template`

**Asunto del Email:**
```
Confirmación de Ticket #{{ticket_id}} - Soporte Coacharte
```

**Contenido del Email:**
```html
<!DOCTYPE html>
<html>
<head>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background-color: #27ae60;
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 5px;
        }
        .content {
            background-color: #f9f9f9;
            padding: 30px;
            margin-top: 20px;
            border-radius: 5px;
        }
        .ticket-info {
            background-color: white;
            padding: 20px;
            border-radius: 5px;
            margin: 20px 0;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }
        .button {
            display: inline-block;
            padding: 12px 30px;
            background-color: #3498db;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            font-size: 12px;
            color: #666;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>¡Ticket Recibido!</h1>
            <p>Hemos recibido tu solicitud de soporte</p>
        </div>
        
        <div class="content">
            <p>Hola {{to_name}},</p>
            
            <p>Gracias por contactar con nuestro equipo de soporte. Hemos recibido tu solicitud y la estamos procesando.</p>
            
            <div class="ticket-info">
                <h2>Detalles del Ticket</h2>
                <p><strong>Número de Ticket:</strong> #{{ticket_id}}</p>
                <p><strong>Fecha de Creación:</strong> {{current_date}}</p>
                <p><strong>Email de Contacto:</strong> {{to_email}}</p>
            </div>
            
            <h3>¿Qué sigue?</h3>
            <ol>
                <li>Un miembro de nuestro equipo revisará tu solicitud</li>
                <li>Te contactaremos en las próximas 24-48 horas hábiles</li>
                <li>Recibirás actualizaciones sobre el estado de tu ticket por email</li>
            </ol>
            
            <p>Si necesitas agregar información adicional a tu ticket, puedes responder directamente a este email o contactarnos en:</p>
            
            <p style="text-align: center;">
                <strong>{{support_email}}</strong>
            </p>
            
            <p>Recuerda incluir tu número de ticket (#{{ticket_id}}) en cualquier comunicación.</p>
        </div>
        
        <div class="footer">
            <p>Este es un mensaje automático del Sistema de Soporte de Coacharte</p>
            <p>Por favor, no respondas directamente a este email</p>
        </div>
    </div>
</body>
</html>
```

**Configuración del Template:**
- **To Email:** `{{to_email}}`
- **From Name:** `Soporte Coacharte`

## Variables del Template

### Para el Template Principal (support_ticket_template):
- `{{to_email}}`: support@coacharte.zohodesk.com
- `{{from_email}}`: Email del usuario que envía el ticket
- `{{from_name}}`: Nombre del usuario
- `{{ticket_id}}`: ID único del ticket
- `{{subject}}`: Asunto del ticket (incluye el ID)
- `{{category}}`: Categoría del ticket
- `{{priority}}`: Prioridad del ticket
- `{{message}}`: Mensaje detallado del usuario
- `{{reply_to}}`: Email del usuario para respuestas

### Para el Template de Confirmación (support_confirmation_template):
- `{{to_email}}`: Email del usuario
- `{{to_name}}`: Nombre del usuario
- `{{ticket_id}}`: ID del ticket creado
- `{{support_email}}`: support@coacharte.zohodesk.com
- `{{current_date}}`: Fecha actual (puedes usar JavaScript en EmailJS)

## Configuración en tu código

Una vez creados los templates en EmailJS, actualiza tu archivo `.env`:

```env
VITE_EMAILJS_SERVICE_ID=service_hwlq54m
VITE_EMAILJS_TEMPLATE_ID=template_dzed7rq  # ID del template principal
VITE_EMAILJS_CONFIRMATION_TEMPLATE_ID=template_xxxxx  # ID del template de confirmación
VITE_EMAILJS_USER_ID=iyWnchkhs-twgrK0O
```

## Pasos para configurar en EmailJS:

1. **Inicia sesión** en [EmailJS Dashboard](https://dashboard.emailjs.com)

2. **Crea los templates**:
   - Ve a "Email Templates"
   - Click en "Create New Template"
   - Copia y pega el contenido HTML correspondiente
   - Configura las variables como se indica

3. **Configura el servicio de email**:
   - Asegúrate de que tu servicio esté configurado correctamente
   - Verifica que el servicio tenga permisos para enviar emails

4. **Prueba los templates**:
   - Usa la función de prueba en EmailJS
   - Verifica que todas las variables se reemplacen correctamente

5. **Actualiza tu código** si necesitas usar diferentes templates