import axios from "axios";
import React, { useEffect } from "react";
import { serverUrl } from "../App";
import { useDispatch, useSelector } from "react-redux";
import { setPostData } from "../redux/postSlice";
import { setNotificationData } from "../redux/userSlice";

const GetAllNotifications = () => {
  const dispatch = useDispatch();
  const {userData} = useSelector(state=>state.user)

    useEffect(()=>{
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
    fetchNotifications()
    },[dispatch,userData])
};

export default GetAllNotifications;
