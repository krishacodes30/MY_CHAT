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


const Register = () => {

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
                        '/users/register',
                        {
                            email,
                            password
                        }
                    )


                console.log(
                    'REGISTER:',
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
                    'REGISTER ERROR:',
                    error.response?.data ||
                    error
                )


                setError(
                    error.response?.data?.message ||
                    error.message ||
                    'Registration failed'
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
                                    New here?
                                </p>


                                <h2 className="mt-2 text-4xl font-black tracking-tight sm:text-5xl">
                                    Create account
                                </h2>


                                <p className="mt-3 font-medium text-gray-600">
                                    Start your conversations.
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
                                        placeholder="Create a password"
                                        className="w-full rounded-2xl border-[3px] border-black bg-white px-4 py-4 font-medium text-black outline-none placeholder:text-gray-400 transition-all duration-200 focus:-translate-y-0.5 focus:shadow-[4px_4px_0px_#17151d]"
                                    />

                                </div>


                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full rounded-2xl border-[3px] border-black bg-[#FFC928] px-5 py-4 font-black text-black shadow-[4px_4px_0px_#17151d] transition-all duration-200 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#17151d] disabled:opacity-60"
                                >

                                    {loading
                                        ? 'Creating...'
                                        : 'Create my account'}

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

                                Already have an account?{' '}

                                <Link
                                    to="/login"
                                    className="font-black text-black underline decoration-[2px] underline-offset-4"
                                >
                                    Sign in
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


                    {/* RIGHT */}

                    <div className="hidden min-h-[600px] flex-col justify-between bg-[#B9A9F5] p-10 md:flex">

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

                                One place.
                                <br />
                                Every
                                <br />
                                conversation.

                            </h1>


                            <p className="mt-7 max-w-sm text-lg font-semibold leading-relaxed">

                                Chat privately with friends,
                                share ideas and bring AI into
                                your conversations whenever
                                you need it.

                            </p>


                            <div className="mt-8 flex flex-wrap gap-3">

                                <span className="rounded-full border-[2px] border-black bg-[#FFC928] px-4 py-2 text-sm font-black">
                                    Private
                                </span>

                                <span className="rounded-full border-[2px] border-black bg-white px-4 py-2 text-sm font-black">
                                    Real-time
                                </span>

                                <span className="rounded-full border-[2px] border-black bg-white px-4 py-2 text-sm font-black">
                                    AI ready
                                </span>

                            </div>

                        </div>


                        <div className="flex items-center gap-3">

                            <div className="h-3 w-3 rounded-full bg-black" />

                            <p className="text-sm font-bold">
                                Your conversations. Your space.
                            </p>

                        </div>

                    </div>

                </div>

            </div>

        </div>
    )
}


export default Register