const express = require('express');
const aws = require('./aws.js');
const uuid = require('uuid');
const fs = require('fs');

const port = 8888 || process.env.PORT;

let app = express();

/**
 * Uploads code to data-x S3 bucket.
 * 
 * Request:
 * file: zip file,
 * 
 * Response:
 * status: 1 if success, else errstring 
 */
app.post('/upload_code', (req, res) => {
    fs.readFile('./hello_world.txt', (err, data) => {
        if (err) {
            console.log(err);
            return;
        }
        let bucket_name = 'data-x'; // uuid.v4();
        let key_name = 'hello_world.txt';
        
        /*
        
        // code below creates new bucket
        let s3_promise = new aws.S3({apiVersion:'2006-03-01'}).createBucket({Bucket: bucket_name}).promise();
    
        s3_promise
            .then(() => {
                // Create params for putObject call
                let object_params = {Bucket: bucket_name, Key: key_name, Body: data};
                // Create object upload promise
                let upload_promise = new aws.S3({api_version: '2006-03-01'}).putObject(object_params).promise();
                upload_promise.then(
                function(data) {
                    console.log("Successfully uploaded data to " + bucket_name + "/" + key_name);
                });
            })
            .catch((api_err) => {
                console.log(api_err);
            }); 
        
        */
    
        // Create params for putObject call
        let object_params = {Bucket: bucket_name, Key: key_name, Body: data};
        // Create object upload promise
        let upload_promise = new aws.S3({api_version: '2006-03-01'}).putObject(object_params).promise();
        upload_promise
        .then(() => {
            console.log("Successfully uploaded data to " + bucket_name + "/" + key_name);
            res.send({
                status: 1
            });
        })
        .catch((err) => {
            // api error
            res.send({
                err: err
            });
        });
    })
});

app.post('/create_lambda', (req, res) => {
    fs.readFile('./tst.zip', (err, data) => {
        if (err) {
            console.log(err);
            return;
        }
        // should get this from req
        let name = 'hello_world';

        // create promise object for create lambda api call
        let lambda = new aws.Lambda().createFunction({
            Code: {
                ZipFile: data
            },
            FunctionName: name,
            Role: 'arn:aws:iam::573790977052:role/lambda',
            Runtime: 'nodejs8.10',
            Handler: 'hello_world'
        }).promise();

        // handle promise
        lambda
        .then((data) => {
            res.send({status: 1});
            console.log(data);
        })
        .catch((err) => {
            res.send({
                err: err
            });
            console.log(err);
        });
    });
});

app.listen(port, () => {
    console.log('Listening on port: ' + port);
});