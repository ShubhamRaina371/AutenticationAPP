const express = require("express");
const app = express();

const jwt = require("jsonwebtoken");
const userModel = require("./model/user");
const bcrypt = require("bcrypt");
const path = require("path");

app.set("view engine", "ejs")
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(express.static(path.join(__dirname,"public")));

app.get("/",(req,res)=>{
    res.render("index");
})

app.post("/create", async (req,res)=>{
    let {username, email,password,age} = req.body;

    bcrypt.genSalt(10,(err,salt)=>{
        bcrypt.hash(password,salt, async (err,hash)=>{

          let  createdUser = await userModel.create({
                username,
                email,
                password : hash,
                age
            })

            let token = jwt.sign({email},"shhhh");
            res.cookie("token",token)
            res.send(createdUser);
        })
    })
})

app.get("/login",(req,res)=>{
    res.render('login');
})
app.post("/login", async function (req,res) {
    let user = await userModel.findOne({email: req.body.email});
    if(!user) return res.send("something went wrong");

    bcrypt.compare(req.body.password, user.password, function(err,result){
        
       if (result)  {
        
        let token = jwt.sign({email:user.email},"shhhh");
        res.cookie("token",token);
        res.send("Loged in");
    }
       else res.send("Not valid user");
    })
});

app.get("/logout",(req,res)=>{
    res.cookie("token","");
    res.redirect("/");
})

app.listen(3000);