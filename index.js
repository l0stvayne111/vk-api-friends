const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.urlencoded({extended: true}));
let hbs = require('hbs');
app.set('views', 'views');
app.set('view engine', 'hbs');

const appId = '51660210';
const appSecret = 'JmvIpCLgmRGUklHbgybG';
const redirectUri = 'http://localhost:8080/auth/callback';

hbs.registerHelper('getLastSeenTime', function (timestamp) {
    // Ваша логика форматирования времени
    // Пример:
    const lastSeen = new Date(timestamp * 1000); // Преобразование времени из секунд в миллисекунды
    return lastSeen.toLocaleString(); // Возвращаем отформатированную строку времени
});

app.get('/', (req, res) => {
    // Генерация URL для авторизации пользователя
    const authUrl = `https://oauth.vk.com/authorize?client_id=${appId}&redirect_uri=${redirectUri}&scope=friends&response_type=token&v=5.52`;

    res.render('index', {authUrl}); // Отправка HTML-страницы с ссылкой для авторизации
});

app.get('/auth/callback', async (req, res) => {
    res.render('vkToken'); // Отображение страницы с друзьями после успешной авторизации
});

app.post('/friends', async (req, res) => {
    const {ownerId, userAccessToken, message} = req.body;
    // Получение списка друзей пользователя
    axios.get('https://api.vk.com/method/friends.get', {
        params: {
            access_token: userAccessToken,
            fields: 'first_name,last_name,photo_200,last_seen', // Укажите нужные поля
            v: '5.131' // Версия API VK
        }
    })
        .then(friendsResponse => {
            const friends = friendsResponse.data.response.items;
            res.render('friends', {friends});
        })
        .catch(friendsError => {
            console.error('Ошибка при получении списка друзей:', friendsError);
        });
});

app.listen(8080, () => {
    console.log('Сервер запущен на порту 8080');
});

