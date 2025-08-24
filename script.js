// База коротких слов на транслите (3-5 букв)
const words = {
  3: ['mam', 'pap', 'son', 'dom', 'put', 'ryb', 'kot', 'pes', 'den', 'gol', 'nos', 'les', 'mir', 'god', 'vop', 'zal', 'sad', 'pal', 'tak', 'tam'],
  4: ['mama', 'papa', 'dama', 'luna', 'noga', 'ruka', 'golova', 'tele', 'foto', 'moto', 'kino', 'dver', 'park', 'gora', 'reka', 'pole', 'more', 'zima', 'leto', 'osen'],
  5: ['domik', 'gorod', 'ulica', 'maslo', 'vodka', 'pizza', 'kozak', 'baba', 'deda', 'semya', 'rabot', 'delo', 'zhizn', 'lyubov', 'deti', 'drug', 'chel', 'glaza', 'ruki', 'nogi']
};

// DOM элементы
const lengthSelect = document.getElementById('length');
const generateBtn = document.getElementById('generate');
const combineBtn = document.getElementById('combine');
const downloadBtn = document.getElementById('download'); // НОВАЯ КНОПКА
const wordsDiv = document.getElementById('words');
const combinationsDiv = document.getElementById('combinations');
const status = document.getElementById('status');
const shareTelegramBtn = document.getElementById('shareTelegram');

let generatedWords = [];
let combinedDomains = [];

// Генерация случайных слов БЕЗ дублей
function generateWords() {
  const len = lengthSelect.value;
  const wordList = words[len];
  const selected = new Set(); // Используем Set, чтобы избежать дублей

  // Пока не наберём 6 уникальных слов
  while (selected.size < 6) {
    const randomWord = wordList[Math.floor(Math.random() * wordList.length)];
    selected.add(randomWord);
  }

  generatedWords = Array.from(selected); // Преобразуем в массив
  renderWords();
  status.textContent = '';
}

// Отображение слов
function renderWords() {
  wordsDiv.innerHTML = '';
  generatedWords.forEach(word => {
    const tag = document.createElement('span');
    tag.className = 'word-tag';
    tag.textContent = word;
    wordsDiv.appendChild(tag);
  });
}

// Комбинирование слов: 3 уникальные комбинации
function combineWords() {
  if (generatedWords.length === 0) {
    status.textContent = 'Сначала сгенерируйте слова!';
    return;
  }

  combinedDomains = [];
  const usedCombinations = new Set();

  // Генерируем 3 уникальные комбинации
  while (combinedDomains.length < 3 && usedCombinations.size < 100) {
    const w1 = generatedWords[Math.floor(Math.random() * generatedWords.length)];
    let w2 = generatedWords[Math.floor(Math.random() * generatedWords.length)];

    // Убедимся, что w1 ≠ w2
    if (w1 === w2) continue;

    const combo = w1 + w2;

    // Проверяем, не было ли такой комбинации
    if (usedCombinations.has(combo)) continue;

    usedCombinations.add(combo);
    combinedDomains.push(combo);
  }

  renderCombinations();
  status.textContent = '';
}

// Отображение комбинаций
function renderCombinations() {
  combinationsDiv.innerHTML = '';
  combinedDomains.forEach(combo => {
    const tag = document.createElement('span');
    tag.className = 'combo-tag';
    tag.textContent = combo;
    combinationsDiv.appendChild(tag);
  });
}

// === ФУНКЦИЯ: Скачать результат в .txt файле ===
function downloadResults() {
  if (combinedDomains.length === 0) {
    status.textContent = 'Нет комбинаций для скачивания!';
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.showPopup({
        title: "Ошибка",
        message: "Сначала нажмите 'Скомбинировать'.",
        buttons: [{ type: "ok" }]
      });
    }
    return;
  }

  // Форматируем содержимое файла
  const lines = [
    '=== Translit Domain Generator ===',
    'Генератор коротких имён для Telegram и доменов',
    'Создано: ' + new Date().toLocaleString('ru-RU'),
    '',
    ...combinedDomains.map(d => d.trim()).filter(Boolean),
    '',
    '--- Конец списка ---'
  ];

  const textToSave = lines.join('\n');

  // Создаём файл
  const blob = new Blob([textToSave], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `translit-domains-${new Date().toISOString().slice(0,10)}.txt`;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  // Сообщение об успехе
  status.textContent = 'Файл сохранён!';
  setTimeout(() => {
    status.textContent = '';
  }, 2000);

  // Уведомление в Telegram (если используется как Mini App)
  if (window.Telegram?.WebApp) {
    window.Telegram.WebApp.showNotification?.('Файл сохранён');
  }
}

// === Обработчики событий ===
generateBtn.addEventListener('click', generateWords);
combineBtn.addEventListener('click', combineWords);
downloadBtn.addEventListener('click', downloadResults); // ← Обработчик для кнопки "Скачать"
shareTelegramBtn.addEventListener('click', shareToTelegram);
// === Инициализация при загрузке ===
window.onload = () => {
  generateWords(); // Генерируем слова при старте

  // Поддержка Telegram Mini App
  if (window.Telegram?.WebApp) {
    window.Telegram.WebApp.expand();
    window.Telegram.WebApp.ready();
    window.Telegram.WebApp.setHeaderColor('#f0f4f8');
    // Можно скрыть кнопку "назад"
    // window.Telegram.WebApp.BackButton.show();
  }
};

// Функция: поделиться в Telegram
function shareToTelegram() {
  if (combinedDomains.length === 0) {
    status.textContent = 'Нечего делиться!';
    return;
  }

  const message = `
🌐 *Translit Domain Generator*  
Вот несколько идей для юзернеймов/каналов:

${combinedDomains.map(d => '• `' + d + '`').join('\n')}

Создано через TMA-приложение.
`.trim();

  // Открываем чат с ботом или в Telegram
  if (window.Telegram?.WebApp) {
    // Если внутри Telegram Mini App — можно отправить в любой чат
    window.Telegram.WebApp.openTelegramLink(`https://t.me/share/url?url=&text=${encodeURIComponent(message)}`);
  } else {
    // В обычном браузере — просто открыть ссылку
    const url = `https://t.me/share/url?url=&text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  }
}