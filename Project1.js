
const express = require('express');
const mysql = require('mysql');

var port = 3000;
const app = express();
var currentdb;
var currenttb;
var currentval;
var tableFormGlobal = [];
var linkNum = '';

app.listen(port, () => {
    console.log('Server started on port '+port);
});

//showing databases

app.get('/', (req, res) => {
    let sql = 'show databases';
    db.query(sql, (err, databases) => {
        if(err) throw err;
        console.log(databases);
        var text = 'Showing databases...' + '<br> <br>';
        var i = 0;
        while(i < databases.length){
            text += '<input type="button" onclick="location.href=\'http://localhost:3000/database/' + databases[i].Database + '\';" value="' + databases[i].Database + '" />' + '<br>';
            i++;
        }
        text += '<br>' + '<input type="button" onclick="location.href=\'http://localhost:3000/createdb\';" value="Create New Database" />';
        res.send(text)
    });
});

//connection

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'password'
});

//connecting

db.connect(function(err) {
    if (err) {
        console.error('error connecting: ' + err.stack);
        return;
    }
    console.log("Connected!");
});

//enter database

app.get('/database/:db', useDatabase);
    
function useDatabase(req, res){
    var data = req.params;
    let sql = 'use ' + data.db;
    currentdb = data.db;
    db.query(sql, (err, result) => {
        if(err) throw err;
        console.log(result);
        res.send('Entering ' + data.db + '...' + '<br> <br>' + '<input type="button" onclick="location.href=\'http://localhost:3000/showtables\';" value="Show Tables" />' + '<br> <br>' + '<input type="button" onclick="location.href=\'http://localhost:3000/\';" value="Back to Databases" />');
    });
    
}

//showing tables

app.get('/showtables', (req, res) => {
    let sql = 'show tables';
    db.query(sql, (err, tables) => {
        if(err) throw err;
        console.log(tables);
        var text = 'Showing tables...' + '<br> <br>';
        var showtables = 'tables[i].Tables_in_' + currentdb;
        var i = 0;
        while(i < tables.length){
            text += '<input type="button" onclick="location.href=\'http://localhost:3000/showdata/' + eval(showtables) + '\';" value="' + eval(showtables) + '" />' + '<br>';
            i++;
        }
        text += '<br>' + '<input type="button" onclick="location.href=\'http://localhost:3000/database/' + currentdb + '\';" value="Back to ' + currentdb + '" />';
        res.send(text);
    });
});

//showing data

app.get('/showdata/:tb', showDataType);
    
function showDataType(req, res){
    var data = req.params;
    currenttb = data.tb;
    let sql = 'describe ' + currenttb;
    var form = '';
    db.query(sql, (err, tableForm) =>{
        if(err) throw err;
        console.log(tableForm);
        var i = 0;
        while(i < tableForm.length){
            form += tableForm[i].Field + ': <input type="button" onclick="location.href=\'http://localhost:3000/viewdata/' + tableForm[i].Field + '\';" value="View" /> <input type="button" onclick="location.href=\'http://localhost:3000/change\';" value="Change Value" /> <br>';
            i++;
        }
        var text = 'Data as follows: <br> <br>' + form;
        text += '<br> <input type="button" onclick="location.href=\'http://localhost:3000/viewAll\';" value="View All Data" />'
        text += '<br> <input type="button" onclick="location.href=\'http://localhost:3000/add\';" value="Add New Values" />'
        text += '<br> <br>' + '<input type="button" onclick="location.href=\'http://localhost:3000/showtables\';" value="Back to Tables" />';
        res.send(text);
    });
}

//View data

app.get('/viewdata/:val', showData);

function showData(req, res){
    var data = req.params;
    currentval = data.val;
    let sql = 'SELECT ' + currentval + ' FROM ' + currenttb;
    db.query(sql, (err, data) => {
        if(err) throw err;
        console.log(data);
        var text = 'Values for ' + currentval + ':<br> <br>';
        text += '<br> <br>' + '<input type="button" onclick="location.href=\'http://localhost:3000/showdata/' + currenttb + '\';" value="Back to Data" />';
        res.send(text);
    });
}

