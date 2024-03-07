require('dotenv').config()
const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const connectDb = require('./db')
const authRouter = require('./routes/authRoutes')
const blogRouter = require('./routes/blogRoutes')


const app = express()
const port = process.env.PORT || 3000

connectDb()
app.use(express.json())
app.use(cookieParser())
app.use(cors(
  {
    origin:"https://mern-blog-ankit.netlify.app",
    credentials:true
  }
))
app.use(express.static(__dirname + '/public'));
app.use('/uploads', express.static('uploads'));

app.use("/api",authRouter)
app.use("/api",blogRouter)

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})