export default class connectionManager {

    constructor(tetrisManager){
        this.conn=null;
        this.peers=new Map;
        this.tetrisManager=tetrisManager;
        this.me=null;
        this.tetris=null;
    }

    connect(address){
        this.conn=new WebSocket(address);

        this.conn.addEventListener('open',()=>{
            console.log('connection established');
            this.initSession();
        });

        this.conn.addEventListener('message',event =>{
            console.log('received message',event.data);
            this.receive(event.data);
        });

    }

    initSession(){
        const sessionId= window.location.hash.split('#')[1];
        if(sessionId){
            this.send({
                type:'join-session',
                id: sessionId,
            })
        }
        else{
            this.send({
                type:'create-session',
            });
        }
    }

    updateManager(peers){
        this.me=peers.you;
        document.getElementsByTagName('section')[0].id=this.me;
        const clients=peers.clients.filter(id=>this.me!=id);
        clients.forEach(id => {
            if(!this.peers.has(id)){
                const tetris=this.tetrisManager.createPlayer();
                this.peers.set(id,tetris);
            }
        });
    }

    receive(msg){
        const data=JSON.parse(msg);
        if(data.type==='session-created'){
            window.location.hash=data.id;
        }else if(data.type==='session-broadcast'){
            this.updateManager(data.peers);
        }

    }

    send(data){
        const msg=JSON.stringify(data);
        console.log('sending message',msg);
        this.conn.send(msg);
    }

    getMe(){
        return this.me;
    }

    setTetris(tetris){
        this.tetris=tetris;
        this.send({
            type:'set-tetris',
            id: this.me,
            tetris: tetris,
        })
    }
}
