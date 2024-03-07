const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const User = require("../models/user")

const register = async(req,res) =>{
    const {username,email,password} = req.body;

    if(!username || !email || !password){
        return res.status(400).json({
            success:false,
            message:"All fields are required."
        })
    }


    try{    
        const user = await User.findOne({email})

        if(user){
            return res.status(400).json({
                success:false,
                message:"Email already exist."
            })
        }
        const hashedPassword = await bcrypt.hash(password,10)

        const newUser = new User({
            username,
            email,
            password:hashedPassword
        })
        await newUser.save()
        res.status(201).json({
            success:true,
            message:"Registration successfull."
        })

    }catch(error){
        res.status(500).json({
            success:false,
            message:error.message
        })
    }
}
const login = async(req,res) =>{
    const {email,password} = req.body;

    if(!email || !password){
        return res.status(400).json({
            success:false,
            message:"All fields are required."
        })
    }
    try{
        const user = await User.findOne({email})

        if(!user){
            return res.status(404).json({
                success:false,
                message:"Invalid email or password!"
            })
        }
        const comparePassword = await bcrypt.compare(password,user.password)
        
        if(!comparePassword){
            return res.status(400).json({
                success:false,
                message:"Invalid email or password!"
            })
        }

        const token = jwt.sign({id:user._id},process.env.JWT_SECRET,{expiresIn:"1h"})

        res.cookie('jwt',token,{
            httpOnly:true,
            secure:true,
            sameSite:"none",
        }) 

        res.status(200).json({
            success:true,
            message:"Login Successfull.",
    
        })

    }catch(error){
        return res.status(500).json({
            success:false,
            message:error.message
        })
    }
}



const getUser = async(req,res) =>{

    const userId = req.id
    try{
        const user = await User.findById(userId).select("-password");
        
        if(!user){
            return res.status(404).json({
                success:false,
                message:"User not found!"
            })
        }

        res.status(200).json({
            success:true,
            message:"User found",
            user
        })

    }catch(error){
        res.status(500).json({
            success:false,
            message:error.message
        }) 
    }
}

const logout = async(req,res) =>{
    try{
        res.clearCookie('jwt').status(200).json({
            success:true,
            message:"Logout Successfull."
        })
        
    }catch(error){
        res.status(500).json({
            success:false,
            message:error.message
        })
    }
}

module.exports = {register, login,  getUser,logout}