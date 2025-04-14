
/**
 * Скрипт для анализа CSP (Content Security Policy) сайта
 * Для использования вставьте этот скрипт в консоль разработчика на тестируемом сайте
 */

(function() {
  console.log('%c CSP Analyzer - Анализ настроек безопасности контента', 'background: #3498db; color: white; font-size: 16px; padding: 10px;');

  // Получаем мета-теги CSP
  const cspMetaTags = Array.from(document.querySelectorAll('meta[http-equiv="Content-Security-Policy"]'));
  
  // Получаем CSP из заголовков (это работает только если вы запускаете скрипт сразу после загрузки страницы)
  let cspHeaders = [];
  const perfEntries = performance.getEntriesByType("navigation");
  
  if (perfEntries && perfEntries.length > 0) {
    const navEntry = perfEntries[0];
    if (navEntry.securityPolicy) {
      cspHeaders.push(navEntry.securityPolicy);
    }
  }
  
  console.log('%c CSP из мета-тегов:', 'font-weight: bold;');
  if (cspMetaTags.length > 0) {
    cspMetaTags.forEach((tag, i) => {
      console.log(`${i + 1}. ${tag.getAttribute('content')}`);
    });
  } else {
    console.log('Мета-теги CSP не найдены');
  }
  
  console.log('%c CSP из заголовков:', 'font-weight: bold;');
  if (cspHeaders.length > 0) {
    cspHeaders.forEach((header, i) => {
      console.log(`${i + 1}. ${header}`);
    });
  } else {
    console.log('Информация о CSP из заголовков недоступна через JavaScript API');
    console.log('Используйте инструменты разработчика во вкладке Network для просмотра заголовков');
  }
  
  // Анализ текущих политик
  console.log('%c Анализ CSP:', 'font-weight: bold;');
  
  const allPolicies = [...cspMetaTags.map(tag => tag.getAttribute('content')), ...cspHeaders];
  
  if (allPolicies.length === 0) {
    console.warn('⚠️ CSP не найден. Рекомендуется добавить CSP для улучшения безопасности.');
    return;
  }
  
  allPolicies.forEach((policy, i) => {
    console.log(`%c Анализ политики #${i + 1}:`, 'text-decoration: underline;');
    
    // Проверка наличия unsafe-inline
    if (policy.includes("'unsafe-inline'")) {
      console.warn('⚠️ Обнаружено \'unsafe-inline\'. Это снижает защиту от XSS атак.');
    }
    
    // Проверка наличия unsafe-eval
    if (policy.includes("'unsafe-eval'")) {
      console.warn('⚠️ Обнаружено \'unsafe-eval\'. Это позволяет выполнение строк как кода.');
    }
    
    // Проверка default-src
    if (!policy.includes('default-src')) {
      console.warn('⚠️ default-src не указан. Рекомендуется добавить default-src как резервную политику.');
    }
    
    // Проверка script-src
    if (!policy.includes('script-src')) {
      console.warn('⚠️ script-src не указан. Контролируйте источники скриптов для улучшения безопасности.');
    }
    
    // Проверка на использование report-uri
    if (!policy.includes('report-uri')) {
      console.info('ℹ️ report-uri не указан. Рекомендуется добавить для мониторинга нарушений CSP.');
    }
    
    // Проверка на star в sources
    const hasWildcardSources = /\s\*\s|:\*\s/.test(policy);
    if (hasWildcardSources) {
      console.warn('⚠️ Обнаружены wildcard источники (*). Это снижает эффективность CSP.');
    }
  });
  
  console.log('%c Рекомендации по CSP:', 'font-weight: bold;');
  console.log(`
  1. Избегайте 'unsafe-inline' и 'unsafe-eval'
  2. Укажите все необходимые директивы: default-src, script-src, style-src, img-src, connect-src
  3. Ограничьте источники конкретными доменами
  4. Добавьте report-uri для мониторинга нарушений
  5. Используйте nonce или hash вместо 'unsafe-inline'
  6. Протестируйте CSP на https://csp-evaluator.withgoogle.com/
  `);
  
  console.log('%c Другие заголовки безопасности:', 'font-weight: bold;');
  console.log(`
  Также рекомендуется проверить наличие следующих заголовков:
  - X-Content-Type-Options: nosniff
  - X-Frame-Options: DENY
  - X-XSS-Protection: 1; mode=block
  - Strict-Transport-Security (HSTS)
  - Referrer-Policy
  `);
})();
