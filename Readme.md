# DOT — модульное веб‑приложение мгновенного обмена сообщениями

**DOT** — это модульное web-приложение для мгновенного обмена сообщениями с поддержкой аутентификации, истории чатов и отзывчивого интерфейса. Проект построен на **Vanilla JS** и сервисах **Firebase** (Cloud Firestore для хранения данных и Firebase Auth для аутентификации). Архитектура разделена на независимые модули (UI, логика, обработчики событий и др.) и следует событийной модели: фронтенд (клиентское приложение) напрямую общается с бекендом Firebase, реагируя на действия пользователя и обновления данных в реальном времени. Это означает, что интерфейс автоматически обновляется при появлении новых сообщений или изменении состояния без перезагрузки страницы.


DOT-main/
├── index.html
├── main.js
├── manifest.json
├── sw.js
├── Readme.md
├── css/
│   ├── index.css
│   ├── core/
│   │   └── dot-core.css
│   ├── layout/
│   │   ├── main.css
│   │   └── topbar.css
│   ├── theme/
│   │   └── light-dark.css
│   └── ui/
│       ├── bottom-panel.css
│       ├── contacts.css
│       ├── dot-mini.css
│       ├── drawer.css
│       └── login-modal.css
├── img/
│   ├── dot192.png
│   └── dot512.png
└── js/
    ├── main.js  ← точка входа
    ├── firebase/
    │   ├── auth.js
    │   ├── config.js
    │   └── db.js
    ├── handlers/
    │   ├── authHandlers.js
    │   ├── chatHandlers.js
    │   ├── contactHandlers.js
    │   ├── coreHandlers.js
    │   ├── dotCoreDrag.js
    │   ├── dotMoveHandler.js
    │   ├── swipeHandlers.js
    │   └── themeHandlers.js
    ├── theme/
    │   ├── dark.js
    │   ├── index.js
    │   └── light.js
    └── ui/
        ├── chat.js
        ├── contacts.js
        ├── core.js
        └── login.js

