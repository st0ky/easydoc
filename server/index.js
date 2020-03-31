var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

const cors = require('cors');
const bodyParser = require('body-parser');
const morgan = require('morgan');


app.set('port', (process.env.PORT || 3000));
app.use('/npm', express.static('node_modules'));

// app.use(morgan('tiny'));
// app.use(cors());
// app.use(bodyParser.json());

// app.get('/', (req, res) => {
//     res.json({
//         message: 'Behold The MEVN Stack!'
//     });
// });
server.listen(app.get('port'), function () {
    console.log('Node app is running on port ', app.get('port'));
});

var messages = [];
var users = [];

const nsp = io.of('/socket')

const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')

const adapter = new FileSync('db.json')
const db = low(adapter)
db.defaults({
    notes: {
        '-2': {
            id: -2,
            title: 'Description',
            content: 'Here you will write your description of the project',
            tags: [],
            links: [],
            created: Date.now(),
            edited: Date.now()
        },
        '-1': {
            id: -1,
            title: 'unrelated',
            content: '',
            tags: [],
            links: [],
            created: Date.now(),
            edited: Date.now()
        },
        0: {
            id: 0,
            title: 'hello - 0',
            content: '## 0\nhere is my תוכן. i like לכתוב בעברית...',
            tags: ['hey', 'vuln', 'interesting'],
            links: ['note-id://1'],
            created: Date.now(),
            edited: Date.now()
        },
        1: {
            id: 1,
            title: 'hello - 1',
            content: '## 1\nhere is my תוכן. i like לכתוב בעברית...',
            tags: ['hey', 'interesting'],
            links: ['note-id://0'],
            created: Date.now(),
            edited: Date.now()
        },
        2: {
            id: 2,
            title: 'hello - 2',
            content: '## 2\nhere is my תוכן. i like לכתוב בעברית...',
            tags: ['hey', 'interesting'],
            links: ['note-id://0'],
            created: Date.now(),
            edited: Date.now()
        },
        3: {
            id: 3,
            title: 'hello - 3',
            content: '## 3\nhere is my תוכן. i like לכתוב בעברית...',
            tags: ['hey', 'interesting'],
            links: ['note-id://0'],
            created: Date.now(),
            edited: Date.now()
        }
    },
    trees: {
        '1': {
            note: 1,
            children: [
                { note: 2, children: [] },
                { note: 3, children: [] }
            ]
        }
    }, fileTrees: {}
}).write()

nsp.on('connection', function (socket) {

    users.push(socket.id);
    console.log('connection', socket.id)

    socket.emit('CONNECTION', socket.id);
    socket.emit('STATE', 'init notes');
    socket.emit("NEW_NOTES", db.get('notes'))
    socket.emit('STATE', 'init trees');
    socket.emit("NEW_TREES", db.get('trees'))
    socket.emit('STATE', 'init fileTrees');
    socket.emit("NEW_FILETREES", db.get('fileTrees'))
    socket.emit('STATE', 'ready');


    // socket.emit('update-users', users);

    // socket.on('send-msg', function(data) {
    //     var newMessage = { text : data.message, user : data.user, date : dateFormat(new Date(), 'shortTime') };
    //     messages.push(newMessage);
    //     nsp.emit('read-msg', newMessage);
    // });

    // socket.on('add-user', function(user){
    //     users.push({ id: socket.id, name: user });
    //     nsp.emit('update-users', users);
    // });

    socket.on('disconnect', function () {
        console.log('disconnect', socket.id)
        users = users.filter(function (user) {
            return user != socket.id;
        });
        nsp.emit('UPDATE_USERS', users);
    });
});