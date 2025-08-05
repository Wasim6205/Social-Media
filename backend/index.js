import express from 'express'
import dotenv from 'dotenv'
import connectDb from './config/db.js'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import authRouter from './routes/auth.routes.js'
import userRouter from './routes/user.routes.js'
import postRouter from './routes/post.routes.js'
import loopRouter from './routes/loop.routes.js'
import storyRouter from './routes/story.routes.js'
import messageRouter from './routes/message.routes.js'
import { app, server } from './socket.js'
dotenv.config()


const port = process.env.PORT || 5000

app.use(cors({
    // origin: "http://localhost:5173",
    origin: process.env.REACT_PUBLIC_BASE_URL,
    credentials: true,
}))
app.use(express.json())
app.use(cookieParser())

app.use('/api/auth', authRouter)
app.use('/api/user', userRouter)
app.use('/api/post', postRouter)
app.use('/api/loop', loopRouter)
app.use('/api/story', storyRouter)
app.use('/api/message', messageRouter)

server.listen(port, ()=>{
    connectDb()
    console.log(`server started on port ${port}`)
})

// app.listen(port, '0.0.0.0', () => {
//     connectDb();
//     console.log(`Server started on http://192.168.1.102:${port}`);
// });
