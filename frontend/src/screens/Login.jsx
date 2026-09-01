// import React, { useState, useContext } from 'react'
// import { Link, useNavigate } from 'react-router-dom'
// import axios from '../config/axios'
// // import { UserContext } from '../context/user.context'

// const Login = () => {

//     const [ email, setEmail ] = useState('')
//     const [ password, setPassword ] = useState('')

//     const { setUser } = useContext(UserContext)

//     const navigate = useNavigate()

//     function submitHandler(e) {

//         e.preventDefault()

//         axios.post('/users/login', {
//             email,
//             password
//         }).then((res) => {
//             console.log(res.data)

//             localStorage.setItem('token', res.data.token)
//             setUser(res.data.user)

//             navigate('/')
//         }).catch((err) => {
//             console.log(err.response.data)
//         })
//     }

//     return (
//         <div className="min-h-screen bg-[#C9BDF8] flex items-center justify-center px-5 py-8">

//             {/* Main Card */}
//             <div className="w-full max-w-5xl min-h-[620px] grid md:grid-cols-2 overflow-hidden rounded-[32px] border-[3px] border-black bg-[#F8F6FF] shadow-[10px_10px_0px_#17151d]">

//                 {/* ================= LEFT SIDE ================= */}
//                 <div className="hidden md:flex flex-col justify-between bg-[#B9A9F5] p-10">

//                     {/* Logo */}
//                     <div>
//                         <div className="w-16 h-16 rounded-full border-[3px] border-black bg-[#FFC928] flex items-center justify-center">

//                             <div className="flex gap-1.5">
//                                 <span className="w-2.5 h-2.5 bg-black rounded-full"></span>
//                                 <span className="w-2.5 h-2.5 bg-black rounded-full"></span>
//                                 <span className="w-2.5 h-2.5 bg-black rounded-full"></span>
//                             </div>

//                         </div>

//                         <div className="mt-10">

//                             <p className="text-sm font-black uppercase tracking-[0.25em] mb-4">
//                                 TalkSpace
//                             </p>

//                             <h1 className="text-6xl font-black leading-[0.9] tracking-tight">
//                                 Talk.
//                                 <br />
//                                 Think.
//                                 <br />
//                                 Connect.
//                             </h1>

//                             <p className="mt-7 max-w-sm text-lg font-semibold leading-relaxed">
//                                 A private space where you and your
//                                 friends can chat, share ideas and
//                                 bring AI into the conversation.
//                             </p>

//                         </div>
//                     </div>

//                     {/* Bottom */}
//                     <div className="flex items-center gap-3">

//                         <div className="w-3 h-3 rounded-full bg-black"></div>

//                         <p className="text-sm font-bold">
//                             Your conversations. Your space.
//                         </p>

//                     </div>

//                 </div>


//                 {/* ================= RIGHT SIDE ================= */}
//                 <div className="flex items-center justify-center p-7 sm:p-10 md:p-14">

//                     <div className="w-full max-w-md">

//                         {/* Mobile Logo */}
//                         <div className="md:hidden mb-8">

//                             <div className="w-14 h-14 rounded-full border-[3px] border-black bg-[#FFC928] flex items-center justify-center">

//                                 <div className="flex gap-1">
//                                     <span className="w-2 h-2 bg-black rounded-full"></span>
//                                     <span className="w-2 h-2 bg-black rounded-full"></span>
//                                     <span className="w-2 h-2 bg-black rounded-full"></span>
//                                 </div>

//                             </div>

//                         </div>


//                         {/* Heading */}
//                         <div className="mb-8">

//                             <p className="text-sm font-black uppercase tracking-[0.2em] mb-2">
//                                 Welcome back
//                             </p>

//                             <h2 className="text-4xl sm:text-5xl font-black tracking-tight">
//                                 Sign in
//                             </h2>

//                             <p className="mt-3 text-gray-600 font-medium">
//                                 Continue your conversations.
//                             </p>

//                         </div>


//                         {/* Form */}
//                         <form onSubmit={submitHandler}>

//                             {/* Email */}
//                             <div className="mb-5">

//                                 <label
//                                     className="block text-sm font-black mb-2"
//                                     htmlFor="email"
//                                 >
//                                     Email
//                                 </label>

