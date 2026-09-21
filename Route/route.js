const express = require("express");
const User = require("../models/User");
const router = express.Router();
 
router.get('/SignIn', async (req, res) => {
    try {
        let data = await User.find().select("-password");
        res.json(data);
        
    } catch (error) {
        console.log(error);
        res.status(500).send("error fetching data");
        
        
    }
});

router.put("/user/:id", async (req, res) =>{
    try {
        let updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            req.body,
            {new: true}
        );
        res.json(updatedUser)
        
    } catch (error) {
        console.log(error);
        res.status(500).send("error data")
        
        
    }
});

// dalet:

router.delete("/user/:id", async (req, res) =>{
    await User.findByIdAndDelete(req.params.id)
    res.json({mess: "data deleted"})
})

router.post("/user", async(req,res) =>{
    try {
       let { username, email, password } = req.body;

       let newUser = new User({
           username,
            email,
            password
       });
       
       await newUser.save();

       res.status(201).json(newUser)
        
    } catch (error) {
        console.log(error);
        res.status(500).send("Error creating user");
    
        
    }
    
})

module.exports = router;