//View all data

app.get('/viewall', showAllData)

function showAllData(req, res){
    let sql = 'SELECT * FROM ' + currenttb;
    db.query(sql, (err, data) => {
        if(err) throw err;
        console.log(data);
        var text = 'Showing All Data:<br> <br>';
        text += '<br> <br>' + '<input type="button" onclick="location.href=\'http://localhost:3000/showdata/' + currenttb + '\';" value="Back to Data" />';
        res.send(text);
    });
}

//Add data

app.get('/add', addData);

function addData(req, res){
    let sql = 'describe ' + currenttb;
    var form = '';
    var end = '<p id="URL"></p>';
    var url = 'location.href=\'http://localhost:3000/submit/new/';
    db.query(sql, (err, tableForm) =>{
        if(err) throw err;
        console.log(tableForm);
        var i = 0;
        var j = 0;
        linkNum = '';
        while(i < tableForm.length){
            tableFormGlobal[i] = tableForm[i].Field;
            linkNum += i + 1 + ':/';
            console.log(linkNum);
            form += tableForm[i].Field + ': <input type="text" id="id' + i + '" oninput="myFunction' + i + '()"> <br>';
            form += '<script>function myFunction' + i + '() {var ' + i + ' = document.getElementById("id' + i + '").value;document.getElementById("URL").innerHTML += ' + i + '/;}</script>';
            i++;
        }
        var text = 'Enter new data bellow: <br> <br>' + form;
        /*
        text += '<br> <script> function myfunction() {var link = \'\\"location.href=\\\'http://localhost:3000/submit/new/\' + ';
        while(j < tableForm.length){
            text += 'document.getElementById("' + tableFormGlobal[j] + '").value + \'/\' + ';
            j++;
        }
        text += '\\\'\\;\\";} document.createElement("link"); document.getElementId("myfunction").innerHTML = link;</script> <p id=\'myfunction\'></p> <input type="button" onclick="myfunction" value="myfunction" />';
        */
        
        //text += '<script>function myFunction() {var x = document.getElementById("myInput").value;document.getElementById("demo").innerHTML = "You wrote: " + x;}</script>';
        text += '<br> <button onclick="myfunction()">Submit</button><p id="test"></p><script>function myfunction() {var x = document.getElementById("URL").value; location.href=\'http://localhost:3000/submit/new/\' + x;}</script>';
        text += '<br> <br>' + '<input type="button" onclick="location.href=\'http://localhost:3000/showdata/' + currenttb + '\';" value="Back to Data" />';
        text += end;
        //console.log(text);
        res.send(text);
    });
}

app.get('/submit/new/' + linkNum, subNewData);

function subNewData(req, res){
    var data = req.params;
    var k = 0;
    var i = 0;
    var j = 0;
    console.log(tableFormGlobal);
    var sql = 'INSERT INTO ' + currentdb + ' (';
    while(i < tableFormGlobal.length){
        if(i < tableFormGlobal.length - 1){
            sql += tableFormGlobal[i] + ', ';
            i++;
        }else {
            sql += tableFormGlobal[i];
            i++;
        }
    }
    sql += 'VALUES (';
    while(k < tableFormGlobal.length){
        if(i < tableFormGlobal.length - 1){
            sql += data.i + ', ';
            i++;
        }else {
            sql += data.i;
            i++;
        }
    }
    sql += '))';
    console.log(sql);
    db.query(sql, (err, reply) => {
        var text = 'Submission Complete!'
        text += '<br> <br>' + '<input type="button" onclick="location.href=\'http://localhost:3000/showdata/' + currenttb + '\';" value="Back to Data" />';
        if(err) throw err;
        console.log(reply);
        res.send(text);
    });
}

//Get command
//http://localhost:3000/viewAll

//Post command
// localhost:3000/post/Ryan/Panek/12345678/2019/19/SCIA/3.5/
app.post('/post/:one/:two/:three/:four/:five/:six/:seven/', postFunction);

