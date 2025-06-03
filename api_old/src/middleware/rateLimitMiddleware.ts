import rateLimit from 'express-rate-limit';

/**
 * Rate limiter para rutas de autenticación (login, set-password)
 * Configuración estricta para prevenir ataques de fuerza bruta
 */
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // Máximo 5 intentos por IP en la ventana de tiempo
  message: {
    error: 'Demasiados intentos de autenticación. Intenta de nuevo en 15 minutos.',
    retryAfter: '15 minutos'
  },
  standardHeaders: true, // Incluir headers `RateLimit-*` en la respuesta
  legacyHeaders: false, // Deshabilitar headers `X-RateLimit-*`
  
  // Función personalizada para generar la clave (por defecto usa IP)
  keyGenerator: (req) => {
    // Considerar IP y user-agent para mejor identificación
    return `${req.ip}-${req.get('User-Agent') || 'unknown'}`;
  },

  // Handler personalizado para cuando se excede el límite
  handler: (req, res) => {
    console.warn('Rate limit exceeded for IP: %s, URL: %s, Time: %s', req.ip, req.originalUrl, new Date().toISOString());
    
    res.status(429).json({
      error: 'Demasiados intentos de autenticación',
      message: 'Has excedido el límite de intentos. Por favor, espera 15 minutos antes de intentar de nuevo.',
      retryAfter: '15 minutos',
      timestamp: new Date().toISOString()
    });
  },

  // Skip function para excluir ciertas requests (opcional)
  skip: (_req) => {
    // En desarrollo, se puede considerar no aplicar rate limiting
    // return process.env.NODE_ENV === 'development';
    return false; // Aplicar siempre para máxima seguridad
  }
});

/**
 * Rate limiter menos estricto para endpoints generales
 * Protege contra DoS pero permite más requests normales
 */
export const generalRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // 100 requests por IP en la ventana de tiempo
  message: {
    error: 'Demasiadas solicitudes desde esta IP.',
    retryAfter: '15 minutos'
  },
  standardHeaders: true,
  legacyHeaders: false,
  
  handler: (req, res) => {
    console.warn('General rate limit exceeded for IP: %s, URL: %s, Time: %s', req.ip, req.originalUrl, new Date().toISOString());
    
    res.status(429).json({
      error: 'Demasiadas solicitudes',
      message: 'Has excedido el límite de solicitudes. Por favor, reduce la frecuencia de tus requests.',
      retryAfter: '15 minutos',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * Rate limiter para endpoints de password reset
 * Balance entre seguridad y usabilidad
 */
export const passwordResetRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 3, // Máximo 3 solicitudes de reset por hora
  message: {
    error: 'Demasiadas solicitudes de restablecimiento de contraseña.',
    retryAfter: '1 hora'
  },
  standardHeaders: true,
  legacyHeaders: false,
  
  keyGenerator: (req) => {
    // Para reset de password, considerar también el email si está disponible
    const email = req.body?.email || 'unknown';
    return `${req.ip}-${email}`;
  },

  handler: (req, res) => {
    console.warn('Password reset rate limit exceeded for IP: %s, Email: %s, Time: %s', req.ip, req.body?.email || 'unknown', new Date().toISOString());
    
    res.status(429).json({
      error: 'Demasiadas solicitudes de restablecimiento',
      message: 'Has excedido el límite de solicitudes de restablecimiento de contraseña. Intenta de nuevo en 1 hora.',
      retryAfter: '1 hora',
      timestamp: new Date().toISOString()
    });
  }
});
