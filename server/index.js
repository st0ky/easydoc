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
server.listen(app.get('port'), function() {
  console.log('Node app is running on port ', app.get('port'));
});

var messages = [];
var users = [];

const nsp = io.of('/socket')

nsp.on('connection', function(socket) {

    users.push(socket.id);
    console.log('connection', socket.id)

    socket.emit('CONNECTION', socket.id);
    nsp.emit('UPDATE_USERS', users);
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

    socket.on('disconnect', function() {
        console.log('disconnect', socket.id)
        users = users.filter(function(user){
            return user != socket.id;
        });
        nsp.emit('UPDATE_USERS', users);
    });
});