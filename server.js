const express = require('express');
const app = express();
const { db, syncAndSeed, models: { User, Category, Item} } = require('./db');
const path = require('path');

app.use(express.static(path.join(__dirname,'./assets')));
app.use(express.urlencoded({extended:false}));



app.get('/',async(req,res,next)=>{
    try{

    }catch(ex){
        next(ex);
    }
});

app.get('/:name',async(req,res,next)=>{
    try{

    }catch(ex){
        next(ex);
    }
});

app.get('/:name/:category',async(req,res,next)=>{
    try{

    }catch(ex){
        next(ex);
    }
    
});

app.use((err,req,res,next)=>{
    console.log(err);
});

const init = async()=>{
    try{
        await db.authenticate();
        await syncAndSeed();

        const port = process.env.PORT || 3000;
        app.listen(console.log(`listening on port: ${port}`));
    }catch(ex){
        console.log(ex);
    }
}

init();