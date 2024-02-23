const socketIo = require('socket.io');
let server;
let socketForAdmin;

function initializeSocket(server) {

    const io = socketIo(server);
    
    io.on('connection', (socket) => {

        socketForAdmin = socket

        console.log('A user connected');

        socket.on('disconnect', () => {
            console.log('User disconnected');
        });

        // Receive message from client
        socket.on('user message', (msg) => {

            console.log('Receivedsdf message from client: ' + msg);
         
            id = socket.handshake.auth.token


            // Echo the received message back to the client
            io.emit('user message', msg);
           
        });

        // Send a message to the client
        const messageFromServer = 'Hello Please sent your orderNo and Mobile Number ';
        socket.emit('admin message', messageFromServer);
        console.log('Message sent from server: ' + messageFromServer);
    });

    
}









const loadCustomerServiceAdmin = (req, res) => {
    
    try {



        res.render('admin/customerSupportAdmin',{
            adminlogin: true,
            title: "Customer Support",
            layout: "newSidebar",
        })
    } catch (error) {
        
    }
}


module.exports = {
    loadCustomerServiceAdmin,
    initializeSocket
}