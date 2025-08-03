import express from 'express'
import { resetPassword, sendOtp, signIn, signOut, signup, verifyOtp } from '../controllers/auth.controllers.js'

const authRouter = express.Router()

authRouter.post('/signup', signup)
authRouter.post('/signin', signIn)
authRouter.get('/signout', signOut)

authRouter.post('/sendOtp', sendOtp)
authRouter.post('/verifyOtp', verifyOtp)
authRouter.post('/resetPassword', resetPassword)

export default authRouter