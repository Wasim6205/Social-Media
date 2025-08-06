import React, { useEffect, useRef, useState } from 'react'
import { MdOutlineKeyboardBackspace } from 'react-icons/md'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import dp from "../assets/dp.webp"
import {LuImage} from "react-icons/lu"
import { IoMdSend } from 'react-icons/io'
import SenderMessage from '../components/SenderMessage'
import ReceiverMessage from '../components/ReceiverMessage'
import axios from 'axios'
import { serverUrl } from '../App'
import { setMessages } from '../redux/messageSlice'
import { ClipLoader } from 'react-spinners'

const MessageArea = () => {
    const {selectedUser,messages} = useSelector(state=>state.message)
    const {userData} = useSelector(state=>state.user)
    const {socket} = useSelector(state=>state.socket)
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const [input,setInput] = useState("")
    const imageInput = useRef()
    const [frontendImage,setFrontendImage] = useState(null)
    const [backendImage,setBackendImage] = useState(null)
    const [loading,setLoading] = useState(false)
    const handleImage = (e) => {
        const file = e.target.files[0]
        setBackendImage(file)
        setFrontendImage(URL.createObjectURL(file))
    }

    const handleSendMessage = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            const formData = new FormData()
            formData.append("message",input)
            if(backendImage){
                formData.append("image",backendImage)
            }
            const result = await axios.post(`${serverUrl}/api/message/send/${selectedUser._id}`,formData, {withCredentials:true})
            dispatch(setMessages([...messages,result.data]))
            setInput("")
            setFrontendImage(null)
            setBackendImage(null)
            setLoading(false)
        } catch (error) {
            setLoading(false)
            console.log(error);
        }
    }

    const getAllMessages = async (req,res) => {
        try {
            const result = await axios.get(`${serverUrl}/api/message/getAll/${selectedUser._id}`,{withCredentials:true})
            dispatch(setMessages(result.data))
        } catch (error) {
            console.log(error);
        }
    }

    useEffect(()=>{
        getAllMessages()
    },[])

    useEffect(()=>{
        socket?.on("newMessage",(mess)=>{
            dispatch(setMessages([...messages,mess]))
        })
        return ()=>socket.off("newMessage")
    },[messages,setMessages])
    
  return (
    <div className='w-full h-[100vh] bg-black relative'>

        <div className='flex items-center gap-[15px] px-[20px] py-[10px] fixed top-0 z-[100] bg-black w-full'>
            <div className='h-[80px] flex items-center gap-[20px] px-[20px]'>
                <MdOutlineKeyboardBackspace onClick={()=>navigate('/')} className='text-white cursor-pointer w-[25px] h-[25px]' />
            </div>
            <div className="w-[40px] h-[40px] border-2 border-black rounded-full cursor-pointer overflow-hidden" onClick={()=> navigate(`/profile/${user.userName}`)}>
                <img src={selectedUser.profileImage || dp} alt=""className="w-full object-cover" />
            </div>

            <div className='text-white text-[18px] font-semibold'>
                <div>{selectedUser.userName}</div>
                <div className='text-[14px] text-gray-400'>{selectedUser.name}</div>
            </div>
        </div>


        <div className='w-full h-[80%] pt-[100px] px-[40px] flex flex-col gap-[50px] overflow-auto bg-black'>
            {messages && messages.map((mess,index)=>(
                mess.sender==userData._id ? <SenderMessage key={index} message={mess} /> : <ReceiverMessage key={index} message={mess} />
            ))}
        </div>


        <div className='w-full h-[80px] fixed bottom-0 flex justify-center items-center bg-black z-[100]'>
            <form onSubmit={handleSendMessage} className='w-[90%] max-w-[800px] h-[80%] rounded-full bg-[#131616] flex items-center gap-[10px] px-[20px] relative'>
                {frontendImage &&
                <div className='w-[100px] rounded-2xl h-[100px] absolute top-[-120px] right-[10px] overflow-hidden'>
                    <img src={frontendImage} className='h-full object-cover' alt="" />
                </div>}
                <input type="file" accept='image/*' hidden ref={imageInput} onChange={handleImage} />
                <input value={input} onChange={(e)=>setInput(e.target.value)} type="text" placeholder='Message' className='w-full h-full px-[20px] text-[18px] text-white outline-0' />
                <div onClick={()=>imageInput.current.click()}><LuImage className='w-[28px] h-[28px] text-white' /></div>
                {(input || frontendImage) && 
                <button className='w-[60px] h-[40px cursor-pointer] rounded-full bg-gradient-to-br from-[#9500ff] to-[#ff0095] flex items-center justify-center'>{loading ? <ClipLoader size={30} color='white' /> : <IoMdSend className='w-[25px] h-[25px] text-white' />} </button>}
            </form>
        </div>

    </div>
  )
}

export default MessageArea