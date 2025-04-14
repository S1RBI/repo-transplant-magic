
#!/bin/bash

# Скрипт для автоматизированного тестирования безопасности сайта волонтерской активности
# Адаптируйте этот скрипт под свои нужды

# Конфигурация
TARGET="http://serp2001ma.temp.swtest.ru"
OUTPUT_DIR="security_reports/$(date +%Y-%m-%d)"
PORTS_TO_CHECK="80,443,8080,8443,3306,5432"

# Создаем директорию для отчетов
mkdir -p "$OUTPUT_DIR"

echo "===== Тестирование безопасности сайта волонтерской активности ====="
echo "Сайт: $TARGET"
echo "Дата: $(date)"
echo "Отчеты будут сохранены в: $OUTPUT_DIR"
echo "=================================================================="

# 1. Сканирование портов и определение сервисов
echo "[+] Сканирование портов и сервисов..."
nmap -sV -Pn -p "$PORTS_TO_CHECK" "$TARGET" -oN "$OUTPUT_DIR/nmap_ports.txt"

# 2. Проверка на уязвимости в сервисах
echo "[+] Проверка на уязвимости в обнаруженных сервисах..."
nmap -sV -Pn "$TARGET" --script=vulners.nse -p "$PORTS_TO_CHECK" -oN "$OUTPUT_DIR/nmap_vulners.txt"

# 3. Проверка HTTP заголовков
echo "[+] Анализ HTTP заголовков..."
nmap -sV --script=http-headers "$TARGET" -p 80,443 -oN "$OUTPUT_DIR/http_headers.txt"

# 4. Поиск скрытых директорий и файлов
echo "[+] Поиск скрытых директорий и файлов..."
nmap -sV -p 80,443 --script http-enum "$TARGET" -oN "$OUTPUT_DIR/http_enum.txt"

# 5. Проверка robots.txt
echo "[+] Проверка robots.txt..."
curl -s "$TARGET/robots.txt" -o "$OUTPUT_DIR/robots.txt"

# 6. Проверка защиты от перебора
echo "[+] Проверка защиты от перебора (тестовые запросы)..."
for i in {1..5}; do 
  curl -s -X POST "$TARGET/auth" -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"wrongpassword'$i'"}' \
    -o "$OUTPUT_DIR/brute_force_test_$i.json"
  # Делаем паузу между запросами, чтобы не вызывать защиту от перебора
  sleep 1
done

# 7. Проверка заголовков безопасности
echo "[+] Анализ заголовков безопасности..."
curl -sI "$TARGET" -o "$OUTPUT_DIR/security_headers.txt"

# 8. Проверка доступности API без авторизации
echo "[+] Проверка доступности API без авторизации..."
curl -s "$TARGET/api/events" -o "$OUTPUT_DIR/api_no_auth.json"
curl -s "$TARGET/api/volunteers" -o "$OUTPUT_DIR/api_volunteers_no_auth.json"

# 9. Простой тест XSS
echo "[+] Простой тест на XSS уязвимости (проверяем ответ)..."
curl -s "$TARGET/events?search=<script>alert(1)</script>" -o "$OUTPUT_DIR/xss_test.html"

# 10. Проверка CORS
echo "[+] Проверка настроек CORS..."
curl -sH "Origin: https://example.com" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: X-Requested-With" \
  -X OPTIONS \
  "$TARGET/api/events" -v 2> "$OUTPUT_DIR/cors_test.txt"

# 11. Формируем сводный отчет
echo "[+] Формирование сводного отчета..."
{
  echo "# Отчет по безопасности - $(date)"
  echo "## Сайт: $TARGET"
  echo
  echo "## 1. Открытые порты и сервисы"
  echo '```'
  cat "$OUTPUT_DIR/nmap_ports.txt"
  echo '```'
  echo
  echo "## 2. Обнаруженные уязвимости в сервисах"
  echo '```'
  cat "$OUTPUT_DIR/nmap_vulners.txt"
  echo '```'
  echo
  echo "## 3. HTTP заголовки"
  echo '```'
  cat "$OUTPUT_DIR/http_headers.txt"
  echo '```'
  echo
  echo "## 4. Скрытые директории и файлы"
  echo '```'
  cat "$OUTPUT_DIR/http_enum.txt"
  echo '```'
  echo
  echo "## 5. Заголовки безопасности"
  echo '```'
  cat "$OUTPUT_DIR/security_headers.txt"
  echo '```'
  echo
  echo "## 6. Рекомендации"
  echo "1. Обновите версии сервисов, если обнаружены уязвимости"
  echo "2. Настройте правильные заголовки безопасности (CSP, X-Frame-Options и т.д.)"
  echo "3. Ограничьте доступ к непубличным API"
  echo "4. Внедрите защиту от перебора (rate limiting)"
  echo "5. Проверьте все пользовательские входные данные на XSS и SQL инъекции"
} > "$OUTPUT_DIR/security_report.md"

echo "[✓] Тестирование завершено! Отчет сохранен в $OUTPUT_DIR/security_report.md"
