const express = require('express');
const blogRouter = express.Router();
const multer = require('multer');
const Blog = require('../models/blog');
const User = require('../models/user');
const verifyToken = require('../middlewares/verifyToken');


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads');
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});

const upload = multer({ storage: storage });

blogRouter.post('/upload', upload.single('image'), verifyToken, async (req, res) => {
    try {
      const userId = req.id;
      const user = await User.findById(userId);
  
      if (!user) {
        return res.status(400).json({
          success: false,
          message: 'User not found.'
        });
      }
  
      const { title, content } = req.body;
      const imagePath = req.file.path;
  
      const newBlog = new Blog({
        title,
        content,
        image: imagePath,
        user: userId 
      });
      await newBlog.save();
      res.status(201).json({
        success: true,
        message: "Blog Uploaded Successfully."
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  });

blogRouter.get("/blogs",verifyToken,async(req,res)=>{
    const userId = req.id
    
    const user = await User.findById(userId);
  
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'User not found.'
      });
    }

    try{
        const blogs = await Blog.find({user:userId})
        if(!blogs || blogs.length==0){
            return res.status(404).json({
                success:false,
                message:"Blog not found."
            })
        }
        res.status(200).json({
            success:true,
            blogs
        })

    }catch(error){
        res.status(500).json({
            success:false,
            message:error.message
        })
    }
})
  

blogRouter.delete("/blogs/:id", verifyToken, async (req, res) => {
  const userId = req.id;
  const blogId = req.params.id;

  try {
    const blog = await Blog.findOne({ _id: blogId, user: userId });
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found."
      });
    }

    await Blog.deleteOne({ _id: blogId, user: userId });
    res.status(200).json({
      success: true,
      message: "Blog deleted successfully."
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});


blogRouter.put('/blogs/:id',upload.single('image'), verifyToken, async (req, res) => {
    const userId = req.id;
    const blogId = req.params.id;
    const { title, content } = req.body;
    const imagePath = req.file.path;
    
  
    try {
     
      const blog = await Blog.findOne({ _id: blogId, user: userId });
      if (!blog) {
        return res.status(404).json({
          success: false,
          message: 'Blog not found or you are not authorized to update it.'
        });
      }
  
      
      blog.title = title;
      blog.content = content;
      blog.image = imagePath;
  
      
      await blog.save();
  
      res.status(200).json({
        success: true,
        message: 'Blog updated successfully.',
        blog: blog 
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  });
  

module.exports = blogRouter