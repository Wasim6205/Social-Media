import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { FiSearch } from 'react-icons/fi'
import { MdOutlineKeyboardBackspace } from 'react-icons/md'
import { useNavigate } from 'react-router-dom'
import { serverUrl } from '../App'
import { useDispatch, useSelector } from 'react-redux'
import { setSearchData } from '../redux/userSlice'
import dp from "../assets/dp.webp"

function Search() {
    const navigate = useNavigate()
    const [input,setInput] = useState("")
    const {searchData} = useSelector(state=>state.user)
    const dispatch = useDispatch()
    const handleSearch = async (e) => {
        try {
            const result = await axios.get(`${serverUrl}/api/user/search?keyword=${input}`,{withCredentials:true})
            console.log(result.data);
            
            dispatch(setSearchData(result.data))
        } catch (error) {
            console.log(error);
        }
    }

    useEffect(()=>{
        handleSearch()
    },[input])
  return (
    <div className='w-full min-h-[100vh] bg-black flex items-center flex-col gap-[20px]'>

        <div className='w-full h-[80px] flex items-center gap-[20px] px-[20px] absolute top-0'>
            <MdOutlineKeyboardBackspace onClick={()=>navigate(`/`)} className='text-white cursor-pointer w-[25px] h-[25px]' />
        </div>

        <div className='w-full h-[80px] flex items-center justify-center mt-[80px]'>
            <form className='w-[90%] max-w-[880px] h-[80%] rounded-full bg-[#0f1414] flex items-center px-[20px]'>
                <FiSearch className='w-[18px] h-[18px] text-white' />
                <input value={input} onChange={(e)=>setInput(e.target.value)} type="text" placeholder='search...' className='w-full h-full outline-0 rounded-full px-[20px] text-white text-[18px]' />
            </form>
        </div>

        {input && searchData?.map((user)=>(
            <div className='w-[90vw] max-w-[700px] h-[60px] rounded-full bg-white flex items-center gap-[20px] px-[5px] hover:bg-gray-200 cursor-pointer' onClick={()=>navigate(`/profile/${user.userName}`)}>
                <div className='w-[50px] h-[50px] border-2 border-black rounded-full cursor-pointer overflow-hidden'>
                    <img src={user.profileImage || dp} className='object-cover w-full' alt="" />
                </div>

                <div className='text-black text-[18px] font-semibold'>
                    <div>{user.userName}</div>
                    <div className='text-[14px] text-gray-400'>{user.name}</div>
                </div>
            </div>
        ))}

        {!input && <div className='text-[30px] text-gray-700 font-bold'>Search Here...</div>}
        

    </div>
  )
}

export default Search
