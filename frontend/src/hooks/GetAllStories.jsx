import axios from "axios";
import React, { useEffect } from "react";
import { serverUrl } from "../App";
import { useDispatch, useSelector } from "react-redux";
import { setStoryList } from "../redux/storySlice";

const GetAllStories = () => {
  const dispatch = useDispatch();
  const {userData} = useSelector(state=>state.user)
  const {storyData} = useSelector(state=>state.story)

  useEffect(() => {
    const fetchStories = async () => {
      try {
        const result = await axios.get(`${serverUrl}/api/story/getAll`, {
          withCredentials: true,
        });
        dispatch(setStoryList(result.data));
      } catch (error) {
        console.error("Error fetching current user:", error);
      }
    };
    fetchStories();
  },[userData,storyData])
};

export default GetAllStories;