//                                 <input
//                                     onChange={(e) => setEmail(e.target.value)}
//                                     value={email}
//                                     type="email"
//                                     id="email"
//                                     required
//                                     className="w-full px-4 py-4 rounded-2xl border-[3px] border-black bg-white text-black font-medium outline-none transition-all duration-200 placeholder:text-gray-400 focus:-translate-y-0.5 focus:shadow-[4px_4px_0px_#17151d]"
//                                     placeholder="you@example.com"
//                                 />

//                             </div>


//                             {/* Password */}
//                             <div className="mb-6">

//                                 <label
//                                     className="block text-sm font-black mb-2"
//                                     htmlFor="password"
//                                 >
//                                     Password
//                                 </label>

//                                 <input
//                                     onChange={(e) => setPassword(e.target.value)}
//                                     value={password}
//                                     type="password"
//                                     id="password"
//                                     required
//                                     className="w-full px-4 py-4 rounded-2xl border-[3px] border-black bg-white text-black font-medium outline-none transition-all duration-200 placeholder:text-gray-400 focus:-translate-y-0.5 focus:shadow-[4px_4px_0px_#17151d]"
//                                     placeholder="Enter your password"
//                                 />

//                             </div>


//                             {/* Login Button */}
//                             <button
//                                 type="submit"
//                                 className="w-full px-5 py-4 rounded-2xl border-[3px] border-black bg-[#FFC928] text-black font-black text-base transition-all duration-200 shadow-[4px_4px_0px_#17151d] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#17151d] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none"
//                             >
//                                 Enter the chat
//                                 <span className="ml-2">→</span>
//                             </button>

//                         </form>


//                         {/* Divider */}
//                         <div className="flex items-center gap-4 my-7">

//                             <div className="flex-1 h-[2px] bg-black/15"></div>

//                             <span className="text-xs font-bold text-gray-400">
//                                 OR
//                             </span>

//                             <div className="flex-1 h-[2px] bg-black/15"></div>

//                         </div>


//                         {/* Register */}
//                         <p className="text-center text-sm font-medium text-gray-600">

//                             Don't have an account?{' '}

//                             <Link
//                                 to="/register"
//                                 className="text-black font-black underline decoration-[2px] underline-offset-4 hover:text-gray-600"
//                             >
//                                 Create one
//                             </Link>

//                         </p>


//                         {/* Small decorative element */}
//                         <div className="mt-10 flex justify-center">

//                             <div className="flex items-center gap-2">

//                                 <span className="w-2 h-2 rounded-full bg-[#B9A9F5] border border-black"></span>

//                                 <span className="w-2 h-2 rounded-full bg-[#FFC928] border border-black"></span>

//                                 <span className="w-2 h-2 rounded-full bg-[#B9A9F5] border border-black"></span>

//                             </div>

//                         </div>

//                     </div>

//                 </div>

//             </div>

//         </div>
//     )
// }

// export default Login

// import React, { useState } from 'react'
// import { Link } from 'react-router-dom'

// const Login = () => {

//     const [email, setEmail] = useState('')
//     const [password, setPassword] = useState('')

//     function submitHandler(e) {
//         e.preventDefault()

//         // Backend login will be added later
//         console.log({
//             email,
//             password
//         })
//     }

//     return (
//         <div className="min-h-screen bg-[#C9BDF8] flex items-center justify-center px-5 py-8">

//             {/* Main Container */}
//             <div className="w-full max-w-5xl overflow-hidden rounded-[32px] border-[3px] border-black bg-[#F8F6FF] shadow-[10px_10px_0px_#17151d]">

//                 <div className="grid md:grid-cols-2">

//                     {/* ================= LEFT SECTION ================= */}

//                     <div className="hidden md:flex min-h-[600px] flex-col justify-between bg-[#B9A9F5] p-10">

//                         <div>

//                             {/* Chat Logo */}
//                             <div className="flex h-16 w-16 items-center justify-center rounded-full border-[3px] border-black bg-[#FFC928]">

//                                 <div className="flex gap-1.5">
//                                     <span className="h-2.5 w-2.5 rounded-full bg-black"></span>
//                                     <span className="h-2.5 w-2.5 rounded-full bg-black"></span>
//                                     <span className="h-2.5 w-2.5 rounded-full bg-black"></span>
//                                 </div>

//                             </div>


//                             {/* Brand */}
//                             <p className="mt-8 text-sm font-black uppercase tracking-[0.25em]">
//                                 TalkSpace
//                             </p>


//                             {/* Main Heading */}
//                             <h1 className="mt-5 text-6xl font-black leading-[0.9] tracking-tight">
//                                 Talk.
//                                 <br />
//                                 Think.
//                                 <br />
//                                 Connect.
//                             </h1>


