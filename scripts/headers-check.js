
/**
 * Скрипт для проверки заголовков безопасности HTTP
 * Для использования из Node.js сохраните в файл и запустите с помощью node headers-check.js
 */

const https = require('https');
const http = require('http');

// URL сайта для проверки
const url = 'http://serp2001ma.temp.swtest.ru';

// Парсинг URL для определения протокола
const isHttps = url.startsWith('https://');
const client = isHttps ? https : http;
const hostname = url.replace(/^https?:\/\//, '').split('/')[0];

console.log(`\n🔍 Проверка заголовков безопасности для ${url}\n`);

const securityHeaders = {
  'Strict-Transport-Security': {
    description: 'Этот заголовок обеспечивает использование HTTPS вместо HTTP',
    recommendation: 'max-age=31536000; includeSubDomains; preload',
    importance: 'Высокая'
  },
  'Content-Security-Policy': {
    description: 'Определяет разрешенные источники контента',
    recommendation: 'Настроить source-директивы для разрешения только необходимых источников контента',
    importance: 'Критическая'
  },
  'X-Content-Type-Options': {
    description: 'Предотвращает MIME-снифинг',
    recommendation: 'nosniff',
    importance: 'Средняя'
  },
  'X-Frame-Options': {
    description: 'Защищает от clickjacking атак',
    recommendation: 'DENY или SAMEORIGIN',
    importance: 'Высокая'
  },
  'X-XSS-Protection': {
    description: 'Включает фильтры XSS в браузере',
    recommendation: '1; mode=block',
    importance: 'Средняя'
  },
  'Referrer-Policy': {
    description: 'Контролирует информацию Referrer для запросов',
    recommendation: 'strict-origin-when-cross-origin или no-referrer',
    importance: 'Средняя'
  },
  'Permissions-Policy': {
    description: 'Ограничивает доступ к функциям браузера и API',
    recommendation: 'Настроить для ограничения доступа к API геолокации, камере и т.д.',
    importance: 'Средняя'
  },
  'Cache-Control': {
    description: 'Управляет кэшированием данных',
    recommendation: 'no-store, max-age=0 для страниц с чувствительными данными',
    importance: 'Средняя'
  }
};

const options = {
  hostname: hostname,
  port: isHttps ? 443 : 80,
  path: '/',
  method: 'GET'
};

const req = client.request(options, (res) => {
  console.log(`📊 Статус ответа: ${res.statusCode}`);
  console.log(`\n📋 Проверка заголовков безопасности:\n`);
  
  let presentHeaders = 0;
  const headers = res.headers;
  
  // Проверяем наличие каждого заголовка безопасности
  Object.keys(securityHeaders).forEach((header) => {
    const headerLower = header.toLowerCase();
    const found = Object.keys(headers).find(h => h.toLowerCase() === headerLower);
    
    if (found) {
      presentHeaders++;
      console.log(`✅ ${header}: ${headers[found]}`);
    } else {
      console.log(`❌ ${header} отсутствует`);
      console.log(`   - Важность: ${securityHeaders[header].importance}`);
      console.log(`   - Описание: ${securityHeaders[header].description}`);
      console.log(`   - Рекомендация: ${securityHeaders[header].recommendation}\n`);
    }
  });
  
  // Проверяем наличие дополнительных заголовков
  console.log(`\n📋 Другие обнаруженные заголовки:\n`);
  Object.keys(headers).forEach((header) => {
    const headerUpper = header.toUpperCase();
    if (!Object.keys(securityHeaders).some(h => h.toUpperCase() === headerUpper)) {
      console.log(`ℹ️ ${header}: ${headers[header]}`);
    }
  });
  
  // Общая оценка
  console.log(`\n📈 Итоговая оценка: ${presentHeaders}/${Object.keys(securityHeaders).length} заголовков безопасности реализовано`);
  
  // Рекомендации
  console.log(`\n💡 Общие рекомендации:\n`);
  if (!isHttps) {
    console.log(`⚠️ Сайт использует HTTP вместо HTTPS. Настоятельно рекомендуется перейти на HTTPS.`);
  }
  
  if (!headers['content-security-policy']) {
    console.log(`⚠️ Отсутствует Content-Security-Policy, что существенно снижает защиту от XSS атак.`);
  }
  
  if (!headers['strict-transport-security'] && isHttps) {
    console.log(`⚠️ Рекомендуется добавить Strict-Transport-Security для обеспечения HTTPS соединений.`);
  }
  
  console.log(`\n📚 Полезные ресурсы для улучшения безопасности:`);
  console.log(`- https://securityheaders.com`);
  console.log(`- https://content-security-policy.com`);
  console.log(`- https://observatory.mozilla.org`);
});

req.on('error', (error) => {
  console.error(`❌ Ошибка при выполнении запроса: ${error.message}`);
});

req.end();
