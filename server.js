var fs = require('fs')
var path = require('path')
var express = require('express')
var cors = require('cors');

var userData = require('./data.json')
var config = require('./config.json')

const corsOptions = {
    origin: 'http://localhost:3000', // Allow only requests from this origin
};

var app = express()
var port = process.env.PORT || config.port

app.use(cors(corsOptions));
app.use(express.json())

function checkBodyContents(body){
    if(body && body.shortLength && body.longLength && body.webhook && body.webhookKey){
        return true
    } else {
        return false
    }
}

// Retrieve a single users settings
app.get('/:username', function(req, res){
    var settings = userData[req.params.username]
    if(settings){
        res.status(200).json(settings)
    } else {
        res.status(400).send("User not found.")
    }
});

// Add a user
app.post('/:username', function(req, res){
    //check if user exists
    var settings = userData[req.params.username]
    if(!settings){
        //check all request fields exist
        if (checkBodyContents(req.body)){
            //build JS object for settings
            var newSettingsEntry = {
                shortLength: req.body.shortLength,
                longLength: req.body.longLength,
                webhook: req.body.webhook,
                webhookKey: req.body.webhookKey
            }

            //add object with id to data
            userData[req.params.username] = newSettingsEntry

            //write data to file
            fs.writeFile(__dirname + "/data.json",
                JSON.stringify(userData, null, 2),
                function(err, result){
                    if(!err){ //if no error, send good status
                        res.status(200).send("Success")
                    } else {
                        res.status(500).send("Server error")
                    }
                }
            )

        } else {
            res.status(400).send("Request body is not in the correct format.")
        }
    } else {
        res.status(400).send("User already exists")
    }
})

// Edit a users settings
app.put('/:username', function(req, res){

    //check if request formulated correctly
    if (checkBodyContents(req.body)) {

        //check if the log corrosponding to the given id exists
        var settings = userData[req.params.username]
        if(settings){

            //replace the contents of the log with the request
                settings.shortLength = req.body.shortLength,
                settings.longLength = req.body.longLength,
                settings.webhook = req.body.webhook,
                settings.webhookKey= req.body.webhookKey

            //write data to file
            fs.writeFile(__dirname + "/data.json",
                JSON.stringify(userData, null, 2),
                function(err, result){
                    if(!err){ //if no error, send good status
                        res.status(200).send("Success")
                    } else {
                        res.status(500).send("Server error")
                    }
                }
            )
        } else {
            res.status(400).send("That user does not exist.")
        }
    } else {
        res.status(400).send("Request body is not in the correct format.")
    }
})

// Delete a user settings
app.delete('/:username', function(req, res){
    var settings = userData[req.params.username]
    if(settings){
        delete userData[req.params.username]

        //write data to file
        fs.writeFile(__dirname + "/data.json",
            JSON.stringify(userData, null, 2),
            function(err, result){
                if(!err){ //if no error, send good status
                    res.status(200).send("Success")
                } else {
                    res.status(500).send("Server error")
                }
            }
        )
    } else {
        res.status(400).send("That user does not exist.")
    }
})


app.listen(port, function () {
    console.log("== Server listening on port", port)
})