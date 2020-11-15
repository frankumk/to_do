const {models: { User, Category, Item} } = require('../db');
const path = require('path');
const header = require('../templates.js');

const app = require('express').Router();
module.exports = app;

app.use(express.static(path.join(__dirname,'./assets')));
app.use(express.urlencoded({extended:false}));
app.use(require('method-override')('_method'));


app.get('/:name',async(req,res,next)=>{
    try{
        r
    }catch(ex){
        next(ex);
    }
});