//                             {/* Description */}
//                             <p className="mt-7 max-w-sm text-lg font-semibold leading-relaxed">
//                                 A simple space to chat with your
//                                 friends, share ideas and bring AI
//                                 into your conversations.
//                             </p>

//                         </div>


//                         {/* Bottom Text */}
//                         <div className="flex items-center gap-3">

//                             <div className="h-3 w-3 rounded-full bg-black"></div>

//                             <p className="text-sm font-bold">
//                                 Your conversations. Your space.
//                             </p>

//                         </div>

//                     </div>


//                     {/* ================= RIGHT SECTION ================= */}

//                     <div className="flex min-h-[600px] items-center justify-center bg-[#F8F6FF] p-7 sm:p-10 md:p-14">

//                         <div className="w-full max-w-md">


//                             {/* Mobile Logo */}

//                             <div className="mb-8 md:hidden">

//                                 <div className="flex h-14 w-14 items-center justify-center rounded-full border-[3px] border-black bg-[#FFC928]">

//                                     <div className="flex gap-1">
//                                         <span className="h-2 w-2 rounded-full bg-black"></span>
//                                         <span className="h-2 w-2 rounded-full bg-black"></span>
//                                         <span className="h-2 w-2 rounded-full bg-black"></span>
//                                     </div>

//                                 </div>

//                             </div>


//                             {/* Heading */}

//                             <div className="mb-8">

//                                 <p className="text-sm font-black uppercase tracking-[0.2em]">
//                                     Welcome back
//                                 </p>

//                                 <h2 className="mt-2 text-4xl font-black tracking-tight sm:text-5xl">
//                                     Sign in
//                                 </h2>

//                                 <p className="mt-3 font-medium text-gray-600">
//                                     Continue your conversations.
//                                 </p>

//                             </div>


//                             {/* Form */}

//                             <form onSubmit={submitHandler}>

//                                 {/* Email */}

//                                 <div className="mb-5">

//                                     <label
//                                         htmlFor="email"
//                                         className="mb-2 block text-sm font-black"
//                                     >
//                                         Email
//                                     </label>

//                                     <input
//                                         id="email"
//                                         type="email"
//                                         value={email}
//                                         onChange={(e) => setEmail(e.target.value)}
//                                         placeholder="you@example.com"
//                                         className="w-full rounded-2xl border-[3px] border-black bg-white px-4 py-4 font-medium text-black outline-none placeholder:text-gray-400 transition-all duration-200 focus:-translate-y-0.5 focus:shadow-[4px_4px_0px_#17151d]"
//                                     />

//                                 </div>


//                                 {/* Password */}

//                                 <div className="mb-6">

//                                     <label
//                                         htmlFor="password"
//                                         className="mb-2 block text-sm font-black"
//                                     >
//                                         Password
//                                     </label>

//                                     <input
//                                         id="password"
//                                         type="password"
//                                         value={password}
//                                         onChange={(e) => setPassword(e.target.value)}
//                                         placeholder="Enter your password"
//                                         className="w-full rounded-2xl border-[3px] border-black bg-white px-4 py-4 font-medium text-black outline-none placeholder:text-gray-400 transition-all duration-200 focus:-translate-y-0.5 focus:shadow-[4px_4px_0px_#17151d]"
//                                     />

//                                 </div>


//                                 {/* Login Button */}

//                                 <button
//                                     type="submit"
//                                     className="w-full rounded-2xl border-[3px] border-black bg-[#FFC928] px-5 py-4 font-black text-black shadow-[4px_4px_0px_#17151d] transition-all duration-200 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#17151d] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none"
//                                 >
//                                     Enter the chat
//                                     <span className="ml-2">
//                                         →
//                                     </span>
//                                 </button>

//                             </form>


//                             {/* Divider */}

//                             <div className="my-7 flex items-center gap-4">

//                                 <div className="h-[2px] flex-1 bg-black/15"></div>

//                                 <span className="text-xs font-bold text-gray-400">
//                                     OR
//                                 </span>

//                                 <div className="h-[2px] flex-1 bg-black/15"></div>

//                             </div>


//                             {/* Register */}

//                             <p className="text-center text-sm font-medium text-gray-600">

//                                 Don't have an account?{' '}

