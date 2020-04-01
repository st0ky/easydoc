var _ = require('lodash');
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
const noteEditableFields = ['title', 'content', 'tags', 'links']
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
            '1': { note: 1, children: [2, 3], parent: null },
            '2': { note: 2, children: [], parent: 1 },
            '3': { note: 3, children: [], parent: 1 }
        }

    }, tags: [], fileTrees: {}
}).write()

function deleteTreeNode (treeId, tree, noteId) {
    let queue = [noteId]
    while (queue.length) {
        let tmp = queue.pop()
        queue = _.extend(queue, tree.get(tmp).value().children)
        tree.unset(tmp).write()
    }
    nsp.emit('DELETE_TREE_NODE', { tree: treeId, noteId: noteId })
}

function createNewNote (fields) {
    let note = { title: '', content: '', tags: [], links: [] }
    for (let field of Object.keys(fields)) {
        if (noteEditableFields.indexOf(field) == -1) continue
        note[field] = fields[field]
    }
    notes = db.get('notes')
    note.id = parseInt(notes.keys().max()) + 1
    note.created = Date.now()
    note.edited = Date.now()
    notes.set(note.id, note).write()
    nsp.emit('NEW_NOTE', note)
    return note.id
}

function emitTreeNotes (socket) {
    let notes = db.get('trees').keys()
    notes = notes.concat(...db.get('fileTrees').keys())
    notes = notes.map(_.toInteger)
    socket.emit("UPDATE_TREE_NOTES", notes)
}

function initConnection (socket) {
    socket.emit('CONNECTION', socket.id);
    socket.emit('STATE', 'init notes');
    emitTreeNotes(socket)
    socket.emit("NEW_NOTES", db.get('notes'))
    socket.emit('STATE', 'init trees');
    socket.emit("NEW_TREES", db.get('trees'))
    socket.emit('STATE', 'init fileTrees');
    socket.emit("NEW_FILETREES", db.get('fileTrees'))
    socket.emit('STATE', 'ready');
}


nsp.on('connection', function (socket) {

    users.push(socket.id);
    console.log('connection', socket.id)

    initConnection(socket)

    socket.on('update note', function (updatedFields) {
        let note = db.get('notes').get(updatedFields.id)
        if (!note.value()) {
            console.log('can not find such note', updatedFields.id, typeof (updatedFields.id), 'got', note.value())
            return
        }
        for (let field of Object.keys(updatedFields)) {
            if (noteEditableFields.indexOf(field) == -1) continue
            note.set(field, updatedFields[field]).write()
        }
        note.set('edited', Date.now()).write()
        nsp.emit('UPDATE_NOTE', note.value())
        if (updatedFields.tags && updatedFields.tags.length) {
            let newTags = _.difference(updatedFields.tags, db.get('tags').value())
            if (newTags.length) {
                db.get('tags').push(...newTags).write()
                nsp.emit('UPDATE_TAGS', db.get('tags').value())
            }
        }
    });

    socket.on('move note', function ({ treeId, noteId, parentId, index = 0 }) {
        tree = db.get('trees').get(treeId)
        if (tree.value() === undefined) {
            console.log('no such tree: %d', treeId)
            return
        }
        if (parentId < -1) {
            console.log('can not move to special note: %d', parentId)
            return
        }
        if (noteId < 0) {
            console.log('can not move special note: %d', noteId)
            return
        }
        if (parentId != -1) {
            var parent = tree.get(parentId)
            if (parent.value() === undefined) {
                // need to remove from tree
                parentId = -1
            }
        }
        let note = tree.get(noteId)
        if (note.value() === undefined) {
            if (parentId == -1) return
            if (db.get('notes').get(noteId).value() === undefined) return
            tree.set(noteId, { note: noteId, children: [], parent: parentId }).write()
            nsp.emit('UPDATE_TREE_NODE', { tree: treeId, node: tree.get(noteId).value() })
        } else {
            let tmpParent = note.value().parent
            while (tmpParent !== null) {
                if (tmpParent == noteId) {
                    console.log('recursion detected!!')
                    return
                }
                tmpParent = tree.get(tmpParent).value().parent
            }

            let oldParent = tree.get(note.value().parent)
            if (oldParent.value() === undefined) {
                console.log('can not find old parent')
                return
            }

            oldParent.get('children').pull(parseInt(noteId)).write()
            oldParent = tree.get(note.value().parent)
            nsp.emit('UPDATE_TREE_NODE', { tree: treeId, node: oldParent.value() })
        }
        if (parentId == -1) {
            deleteTreeNode(treeId, tree, noteId)

        } else {
            note.set('parent', parentId).write()
            nsp.emit('UPDATE_TREE_NODE', { tree: treeId, node: note.value() })
            parent.get('children').splice(index, 0, noteId).write()
            nsp.emit('UPDATE_TREE_NODE', { tree: treeId, node: parent.value() })
        }
    });

    socket.on('new note', function (fields) {
        socket.emit('new note ack', createNewNote(fields))
    });

    socket.on('delete note', function (note) {
        if (note < 0) {
            console.log('special can not be deleted')
            return
        }
        if (db.get('trees').get(note).value() !== undefined) {
            console.log("note '%s' is a tree", note)
            return
        }
        for (let [treeId, tree] of db.get('trees').entries()) {
            if (tree[note] !== undefined) {
                deleteTreeNode(treeId, tree, note)
            }
        }
        db.get('notes').unset(note).write()
        nsp.emit('DELETE_NOTE', note)


    });

    socket.on('new tree', function (title = '') {

        let treeId = createNewNote({ title: title })
        let tree = { note: treeId, children: [], parent: null }
        let obj = {}
        obj[treeId] = tree
        db.get('trees').set(treeId, obj).write()
        emitTreeNotes(nsp)
        nsp.emit('NEW_TREE', { noteId: treeId, tree: obj })
        socket.emit('new tree ack', treeId)

    });

    socket.on('delete tree', function (tree) {
    });

    socket.on('disconnect', function () {
        console.log('disconnect', socket.id)
        users = users.filter(function (user) {
            return user != socket.id;
        });
        nsp.emit('UPDATE_USERS', users);
    });
});