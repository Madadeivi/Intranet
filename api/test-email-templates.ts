/**
 * Script de utilidad para testear las plantillas de email
 * Ejecutar con: node test-email-templates.js
 */

import { 
  generateTicketConfirmationEmail, 
  generateGeneralEmail, 
  generatePasswordResetEmail, 
  generateWelcomeEmail,
  TicketConfirmationData,
  GeneralEmailData 
} from './src/services/emailTemplateService.js';
import fs from 'fs';
import path from 'path';

// Crear directorio de output si no existe
const outputDir = './email-templates-preview';
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

console.log('🎨 Generando previsualizaciones de plantillas de email...\n');

// 1. Plantilla de confirmación de ticket
const ticketData: TicketConfirmationData = {
  userName: 'María González',
  ticketNumber: 'TCK-2024-001234',
  subject: 'Problema con acceso a nómina digital',
  category: 'technical',
  priority: 'High',
  message: 'No puedo acceder a mi información de nómina desde la intranet. Cuando intento iniciar sesión me muestra un error 404. He probado desde diferentes navegadores pero el problema persiste.',
  webUrl: 'https://desk.zoho.com/portal/coacharte/tickets/TCK-2024-001234',
  userEmail: 'maria.gonzalez@coacharte.mx'
};

const ticketEmailHtml = generateTicketConfirmationEmail(ticketData);
fs.writeFileSync(path.join(outputDir, 'ticket-confirmation.html'), ticketEmailHtml);
console.log('✅ Plantilla de confirmación de ticket: ticket-confirmation.html');

// 2. Plantilla de email general
const generalData: GeneralEmailData = {
  userName: 'Carlos Rodríguez',
  userEmail: 'carlos.rodriguez@coacharte.mx',
  subject: 'Actualización de políticas de la empresa',
  message: `
    <p>Te informamos que hemos actualizado nuestras políticas corporativas. Los principales cambios incluyen:</p>
    <ul>
      <li><strong>Política de trabajo remoto:</strong> Nuevas directrices para el trabajo híbrido</li>
      <li><strong>Beneficios adicionales:</strong> Ampliación del seguro médico familiar</li>
      <li><strong>Capacitación continua:</strong> Nuevos programas de desarrollo profesional</li>
    </ul>
    <p>Puedes consultar el documento completo en la sección de políticas de la intranet.</p>
  `
};

const generalEmailHtml = generateGeneralEmail(generalData);
fs.writeFileSync(path.join(outputDir, 'general-email.html'), generalEmailHtml);
console.log('✅ Plantilla de email general: general-email.html');

// 3. Plantilla de restablecimiento de contraseña
const passwordResetHtml = generatePasswordResetEmail(
  'Ana Martínez',
  'https://intranet.coacharte.mx/reset-password?token=abc123xyz789'
);
fs.writeFileSync(path.join(outputDir, 'password-reset.html'), passwordResetHtml);
console.log('✅ Plantilla de restablecimiento de contraseña: password-reset.html');

// 4. Plantilla de bienvenida
const welcomeHtml = generateWelcomeEmail(
  'Luis Hernández',
  'https://intranet.coacharte.mx/login'
);
fs.writeFileSync(path.join(outputDir, 'welcome-email.html'), welcomeHtml);
console.log('✅ Plantilla de bienvenida: welcome-email.html');

// 5. Generar diferentes prioridades para el ticket
const priorities = ['Low', 'Medium', 'High', 'Urgent'];
priorities.forEach(priority => {
  const testData = { ...ticketData, priority, ticketNumber: `TCK-2024-${priority.toUpperCase()}` };
  const html = generateTicketConfirmationEmail(testData);
  fs.writeFileSync(path.join(outputDir, `ticket-priority-${priority.toLowerCase()}.html`), html);
  console.log(`✅ Plantilla de ticket prioridad ${priority}: ticket-priority-${priority.toLowerCase()}.html`);
});

// 6. Generar diferentes categorías para el ticket
const categories = ['technical', 'general', 'nomina', 'other'];
categories.forEach(category => {
  const testData = { ...ticketData, category, ticketNumber: `TCK-2024-${category.toUpperCase()}` };
  const html = generateTicketConfirmationEmail(testData);
  fs.writeFileSync(path.join(outputDir, `ticket-category-${category}.html`), html);
  console.log(`✅ Plantilla de ticket categoría ${category}: ticket-category-${category}.html`);
});

console.log(`\n🎉 ¡Todas las plantillas generadas exitosamente!`);
console.log(`📁 Ubicación: ${path.resolve(outputDir)}`);
console.log(`\n💡 Para ver las plantillas, abre los archivos .html en tu navegador.`);
console.log(`\n🔧 Características implementadas:`);
console.log(`   • Diseño responsive compatible con todos los clientes de email`);
console.log(`   • Plantillas HTML profesionales con branding de Coacharte`);
console.log(`   • Soporte para modo oscuro y clientes de email`);
console.log(`   • Badges de prioridad con códigos de color`);
console.log(`   • Enlaces de acción con diseño moderno`);
console.log(`   • Footer corporativo con links de contacto`);
console.log(`   • Tipografía optimizada para legibilidad`);
console.log(`   • Gradientes y sombras sutiles para mejor UX`);
console.log(`   • Compatibilidad con Outlook, Gmail, Apple Mail, etc.`);
