const {models: { User, Category, Item} } = require('../db');
const path = require('path');
const header = require('../templates.js');

const app = require('express').Router();
module.exports = app;

app.use(express.static(path.join(__dirname,'./assets')));
app.use(express.urlencoded({extended:false}));
app.use(require('method-override')('_method'));


app.get('/users/:name',async(req,res,next)=>{
    try{
        const categories = await Category.findAll({
            include: [User],
            order: [
                ['name']
            ]
        });
        res.send(`
            <!DOCTYPE html>
            <html>
                ${header()}
                <body>
                    <nav>
                        <a href='/users'>Back</a>
                    </nav>
                    <h1>TO DO TRACKER</h1>
                    <h2>${req.params.name}'s Categories</h2>
                    <ul>
                    ${
                        categories.map(category=>{
                            let style='';
                            if(category.complete===true){
                                style='text-decoration: line-through'
                            }
                            if(category.user.name === req.params.name){ 
                                return `
                                <div class = "list-item-box">
                                    <li style="${style}"><a href='/users/${req.params.name}/${category.name}'>${category.name}</a></li>
                                    <form class="delete-form" method='POST' action='/users/${req.params.name}/${category.id}?_method=DELETE'>
                                        <button>X</button>
                                    </form>
                                    <form class = "complete-form" method="POST" action='/users/${req.params.name}/${category.id}?_method=PUT'>
                                        <button><span>&#10003</span></button>
                                    </form>
                                </div>
                            `}}).join('')
                    }
                    </ul>
                    <form id="cat-form" method="POST">
                        <input type="text" name="name" userId="${req.params.name}" id="add-category" required/>
                        <button>Create New Category</button>
                    </form>
                </body>
            </html>
        `);

    }catch(ex){
        next(ex);
    }
});

//add category
app.post('/users/:name',async(req,res,next)=>{
    try{
        const user = await User.findOne({
            where: {
                name: req.params.name
            }
        });
        const newCat = await Category.create(req.body);
        newCat.userId = user.id;
        await newCat.save();
        res.redirect(`/users/${req.params.name}`);

    }catch(ex){
        next(ex);
    }
});

//delete category, deletes all items under it, and redirects to categories page
app.delete('/users/:name/:id',async(req,res,next)=>{
    try{
        const cat = await Category.findOne({
            where: { id: req.params.id }
        });
        await cat.destroy();
        res.redirect(`/users/${req.params.name}`);

    }catch(ex){
        next(ex);
    }
});

//Updating category to complete when user clicks check mark, so that they can get strikethrough style plus strikethrough descendents
app.put('/users/:name/:id',async(req,res,next)=>{
    try{  
        const completed = await Category.findByPk(req.params.id);
        await completed.update({
            complete: true
        });
        res.redirect(`/users/${req.params.name}`);
    }catch(ex){
        next(ex);
    }

});