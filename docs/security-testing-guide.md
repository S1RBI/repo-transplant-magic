
# Руководство по тестированию безопасности

Данное руководство представляет собой план тестирования безопасности для сайта учета волонтерской активности, находящегося по адресу http://serp2001ma.temp.swtest.ru. Руководство основано на стандартных практиках безопасности веб-приложений и адаптировано под технологический стек данного сайта.

## Оглавление
1. [Тестирование сетевой инфраструктуры](#1-тестирование-сетевой-инфраструктуры)
2. [Проверка на устойчивость к перебору паролей](#2-проверка-на-устойчивость-к-перебору-паролей)
3. [Поиск скрытых папок и файлов](#3-поиск-скрытых-папок-и-файлов)
4. [Тестирование на SQL-инъекции](#4-тестирование-на-sql-инъекции)
5. [Проверка на XSS-уязвимости](#5-проверка-на-xss-уязвимости)
6. [Проверка Content Security Policy](#6-проверка-content-security-policy)
7. [Тестирование API и аутентификации Supabase](#7-тестирование-api-и-аутентификации-supabase)
8. [Защита React-приложения](#8-защита-react-приложения)
9. [Тестирование CORS и заголовков безопасности](#9-тестирование-cors-и-заголовков-безопасности)

## 1. Тестирование сетевой инфраструктуры

### Сканирование портов и определение сервисов

Используем утилиту `nmap` для определения открытых портов и запущенных сервисов:

```bash
# Базовое сканирование портов
nmap -sV -Pn -p- -T4 serp2001ma.temp.swtest.ru

# Проверка на наличие уязвимостей в обнаруженных сервисах
nmap -sV -Pn serp2001ma.temp.swtest.ru --script=vulners.nse -p80,443
```

#### Что проверить:
- Порты 80/443 (HTTP/HTTPS) - веб-сервер
- Убедиться, что нет открытых админ-портов (8080, 8443)
- Проверить, что нет доступных портов баз данных (3306 для MySQL, 5432 для PostgreSQL)
- Проверить используемое ПО и его версии на уязвимости

### Проверка конфигурации веб-сервера

```bash
# Определение версии сервера и используемых технологий
nmap -sV --script=http-headers serp2001ma.temp.swtest.ru -p80,443
```

#### Исправление уязвимостей:
- Обновить ПО до последних версий
- Отключить ненужные порты и сервисы
- Скрыть баннеры, показывающие версии ПО
- Проверить `.htaccess` файл и правильность настроек безопасности

## 2. Проверка на устойчивость к перебору паролей

### Проверка форм авторизации

```bash
# Находим страницы авторизации
nmap -p80,443 --script http-auth-finder serp2001ma.temp.swtest.ru

# Проверка на brute-force (при необходимости создайте файлы users.lst и passwords.lst)
nmap --script http-form-brute -p80,443 serp2001ma.temp.swtest.ru --script-args "http-form-brute.path=/auth,http-form-brute.method=POST"
```

### Проверка API аутентификации Supabase

Поскольку ваш сайт использует Supabase для аутентификации, проверьте:

```bash
# Тестирование частоты запросов к API аутентификации
for i in {1..20}; do curl -X POST "https://*.supabase.co/auth/v1/token?grant_type=password" -H "Content-Type: application/json" -d '{"email":"test@example.com","password":"wrongpassword"}'; done
```

#### Рекомендации по защите:
- Внедрить ограничение частоты запросов (rate limiting)
- Использовать CAPTCHA после нескольких неудачных попыток
- Временно блокировать IP-адреса после множества неудачных попыток
- Проверить настройки безопасности аутентификации Supabase (в файле `supabase/config.toml`)

## 3. Поиск скрытых папок и файлов

### Сканирование директорий и файлов

```bash
# Поиск директорий и файлов
nmap -sV -p 80,443 --script http-enum serp2001ma.temp.swtest.ru

# Расширенный поиск с использованием dirb (если установлен)
dirb http://serp2001ma.temp.swtest.ru /usr/share/dirb/wordlists/common.txt
```

### Проверка robots.txt и других конфигурационных файлов

```bash
curl -s http://serp2001ma.temp.swtest.ru/robots.txt
curl -s http://serp2001ma.temp.swtest.ru/.htaccess
curl -s http://serp2001ma.temp.swtest.ru/sitemap.xml
```

#### Что следует проверить:
- Наличие закрытых от индексации страниц в robots.txt
- Доступ к .git, .svn, node_modules и другим директориям разработки
- Наличие файлов конфигурации (.env, config.js и т.д.)
- Доступность резервных копий (*.bak, *.old, *.backup)

#### Рекомендации:
- Ограничить доступ к служебным директориям через `.htaccess`
- Удалить ненужные файлы с сервера
- Скрыть конфиденциальные URLs в robots.txt
- В React-приложении убедиться, что исходные карты (source maps) отключены в production

## 4. Тестирование на SQL-инъекции

Поскольку ваш сайт использует Supabase (PostgreSQL), проверим соответствующие эндпоинты:

### Тестирование формы авторизации

```bash
# Проверка формы авторизации на SQL-инъекции
sqlmap -u "http://serp2001ma.temp.swtest.ru/auth" --data="email=test@example.com&password=testpassword" --dbs --random-agent
```

### Тестирование API-запросов к базе данных

```bash
# Проверка API-эндпоинтов с параметрами
sqlmap -u "http://serp2001ma.temp.swtest.ru/api/events?id=1" --dbs --random-agent

# Если API требует авторизации, добавляем заголовки
sqlmap -u "http://serp2001ma.temp.swtest.ru/api/events?id=1" --headers="Authorization: Bearer YOUR_TOKEN" --dbs --random-agent
```

### Проверка React-приложения

В React-приложениях SQL-инъекции обычно невозможны на фронтенде, но необходимо проверить:

```bash
# Поиск точек взаимодействия с API, которые могут быть уязвимы
grep -r "supabase\.from\(" --include="*.ts" --include="*.tsx" --include="*.js" ./src

# Проверка эндпоинтов, используемых в коде
grep -r "\.select\(" --include="*.ts" --include="*.tsx" --include="*.js" ./src
```

#### Рекомендации:
- Использовать параметризованные запросы (уже реализовано в Supabase)
- Проверять и фильтровать все входные данные
- Настроить правильные RLS (Row Level Security) политики в Supabase
- Минимизировать права доступа базы данных

## 5. Проверка на XSS-уязвимости

### Тестирование с использованием XSStrike

```bash
# Базовое сканирование главной страницы
python xsstrike.py -u "http://serp2001ma.temp.swtest.ru" --blind

# Проверка параметров URL
python xsstrike.py -u "http://serp2001ma.temp.swtest.ru/events?id=1" --blind

# Проверка форм (например, форма комментариев)
python xsstrike.py -u "http://serp2001ma.temp.swtest.ru/events/1" --data "comment=test" --blind
```

### Ручное тестирование

Вводим следующие строки в поля ввода и URL-параметры:

```
"><script>alert(1)</script>
javascript:alert(1)
<img src="x" onerror="alert(1)">
<svg onload="alert(1)">
```

#### Рекомендации по защите:
- Использовать React (это уже делается), который экранирует вывод по умолчанию
- Не использовать `dangerouslySetInnerHTML` без санитизации
- Проверять все входные данные от пользователя
- Использовать CSP (Content Security Policy) для блокирования исполнения нежелательных скриптов

## 6. Проверка Content Security Policy

### Анализ текущего CSP

```bash
# Проверка заголовков безопасности
curl -I http://serp2001ma.temp.swtest.ru

# Использование online-инструмента для анализа CSP
# Откройте сайт в браузере и используйте инструмент https://securityheaders.com
```

### Проверка настроек CSP в исходном коде

Проверьте файл `.htaccess` и мета-теги в HTML:

```html
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline' https://static.cloudflareinsights.com https://cdn.gpteng.co; connect-src 'self' https://generativelanguage.googleapis.com https://*.supabase.co https://static.cloudflareinsights.com; img-src 'self' data: blob: https:; style-src 'self' 'unsafe-inline';">
```

#### Рекомендации:
- Минимизировать использование `unsafe-inline` и `unsafe-eval`
- Ограничить источники скриптов (script-src) только необходимыми доменами
- Добавить `report-uri` для мониторинга нарушений CSP
- Рассмотреть использование `nonce` или `hash` для inline-скриптов вместо `unsafe-inline`

## 7. Тестирование API и аутентификации Supabase

### Проверка защиты API-эндпоинтов

```bash
# Тестирование без авторизации
curl -X GET http://serp2001ma.temp.swtest.ru/api/events

# Проверка с недействительным токеном
curl -X GET http://serp2001ma.temp.swtest.ru/api/events -H "Authorization: Bearer invalid_token"

# Проверка CSRF-защиты
curl -X POST http://serp2001ma.temp.swtest.ru/api/events \
  -H "Content-Type: application/json" \
  -d '{"title":"Test"}'
```

### Проверка настроек Supabase

Проверьте файл `supabase/config.toml` на наличие следующих настроек безопасности:

```toml
enable_strong_password_policy = true
min_password_length = 10
require_email_confirmation = true

[auth.email]
enable_signup = true
double_confirm_changes = true
enable_confirmations = true
```

#### Рекомендации:
- Внедрить проверку CSRF-токенов для всех POST-запросов
- Убедиться, что все API-эндпоинты правильно защищены аутентификацией
- Настроить корректные RLS-политики в Supabase
- Использовать JWT с коротким сроком действия
- Внедрить двухфакторную аутентификацию

## 8. Защита React-приложения

### Аудит зависимостей

```bash
# Проверка уязвимостей в зависимостях
npm audit

# Использование snyk для глубокого анализа (если установлен)
snyk test
```

### Проверка безопасного хранения данных

```javascript
// Проверить использование localStorage для чувствительных данных
grep -r "localStorage" --include="*.ts" --include="*.tsx" --include="*.js" ./src
```

#### Рекомендации:
- Регулярно обновлять зависимости
- Не хранить токены и чувствительные данные в localStorage (предпочтительнее httpOnly cookies)
- Минимизировать использование сторонних библиотек
- Использовать строгую типизацию (TypeScript)
- Избегать выполнения кода, полученного из ненадежных источников

## 9. Тестирование CORS и заголовков безопасности

### Проверка заголовков CORS

```bash
# Проверка ответа сервера на заголовки CORS
curl -H "Origin: https://example.com" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: X-Requested-With" \
  -X OPTIONS \
  --verbose \
  http://serp2001ma.temp.swtest.ru/api/events
```

### Анализ заголовков безопасности

```bash
# Проверка заголовков безопасности
curl -I http://serp2001ma.temp.swtest.ru
```

#### Что следует проверить:
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection: 1; mode=block
- Strict-Transport-Security (HSTS)
- Referrer-Policy: strict-origin-when-cross-origin
- Content-Security-Policy

#### Рекомендации:
- Настроить CORS только для доверенных доменов
- Установить все заголовки безопасности в `.htaccess`
- Если CORS не требуется, отключить его полностью
- Использовать HTTPS для всех соединений

## Дополнительные ресурсы

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Supabase Security Docs](https://supabase.io/docs/guides/auth)
- [React Security Best Practices](https://reactjs.org/docs/security.html)
- [Content Security Policy Reference](https://content-security-policy.com/)

## Заключение

Регулярное тестирование безопасности является критически важным для поддержания защищенного веб-приложения. Данное руководство представляет собой основу для тестирования безопасности сайта учета волонтерской активности. Рекомендуется проводить тестирование после каждого значительного обновления сайта и регулярно (не реже раза в квартал) проверять безопасность всего приложения.

