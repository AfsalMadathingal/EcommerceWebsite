const socketIo = require('socket.io');
const userDB = require('../model/userModel');
const adminToUserMap = new Map();
const userSocketsMap = new Map(); 

function initializeSocket(server) {

    try {

        const io = socketIo(server);
        const usp = io.of('/user-namespace');
        const adminsp = io.of('/admin-namespace');
        
        const userToAdminMap = new Map();
        
        usp.on('connection', async (userSocket) => {

            console.log('A user connected');
           
            adminsp.emit('userConnected', userSocket.id);

            
            const authToken = userSocket.handshake.auth.token;
            userSocketsMap.set(authToken, userSocket);
        
            
           await userDB.updateOne({ _id: userSocket.handshake.auth.token }, { $set: { chatStatus: true } });
        
            userSocket.on('disconnect', async () => {
                console.log('User disconnected');
               
                await userDB.updateOne({ _id: userSocket.handshake.auth.token }, { $set: { chatStatus: false } });
        
                if (userToAdminMap.has(userSocket)) {
                    const adminSocket = userToAdminMap.get(userSocket);
                    userToAdminMap.delete(userSocket);
                    adminSocket.emit('userDisconnected');
                }

                userSocketsMap.delete(authToken);
            });
        
            userSocket.on('user message', (data) => {

                

                const adminSocket = adminToUserMap.get(data.userSocketId);

        
                if (adminSocket) {
                    
                    adminSocket.emit('user message', data);
                    

                } else {

                    const messageFromServer = 'No admin connected yet';
                    userSocket.emit('admin message', messageFromServer);
                    console.log('No admin connected yet.');

                }
            });
        });
        
        
        adminsp.on('connection', (adminSocket) => {
            
            console.log('Admin connected:', adminSocket.id);

            const authToken = adminSocket.handshake.auth.token;
            adminToUserMap.set(authToken, adminSocket);
        
            adminSocket.on('disconnect', () => {
                console.log('Admin disconnected:', adminSocket.id);
               
                userToAdminMap.forEach((admin, user) => {
                    if (admin === adminSocket) {
                        userToAdminMap.delete(user);
                    }

                });
            });
        
            adminSocket.on('userConnect', (userSocketId) => {
                console.log('Admin connecting to user:', userSocketId);
              
                const userSocket = usp.sockets.sockets[userSocketId];
                if (userSocket) {
                    userToAdminMap.set(userSocket, adminSocket);
                    adminSocket.emit('userConnected', userSocketId);
                } else {
                    console.log('User socket not found:', userSocketId);
                }
            });
        
            adminSocket.on('admin message', (data) => {
                console.log('Admin message: ' + JSON.stringify(data));
                
                const userSocket = userSocketsMap.get(data.userSocketId);

    
                if (userSocket) {
                    console.log('Admin message forwarded to user: ' + data.userSocketId);
                    userSocket.emit('admin message', data);
                }
            });
        });
        
        
        




    } catch (error) {

        console.log(error);
        
    }

 
}





const loadCustomerServiceAdmin = async (req, res) => {
    
    try {

        const ChatData = await userDB.find({chatStatus:true})

       
        console.log(ChatData);


        res.render('admin/customerSupportAdmin',{
            adminlogin: true,
            title: "Customer Support",
            layout: "newSidebar",
            ChatData:ChatData
        })
    } catch (error) {
        
    }

}


module.exports = {
    loadCustomerServiceAdmin,
    initializeSocket,
}