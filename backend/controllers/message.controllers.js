import uploadOnCloudinary from "../config/cloudinary.js";
import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import { getScocketId, io } from "../socket.js";

export const sendMessage = async (req,res) => {
    try {
        const senderId = req.userId
        const receiverId = req.params.receiverId
        const {message} = req.body

        let image;
        if(req.file){
            image = await uploadOnCloudinary(req.file.path)
        }

        const newMessage = await Message.create({
            sender:senderId,
            receiver:receiverId,
            message,
            image
        })

        let conversation = await Conversation.findOne({
            participants:{$all:[senderId,receiverId]}
        })
        if(!conversation){
            conversation = await Conversation.create({
                participants:[senderId,receiverId],
                messages:[newMessage._id]
            })
        }else{
            conversation.messages.push(newMessage.id)
            await conversation.save()
        }

        const receiverSocketId = getScocketId(receiverId)
        if(receiverSocketId){
            io.to(receiverSocketId).emit("newMessage",newMessage)
        }

        return res.status(200).json(newMessage)
        
    } catch (error) {
        return res.status(500).json({ message: `Error sending messages: ${error.message}` });
    }
}

export const getAllMessages = async (req,res) => {
    try {
        const senderId = req.userId
        const receiverId = req.params.receiverId
        const conversation = await Conversation.findOne({
            participants:{$all:[senderId,receiverId]}
        }).populate("messages")

        return res.status(200).json(conversation?.messages)
    } catch (error) {
        return res.status(500).json({ message: `Error getAll  messages: ${error.message}` });
    }
}

export const getPreviousUserChats = async (req,res) => {
    try {
        const currentUserId = req.userId
        const conversations = await Conversation.find({
            participants:currentUserId
        }).populate("participants").sort({updatedAt:-1})

        const userMap = {}
        conversations.forEach(conv => {
            conv.participants.forEach(user => {
                if(user._id!=currentUserId){
                    userMap[user._id] = user
                }
            })
        })

        const previousUsers = Object.values(userMap)
        return res.status(200).json(previousUsers)
        

    } catch (error) {
        return res.status(500).json({ message: `prev user error: ${error.message}` });
    }
}