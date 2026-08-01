import React, { useContext, useState, } from 'react'
import { useNavigate } from 'react-router-dom'
import bg from "../assets/authBg.png"
import { MdRemoveRedEye } from "react-icons/md";
import { IoMdEyeOff } from "react-icons/io";
import  {userDataContext}  from '../context/UserContext.jsx';
import axios from 'axios'

function SignIn() {

    const [showPassword,setShowPassword] =useState(false)
    const {serverUrl,userData, setUserData} = useContext(userDataContext)
    const  navigate = useNavigate()
    
    const [email, setEmail] = useState("")
    const [loading, setLoading] = useState(false)
    const [password, setPassword] = useState("")
    const [err , setErr] = useState("")
    
    const handleSignIn=async (e)=>{
         e.preventDefault()
         setErr("")
         setLoading(true)
      try {
        let result = await axios.post(`${serverUrl}/api/auth/signin`,{
           email,password },{withCredentials:true})
          //console.log(result.data)
          if (result.data?.token) {
            localStorage.setItem("token", result.data.token);
          }
          setUserData(result.data)
          setLoading(false)
          navigate("/")

            //console.log(result.data);
            //navigate("/signin"); // redirect after signup
        
      } catch (error) {
        console.log(error)
        setUserData(null)
        setLoading(false)
        setErr(error.response?.data?.message || "Sign in failed")
      }
    }

  return (
    <div className='w-full h-[100vh] bg-cover flex justify-center items-center' style={{backgroundImage:`url(${bg})`}} >
        <form className='w-[90%] h-[600px] max-w-[500px] bg=[#00000062]
        backdrop-blur shadow-lg shadow-black flex flex-col items-center
        justify-center gap-[20px] px[20px]' onSubmit={handleSignIn}>
        <h1 className='text-white text-[30px] font-semibold mb-[30px]'>Sign In to <span className='text-blue-400'>Virtual Assistant</span></h1>

   
        
     <input type='email' placeholder='Email' className='w-full h-[60px] outline-none border-2
     border-white bg-transparent text-white placeholder-gray-300 px-[20px] py-[10px] rounded-full text-[18px]'
     required onChange={(e)=>setEmail(e.target.value)} value={email}/>

    <div className='relative w-full h-[60px] flex items-center'>
       <input type= {showPassword?"text":"password"} placeholder='password' className='w-full h-full outline-none border-2
     border-white bg-transparent text-white placeholder-gray-300 px-[20px] py-[10px] rounded-full text-[18px]'
      required onChange={(e)=>setPassword(e.target.value)} value={password}/>

      {!showPassword &&  <MdRemoveRedEye  className='absolute right-[20px] w-[25px] h-[25px] text-[white] cursor-pointer'
        onClick={()=> setShowPassword(true)}/>}

      {showPassword &&  <IoMdEyeOff  className='absolute right-[20px] w-[25px] h-[25px] text-[white] cursor-pointer'
       onClick={()=> setShowPassword(false)}/>}
     
      </div>

      {err.length>0 && <p className='text-red-500 text-[17px]' >{err}</p>}

      <button className='min-w-[150px] h-[50px] text-center text-black font-semibold bg-blue-700 rounded-full text-[20px]' disabled={loading}>{loading?"Loading...":"Sign In"}</button> 
       <p className='text-[white] text-[18px] cursor-pointer 'onClick={()=>navigate("/signup")} 
       > want to create a new account ? <span className='text-blue-400'>Sign up</span></p>
        </form>
    </div>


   
     
  )
}

export default SignIn

