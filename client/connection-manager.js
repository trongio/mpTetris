class ConnectionManager {
    constructor() {
        this.conn=null;
    }

    connect(address) {
        this.conn=new WebSocket(address);


        this.conn.addEventListener('open',()=>{
            console.log('Connection established');
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

    send(data){
        const msg=JSON.stringify(data);
        console.log('sending message',msg);
        this.conn.send(msg);
    }

    receive(msg){
        const data=JSON.parse(msg);
        if(data.type==='session-created'){
            window.location.hash=data.id;
        }else if(data.type==='session-broadcast'){
            this.updateManager(data.peers);
        }

    }

}