//                                 <Link
//                                     to="/register"
//                                     className="font-black text-black underline decoration-[2px] underline-offset-4 hover:text-gray-500"
//                                 >
//                                     Create one
//                                 </Link>

//                             </p>


//                             {/* Decorative dots */}

//                             <div className="mt-10 flex justify-center">

//                                 <div className="flex gap-2">

//                                     <span className="h-2 w-2 rounded-full border border-black bg-[#B9A9F5]"></span>

//                                     <span className="h-2 w-2 rounded-full border border-black bg-[#FFC928]"></span>

//                                     <span className="h-2 w-2 rounded-full border border-black bg-[#B9A9F5]"></span>

//                                 </div>

//                             </div>

//                         </div>

//                     </div>

//                 </div>

//             </div>

//         </div>
//     )
// }

// export default Login 

import React, {
    useContext,
    useState
} from 'react'

import {
    Link,
    useNavigate
} from 'react-router-dom'

import axios from '../config/axios'

import {
    UserContext
} from '../context/user.context'


const Login = () => {

    const [
        email,
        setEmail
    ] = useState('')

    const [
        password,
        setPassword
    ] = useState('')

    const [
        loading,
        setLoading
    ] = useState(false)

    const [
        error,
        setError
    ] = useState('')

    const {
        setUser
    } = useContext(
        UserContext
    )

    const navigate =
        useNavigate()


    const submitHandler =
        async event => {

            event.preventDefault()

            setError('')
            setLoading(true)

            try {

                const response =
                    await axios.post(
                        '/users/login',
                        {
                            email,
                            password
                        }
                    )

                console.log(
                    'LOGIN:',
                    response.data
                )

                const token =
                    response.data.token

                const user =
                    response.data.user

                if (!token) {

                    throw new Error(
                        'Token was not returned by backend'
                    )
                }

                localStorage.setItem(
                    'token',
                    token
                )

                if (user) {

                    localStorage.setItem(
                        'user',
                        JSON.stringify(user)
                    )
                }

                setUser(user)

                navigate('/', {
                    replace: true
                })

            } catch (error) {

                console.error(
                    'LOGIN ERROR:',
                    error.response?.data ||
                    error
                )

                /*
                 * A user that does not exist should not see
                 * "Request failed with status code 401".
                 *
                 * The backend returns USER_NOT_FOUND for this case.
                 * We send the user to Register and pass a message
                 * through React Router state.
                 */
                if (
                    error.response?.data?.code ===
                    'USER_NOT_FOUND'
                ) {

                    navigate('/register', {
                        replace: true,
                        state: {
                            message:
                                'Account not found. Please sign up first.'
                        }
                    })

                    return
                }

                /*
                 * Wrong password = stay on Login.
                 */
                if (
                    error.response?.data?.code ===
                    'INVALID_CREDENTIALS'
                ) {

                    setError(
                        'Invalid email or password.'
                    )

                    return
                }

                setError(
                    error.response?.data?.message ||
                    error.message ||
                    'Login failed'
                )

            } finally {

                setLoading(false)
            }
        }


    return (

        <div className="min-h-screen bg-[#C9BDF8] flex items-center justify-center px-5 py-8">

            <div className="w-full max-w-5xl overflow-hidden rounded-[32px] border-[3px] border-black bg-[#F8F6FF] shadow-[10px_10px_0px_#17151d]">

                <div className="grid md:grid-cols-2">

                    {/* LEFT */}

                    <div className="hidden md:flex min-h-[600px] flex-col justify-between bg-[#B9A9F5] p-10">

                        <div>

                            <div className="flex h-16 w-16 items-center justify-center rounded-full border-[3px] border-black bg-[#FFC928]">

                                <div className="flex gap-1.5">

                                    <span className="h-2.5 w-2.5 rounded-full bg-black" />
                                    <span className="h-2.5 w-2.5 rounded-full bg-black" />
                                    <span className="h-2.5 w-2.5 rounded-full bg-black" />

                                </div>

                            </div>


                            <p className="mt-8 text-sm font-black uppercase tracking-[0.25em]">
                                TalkSpace
                            </p>


                            <h1 className="mt-5 text-6xl font-black leading-[0.9] tracking-tight">

                                Talk.
                                <br />
                                Think.
                                <br />
                                Connect.

                            </h1>


                            <p className="mt-7 max-w-sm text-lg font-semibold leading-relaxed">

                                A private space where you and
                                your friends can chat, share
                                ideas and bring AI into the
                                conversation.

                            </p>

                        </div>


                        <div className="flex items-center gap-3">

                            <div className="h-3 w-3 rounded-full bg-black" />

                            <p className="text-sm font-bold">
                                Your conversations. Your space.
                            </p>

                        </div>

                    </div>


                    {/* RIGHT */}

                    <div className="flex min-h-[600px] items-center justify-center bg-[#F8F6FF] p-7 sm:p-10 md:p-14">

                        <div className="w-full max-w-md">


                            <div className="mb-8 md:hidden">

                                <div className="flex h-14 w-14 items-center justify-center rounded-full border-[3px] border-black bg-[#FFC928]">

                                    <div className="flex gap-1">

                                        <span className="h-2 w-2 rounded-full bg-black" />
                                        <span className="h-2 w-2 rounded-full bg-black" />
                                        <span className="h-2 w-2 rounded-full bg-black" />

                                    </div>

                                </div>

                            </div>


                            <div className="mb-8">

                                <p className="text-sm font-black uppercase tracking-[0.2em]">
                                    Welcome back
                                </p>


                                <h2 className="mt-2 text-4xl font-black tracking-tight sm:text-5xl">
                                    Sign in
                                </h2>


                                <p className="mt-3 font-medium text-gray-600">
                                    Continue your conversations.
                                </p>

                            </div>


                            {error && (

                                <div className="mb-5 rounded-2xl border-2 border-black bg-[#B9A9F5] p-3 text-sm font-bold">
                                    {error}
                                </div>

                            )}


                            <form
                                onSubmit={
                                    submitHandler
                                }
                            >

                                <div className="mb-5">

                                    <label
                                        htmlFor="email"
                                        className="mb-2 block text-sm font-black"
                                    >
                                        Email
                                    </label>


                                    <input
                                        id="email"
                                        type="email"
                                        required
                                        value={email}
                                        onChange={
                                            event =>
                                                setEmail(
                                                    event.target.value
                                                )
                                        }
                                        placeholder="you@example.com"
                                        className="w-full rounded-2xl border-[3px] border-black bg-white px-4 py-4 font-medium text-black outline-none placeholder:text-gray-400 transition-all duration-200 focus:-translate-y-0.5 focus:shadow-[4px_4px_0px_#17151d]"
                                    />

                                </div>


                                <div className="mb-6">

                                    <label
                                        htmlFor="password"
                                        className="mb-2 block text-sm font-black"
                                    >
                                        Password
                                    </label>


                                    <input
                                        id="password"
                                        type="password"
                                        required
                                        value={password}
                                        onChange={
                                            event =>
                                                setPassword(
                                                    event.target.value
                                                )
                                        }
                                        placeholder="Enter your password"
                                        className="w-full rounded-2xl border-[3px] border-black bg-white px-4 py-4 font-medium text-black outline-none placeholder:text-gray-400 transition-all duration-200 focus:-translate-y-0.5 focus:shadow-[4px_4px_0px_#17151d]"
                                    />

                                </div>


                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full rounded-2xl border-[3px] border-black bg-[#FFC928] px-5 py-4 font-black text-black shadow-[4px_4px_0px_#17151d] transition-all duration-200 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#17151d] disabled:opacity-60"
                                >

                                    {loading
                                        ? 'Signing in...'
                                        : 'Enter the chat'}

                                    <span className="ml-2">
                                        →
                                    </span>

                                </button>

                            </form>


                            <div className="my-7 flex items-center gap-4">

                                <div className="h-[2px] flex-1 bg-black/15" />

                                <span className="text-xs font-bold text-gray-400">
                                    OR
                                </span>

                                <div className="h-[2px] flex-1 bg-black/15" />

                            </div>


                            <p className="text-center text-sm font-medium text-gray-600">

                                Don't have an account?{' '}

                                <Link
                                    to="/register"
                                    className="font-black text-black underline decoration-[2px] underline-offset-4"
                                >
                                    Create one
                                </Link>

                            </p>


                            <div className="mt-10 flex justify-center">

                                <div className="flex gap-2">

                                    <span className="h-2 w-2 rounded-full border border-black bg-[#B9A9F5]" />

                                    <span className="h-2 w-2 rounded-full border border-black bg-[#FFC928]" />

                                    <span className="h-2 w-2 rounded-full border border-black bg-[#B9A9F5]" />

                                </div>

                            </div>

                        </div>

                    </div>

                </div>

            </div>

        </div>
    )
}


export default Login
