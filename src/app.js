var express = require('express');
var bodyParser = require('body-parser');

var model = {
    clients: {},
    reset: function(){
        this.clients = {}
    },
    addAppointment: function(nombre, obj){
        obj.status = 'pending';
        if(!this.clients.hasOwnProperty(nombre)){
            this.clients[nombre] = [];
            this.clients[nombre].push(obj);
            return obj
        } else {
            this.clients[nombre].push(obj)
        }
    },
    attend: function(nombre,obj){
        var attend = this.clients[nombre].find(item => item.date === obj)
        attend.status = 'attended';
        return attend
    },
    expire: function(nombre,obj){
        var expire = this.clients[nombre].find(item => item.date === obj)
        expire.status = 'expired';
        return expire
    },
    cancel: function(nombre,obj){
        var cancel = this.clients[nombre].find(item => item.date === obj)
        cancel.status = 'cancelled';
        return cancel
    },
    erase: function(nombre,param){
        var aux = param.search(/^([0-2][0-9]|3[0-1])(\/|-)(0[1-9]|1[0-2])\2(\d{4})(\s)([0-1][0-9]|2[0-3])(:)([0-5][0-9])$/)
        if(aux !== -1){
            this.clients[nombre] = this.clients[nombre].filter(item => item.date !== param)
        } else {
            this.clients[nombre] = this.clients[nombre].filter(item => item.status !== param)
        } 
    },
    getAppointments: function(nombre,status){
        // status ? this.clients[nombre].filter(item => item.status === status) : this.clients[nombre]
        return (status && this.clients[nombre].filter(item => item.status === status) || this.clients[nombre])
    },
    getClients: function(){
        var clients = Object.keys(this.clients)
        return clients
    }
};

var server = express();

server.use(bodyParser.json());

server.get('/api', (req,res) => {
    // req.body = model.clients
    res.send(model.clients)
})

server.post('/api/Appointments', (req,res) => {
    var {client, appointment} = req.body
    if(!client){
        res.status(400).send('the body must have a client property')
    }
    if(typeof client !== 'string'){
        res.status(400).send('client must be a string')
    }
    res.send(model.addAppointment(client,appointment))
})

server.get('/api/Appointments/clients', (req,res) => {
    var arr = model.getClients()
    return res.send(arr)
})

server.get('/api/Appointments/:name', (req,res) => {
    var {name} = req.params;
    var {date,option} = req.query;
    
    if(!model.clients[name]){
        return res.status(400).send('the client does not exist')
    }
    if(!model.clients[name].find(item => item.date === date)){
        return res.status(400).send('the client does not have a appointment for that date')
    }

    if(option !== 'attend' || option !== 'cancel' || option !== 'expired'){
        return res.status(400).send('the option must be attend, expire or cancel')
    }
    if(option === 'attend'){
        var attend = model.attend(name,date)
        return res.send(attend)
    }
    if(option === 'cancel'){
        return res.send(model.cancel(name,date))
    }
    if(option === 'expire'){
        return res.send(model.expire(name,date))
    }
})

server.get('/api/Appointments/:name/erase', (req,res) => {
    var name = req.params.name
    var date = req.query.date
    if(!model.clients.hasOwnProperty(name)){
        res.status(400).send('the client does not exist')
    }
    var arr = model.clients[name].filter(item => item.status === date)
    model.erase(name,date)
    res.send(arr)
})

server.get('/api/Appointments/getAppointments/:name', (req,res) => {
    var {name} = req.params
    var {status} = req.query
    var arr = model.getAppointments(name,status)
    res.send(arr)
})

server.listen(3000);

module.exports = {model, server}