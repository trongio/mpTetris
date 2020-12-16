class Client {
    constructor(conn,id,sectionhtml){
        this.conn=conn;
        this.id=id;
        this.session=null;
        this.sectionhtml=sectionhtml;
        this.tetris=null;
    }
    
    send(data){
        const msg = JSON.stringify(data);
        console.log(`Sending message ${msg}`);
        this.conn.send(msg, function ack(err) {
		if (err) {
			console.log('Error sending message', msg, err);
		}
	});
    }

    setTetris(tetris){
        this.tetris=tetris;
        console.log('setting tetris',this.tetris)
    }

}
module.exports=Client;