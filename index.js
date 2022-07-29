const express = require("express");
const cors = require("cors")
require("./db/config"); // here we Require the mongoose
const User = require("./db/Users");  // here we require the schema 
// const Product =  require('./db/Products');
const Products = require("./db/Products");
const jwt = require("jsonwebtoken");
const jwtKey = 'e-comm';
const app = express();
app.use(express.json());  
app.use(cors());

app.post("/register", async (req,resp)=>{ // here  it is the API which we going to hit from frontEnd
    let user = new User(req.body)
    let result = await user.save();
    result = result.toObject();
    delete result.password;
    jwt.sign({result},jwtKey,{expiresIn:"2h"},(err,token)=>{
        if(err){
            resp.send({result: "Something not found, try after sometime"})
        }
        resp.send({result,auth:token})
    })
})
app.listen(5000); 

app.post("/add-product",verifyToken, async (req,resp)=>{
    let product = new Products (req.body)
    let result = await product.save();
    resp.send(result)
 
})

app.get("/products" ,verifyToken, async (req,resp)=>{
    let result = await Products.find()
    resp.send(result)
})

app.delete("/products/:id",verifyToken, async(req,resp) => {
    const result = await Products.deleteOne({_id:req.params.id})
    resp.send(result)
})

app.get("/products/:id" , async (req,resp)=>{
    let result =  await Products.findOne({_id:req.params.id})
    if (result)
    {
        resp.send(result)
    }
    else
    {
        resp.send({result:"no data found "})
    };
})

app.post("/logIn",async(req,resp)=>{
    if (req.body.email && req.body.password){
        let user = await User.findOne(req.body).select('-password')
        if(user){
            jwt.sign({user},jwtKey,{expiresIn:"2h"},(err,token)=>{
                if(err){
                    resp.send({result: "Something not found, try after sometime"})
                }
                resp.send({user,auth:token})
            })
            
        }else{
            resp.send("user does not exist")
        }
    }else{
        resp.send(" User Does not exist")
    }

    
})

function verifyToken (req,resp,next){
    let token = req.headers['authorization'];
    if(token){
        token = token.split(" ")[1];
        jwt.verify(token,jwtKey, (err, valid)=>{
            if(err){
                resp.status(404).send("Please provide a valid token");
            }else{
                next();
            }
        })
    }else{
        resp.status(401).send(" Please Add token with header")
    }
}