function postFunction(req, res){
    var data = req.params;
    fname = data.one;
    lname = data.two;
    id = data.three;
    year = data.four;
    age = data.five;
    major = data.six;
    gpa = data.seven;
    sql = 'INSERT INTO students (fname, lname, id, year, age, major, gpa) VALUES (\'' + fname + '\',\'' + lname + '\',\'' + id + '\',\'' + year + '\',\'' + age + '\',\'' + major + '\',\'' + gpa + '\')' ;
    db.query(sql, (err, result) => {
        if(err) throw err;
        console.log(result);
        res.send('Success' + '<br> <br>' + '<input type="button" onclick="location.href=\'http://localhost:3000/showdata/' + currenttb + '\';" value="Back to Data" />');
    });
}

//Put command
//localhost:3000/put/Bob/Bob/87654321/2018/18/MUSC/2.5/fname/Ryan

app.put('/put/:one/:two/:three/:four/:five/:six/:seven/:oldid/:oldvalue/', putFunction);

function putFunction(req, res){
    var data = req.params;
    fname = data.one;
    lname = data.two;
    id = data.three;
    year = data.four;
    age = data.five;
    major = data.six;
    gpa = data.seven;
    oldid = data.oldid;
    oldvalue = data.oldvalue;
    sql = 'UPDATE students SET fname = \'' + fname + '\', lname = \'' + lname + '\', id = \'' + id + '\', year = \'' + year + '\', age = \'' + age + '\', major = \'' + major + '\', gpa = \'' + gpa + '\' WHERE ' + oldid + ' = \'' + oldvalue + '\'';
    console.log(sql);
    db.query(sql, (err, result) => {
        if(err) throw err;
        console.log(result);
        res.send('Success' + '<br> <br>' + '<input type="button" onclick="location.href=\'http://localhost:3000/showdata/' + currenttb + '\';" value="Back to Data" />');
    });
}

//Patch command
//localhost:3000/patch/students/major/Art/fname/Bob

app.patch('/patch/:table/:newid/:newvalue/:id/:value/', patchFunction);

function patchFunction(req,res){
    var data = req.params;
    table = data.table;
    newid = data.newid;
    newvalue = data.newvalue;
    id = data.id;
    value = data.value;
    sql = 'UPDATE ' + table + ' SET ' + newid + ' = \'' + newvalue + '\' WHERE ' + id + ' = \'' + value + '\'';
    console.log(sql);
    db.query(sql, (err, result) => {
        if(err) throw err;
        console.log(result);
        res.send('Success' + '<br> <br>' + '<input type="button" onclick="location.href=\'http://localhost:3000/showdata/' + currenttb + '\';" value="Back to Data" />');
    });
}

//Delete command
//localhost:3000/delete/students/fname/Bob

app.delete('/delete/:table/:id/:value/', deleteFunction);

function deleteFunction(req,res){
    var data = req.params;
    table = data.table;
    value = data.value;
    id = data.id;
    sql = 'DELETE FROM ' + table + ' WHERE ' + id + ' = \'' + value + '\'';
    console.log(sql);
    db.query(sql, (err, result) => {
        if(err) throw err;
        console.log(result);
        res.send('Success' + '<br> <br>' + '<input type="button" onclick="location.href=\'http://localhost:3000/showdata/' + currenttb + '\';" value="Back to Data" />');
    });
}

//Change data

app.get('/change', changeData);

function changeData(req, res){
    var text = 'New ' + currentval + ': <input type = "text" id = "newdata" value = "New Data Here"/> <br> <input type="button" onclick="location.href=\'http://localhost:3000/showdata/' + currenttb + '\';" value="Submit" />'
    text += '<br> <br>' + '<input type="button" onclick="location.href=\'http://localhost:3000/showdata/' + currenttb + '\';" value="Back to Data" />';
    res.send(text);
}

//create database
//"CREATE DATABASE Project"
//create table
//"CREATE TABLE Students (fname VARCHAR(25), lname VARCHAR(25), id CHAR(8), year int(4), age int(3), major VARCHAR(25), gpa float(3))"
//http://g2pc1.bu.edu/~qzpeng/manual/MySQL%20Commands.htm