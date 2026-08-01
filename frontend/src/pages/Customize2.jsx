import React from 'react'
import { useContext } from 'react'
import { userDataContext } from '../context/UserContext'
import { useState } from 'react'
import axios from 'axios'
import { IoMdArrowBack } from "react-icons/io";
import { useNavigate } from 'react-router-dom'



function Customize2  () {
    const{userData,backendImage,selectedImage,serverUrl,setUserData} = useContext(userDataContext)
    const[assistantName, setAssistantName] = useState(userData?.assistantName || "")
    const [loading,setLoading] = useState(false)
    const navigate = useNavigate()

    const handleUpdateAssistant= async()=>{
      setLoading(true)
        try {
            let formData = new FormData()
            formData.append("assistantName" , assistantName)
            if(backendImage){
                formData.append("assistantImage" ,backendImage)
            }else{
                formData.append("imageUrl",selectedImage)
            }
            const token = localStorage.getItem("token") || userData?.token;
            const headers = {
              "Content-Type": "multipart/form-data",
            };
            if (token) {
              headers.Authorization = `Bearer ${token}`;
            }
            const result = await axios.post(`${serverUrl}/api/user/update`, formData, {
              withCredentials: true,
              headers,
            })
            setLoading(false)
            console.log(result.data)
            setUserData(result.data)
            navigate("/")
        } catch (error) {
          setLoading(false);
          console.log(error);
          if (error.response?.status === 401) {
            alert("Please log in or sign up first to customize your assistant.");
            navigate("/signin");
          }
        }
    }


  return (
    <div className='w-full h-[100vh] bg-gradient-to-t from-[black] to-[#030353] flex justify-center items-center flex-col relative'>
      <IoMdArrowBack  className='absolute top-[30px] left-[30px] text-white cursor-pointer
      w-[25px] h-[25px]' onClick={()=>navigate("/customize")}/>
      
      <h1  className='text-white mb-[40px] text-[30px] text-center'>Enter Your <span  className='text-blue-400'>Assistant Name</span></h1>

       <input type='text' placeholder='eg. shifra' className='w-full max-w-[600px] h-[60px] outline-none border-2
     border-white bg-transparent text-white placeholder-gray-300 px-[20px] py-[10px] rounded-full text-[18px]'
     required onChange={(e)=>setAssistantName(e.target.value)} value={assistantName}/>
    {assistantName &&  <button  className='min-w-[300px] h-[60px] mt-4 text-center text-black cursor-pointer font-semibold bg-blue-700 rounded-full text-[20px]'
     disabled={loading}
     onClick={()=>{
        
         handleUpdateAssistant()
      }

       }>{!loading?"Finally Create Your Assistant":"Loading..."}</button> }
     
    </div>
  )
}

export default Customize2
