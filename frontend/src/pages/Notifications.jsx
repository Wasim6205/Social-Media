import React, { useEffect } from 'react'
import { MdOutlineKeyboardBackspace } from 'react-icons/md'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import NotificationCard from '../components/NotificationCard'
import axios from 'axios'
import { serverUrl } from '../App'
import GetAllNotifications from '../hooks/GetAllNotifications'
import { setNotificationData } from '../redux/userSlice'

function Notifications() {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const {notificationData} = useSelector(state=>state.user)
    const ids = notificationData.map((n)=>n._id)

    const markAsRead = async ()=>{
        try {
            const result = await axios.post(`${serverUrl}/api/user/markAsRead`,{notificationId:ids},{withCredentials:true})
            await fetchNotifications()
        } catch (error) {
            console.log(error);
        }
    }

    const fetchNotifications = async () => {
      try {
        const result = await axios.get(`${serverUrl}/api/user/getAllNotifications`, {
          withCredentials: true,
        });
        dispatch(setNotificationData(result.data));
      } catch (error) {
        console.error("Error fetching current user:", error);
      }
    }

    useEffect(()=>{
        markAsRead()
        fetchNotifications()
    },[])
  return (
    <div className='w-full h-[100vh] bg-black overflow-auto'>
        <div className='w-full h-[80px] flex items-center gap-[20px] px-[20px] lg:hidden'>
            <MdOutlineKeyboardBackspace onClick={()=>navigate(`/`)} className='text-white cursor-pointer w-[25px] h-[25px]' />
            <h1 className='text-white text-[20px] font-semibold'>Notifications</h1>
        </div>

        <div className='w-full h-[100%] flex flex-col gap-[20px] px-[10px]'>
            {notificationData?.map((noti,index)=>(
                <NotificationCard key={index} noti={noti} />
            ))}
        </div>
        
    </div>
  )
}

export default Notifications
