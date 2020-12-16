const WebSocketServer= require('ws').Server;
const Session=require('./Session');
const Client=require('./Client.js')

const server = new WebSocketServer({port:9000});

const sessions = new Map;


function createId(len = 6, chars = 'abcdefghjkmnopqrstvwxyz01234567890') {
    let id = '';
    while (len--) {
        id += chars[Math.random() * chars.length | 0];
    }
    return id;
}

function createClient(conn,id=createId()){
    return new Client(conn,id);
}

function createSession(id=createId()){
    if(sessions.has(id)){
        throw new Error(`session ${id} already exists`);
    }
    const session=new Session(id);
    console.log('creating session',session);
    sessions.set(id,session);
    return session;
}

function getSession(id){
    return sessions.get(id);
}

// function briadcastTetris(session){
//     const clients=[...session.clients];
//     clients.forEach(client =>{
//         client.send({
//             type: 'session-broadcast',
//             peers:{
//                 you: client.id,
//                 clients: clients.map(client=>client.tetris),
//             }
//         })
//     })
// }

function broadCastSession(session){
    const clients=[...session.clients];
    clients.forEach(client =>{
        client.send({
            type: 'session-broadcast',
            peers:{
                you: client.id,
                clients: clients.map(client=>client.id),
            }
        })
    })
}

server.on('connection',conn =>{
    console.log('connection established')
    const client=createClient(conn);

    conn.on('message',msg=>{
        console.log('message received:',msg)
        const data=JSON.parse(msg);

        if(data.type === 'create-session'){
            const session=createSession();
            session.join(client);
            client.send({
                type: 'session-created',
                id: session.id,
            });
        } else if (data.type==='join-session'){
            const session=getSession(data.id) || createSession(data.id);
            session.join(client);

            broadCastSession(session);
        }else if (data.type==='set-tetris'){
            client.setTetris(data.tetris);
            
        }

        console.log('sesiions',sessions);

    })

    conn.on('close', ()=>{
        console.log('connection closed');
        const session=client.session;
        if (session){
            session.leave(client);
            if(session.clients.size===0){
                sessions.delete(session.id);
            }
        }
        broadCastSession(session);
    });
});