
// import React, {
//     useContext,
//     useEffect,
//     useRef,
//     useState
// } from 'react'



// import {
//     useNavigate,
//     useParams
// } from 'react-router-dom'

// import {
//     io
// } from 'socket.io-client'

// import axios from '../config/axios'

// import {
//     UserContext
// } from '../context/user.context'


// const API_URL =
//     import.meta.env.VITE_API_URL ||
//     'http://localhost:3000'


// const Project = () => {
    


//     const {
//         projectId
//     } = useParams()


//     const navigate =
//         useNavigate()


//     const {
//         user: currentUser
//     } = useContext(
//         UserContext
//     )


//     // ============================================================
//     // AUTH
//     // ============================================================

//     const getToken = () =>
//         localStorage.getItem('token')


//     // ============================================================
//     // PROJECT
//     // ============================================================

//     const [
//         project,
//         setProject
//     ] = useState(null)


//     const [
//         projectLoading,
//         setProjectLoading
//     ] = useState(true)


//     const [
//         projectError,
//         setProjectError
//     ] = useState('')


//     // ============================================================
//     // CHAT
//     // ============================================================

//     const [
//         messages,
//         setMessages
//     ] = useState([])


//     const [
//         message,
//         setMessage
//     ] = useState('')


//     const [
//         aiThinking,
//         setAiThinking
//     ] = useState(false)


//     const [
//         chatError,
//         setChatError
//     ] = useState('')


//     const messagesEndRef =
//         useRef(null)


//     const socketRef =
//         useRef(null)


//     // ============================================================
//     // CHAT RESIZE
//     // ============================================================

//     const [
//         chatWidth,
//         setChatWidth
//     ] = useState(420)


//     const [
//         isResizing,
//         setIsResizing
//     ] = useState(false)


//     const resizeRef =
//         useRef(false)


//     const resizeStartRef =
//         useRef({
//             x: 0,
//             width: 420
//         })


//     // ============================================================
//     // COLLABORATORS
//     // ============================================================

//     const [
//         isModalOpen,
//         setIsModalOpen
//     ] = useState(false)


//     const [
//         selectedUserId,
//         setSelectedUserId
//     ] = useState(new Set())


//     const [
//         allUsers,
//         setAllUsers
//     ] = useState([])


//     const [
//         addingUsers,
//         setAddingUsers
//     ] = useState(false)


//     const [
//         collaboratorError,
//         setCollaboratorError
//     ] = useState('')


//     const [
//         onlineUsers,
//         setOnlineUsers
//     ] = useState([])


//     // ============================================================
//     // PDF / RAG
//     // ============================================================

//     const [
//         pdfInput,
//         setPdfInput
//     ] = useState(null)


//     const [
//         uploadingPdf,
//         setUploadingPdf
//     ] = useState(false)

//     const [
//         pdfStatus,
//         setPdfStatus
//     ] = useState('')

//     const [
//         pdfError,
//         setPdfError
//     ] = useState('')

//     const pdfInputRef =
//         useRef(null)


//     // ============================================================
//     // LOAD PROJECT
//     // ============================================================

//     useEffect(() => {

//         let cancelled = false


//         const loadProject =
//             async () => {

//                 if (!projectId) {

//                     setProjectError(
//                         'Project ID is missing.'
//                     )

//                     setProjectLoading(false)

//                     return
//                 }


//                 try {

//                     setProjectLoading(true)

//                     setProjectError('')


//                     const response =
//                         await axios.get(
//                             `/projects/get-project/${projectId}`
//                         )


//                     if (cancelled) {
//                         return
//                     }


//                     const loadedProject =
//                         response.data?.project


//                     if (!loadedProject) {

//                         throw new Error(
//                             'Project was not returned by backend.'
//                         )
//                     }


//                     setProject(
//                         loadedProject
//                     )

//                 } catch (error) {

//                     console.error(
//                         'Loading project failed:',
//                         error.response?.data ||
//                         error
//                     )


//                     if (!cancelled) {

//                         if (
//                             error.response?.status === 401
//                         ) {

//                             localStorage.removeItem(
//                                 'token'
//                             )

//                             navigate(
//                                 '/login',
//                                 {
//                                     replace: true
//                                 }
//                             )

//                             return
//                         }


//                         setProjectError(
//                             error.response?.data?.error ||
//                             error.response?.data?.message ||
//                             error.message ||
//                             'Unable to load project.'
//                         )
//                     }

//                 } finally {

//                     if (!cancelled) {

//                         setProjectLoading(
//                             false
//                         )
//                     }
//                 }
//             }


//         loadProject()


//         return () => {
//             cancelled = true
//         }

//     }, [
//         projectId,
//         navigate
//     ])


//     // ============================================================
//     // LOAD CHAT HISTORY
//     // ============================================================

//     useEffect(() => {

//         if (!projectId) {
//             return
//         }


//         let cancelled = false


//         const loadMessages =
//             async () => {

//                 try {

//                     const response =
//                         await axios.get(
//                             `/messages/${projectId}`
//                         )


//                     if (cancelled) {
//                         return
//                     }


//                     setMessages(
//                         (
//                             response.data?.messages ||
//                             []
//                         ).map(
//                             normalizeMessage
//                         )
//                     )

//                 } catch (error) {

//                     console.error(
//                         'Failed to load messages:',
//                         error.response?.data ||
//                         error
//                     )
//                 }
//             }


//         loadMessages()


//         return () => {
//             cancelled = true
//         }

//     }, [
//         projectId
//     ])


//     // ============================================================
//     // SOCKET.IO
//     // ============================================================

//     useEffect(() => {

//         if (
//             !projectId ||
//             !getToken()
//         ) {
//             return
//         }


//         // const socket =
//         //     io(
//         //         API_URL,
//         //         {
//         //             auth: {
//         //                 token:
//         //                     getToken()
//         //             }
//         //         }
//         //     )
// const socket = io(API_URL, {
//     auth: { token: getToken() },
//     withCredentials: true,
//     transports: ['websocket', 'polling'] // Enforce websocket fallback
// });


//         socketRef.current =
//             socket


//         socket.on(
//             'connect',
//             () => {

//                 console.log(
//                     'Socket connected:',
//                     socket.id
//                 )


//                 socket.emit(
//                     'join-project',
//                     projectId
//                 )
//             }
//         )


//         // --------------------------------------------------------
//         // NORMAL + AI MESSAGE
//         // --------------------------------------------------------

//         socket.on(
//             'project-message',
//             incomingMessage => {

//                 const normalized =
//                     normalizeMessage(
//                         incomingMessage
//                     )


//                 setMessages(
//                     previous => {

//                         const exists =
//                             previous.some(
//                                 item =>
//                                     item._id ===
//                                     normalized._id
//                             )


//                         if (exists) {
//                             return previous
//                         }


//                         return [
//                             ...previous,
//                             normalized
//                         ]
//                     }
//                 )
//             }
//         )


//         // --------------------------------------------------------
//         // AI THINKING
//         // --------------------------------------------------------

//         socket.on(
//             'ai-status',
//             data => {

//                 setAiThinking(
//                     data?.status ===
//                     'thinking'
//                 )
//             }
//         )


//         // --------------------------------------------------------
//         // ONLINE USERS
//         // --------------------------------------------------------

//         socket.on(
//             'online-users',
//             users => {

//                 setOnlineUsers(
//                     Array.isArray(users)
//                         ? users
//                         : []
//                 )
//             }
//         )


//         // --------------------------------------------------------
//         // SOCKET ERROR
//         // --------------------------------------------------------

//         socket.on(
//             'project-error',
//             data => {

//                 const errorMessage =
//                     data?.message ||
//                     data?.error ||
//                     'Failed to process message.'


//                 console.error(
//                     'Project socket error:',
//                     errorMessage
//                 )


//                 setChatError(
//                     errorMessage
//                 )
//             }
//         )


//         socket.on(
//             'connect_error',
//             error => {

//                 console.error(
//                     'Socket error:',
//                     error.message
//                 )
//             }
//         )


//         return () => {

//             socket.disconnect()

//             socketRef.current =
//                 null
//         }

//     }, [
//         projectId
//     ])


//     // ============================================================
//     // MESSAGE NORMALIZER
//     // ============================================================

//     function normalizeMessage(
//         msg = {}
//     ) {

//         const rawSender =
//             msg.sender


//         const isAI =
//             msg.role === 'assistant' ||
//             msg.role === 'ai'


//         const sender =
//             rawSender &&
//             typeof rawSender === 'object'

//                 ? {
//                     ...rawSender,

//                     _id:
//                         rawSender._id ||
//                         rawSender.id ||
//                         rawSender.userId,

//                     email:
//                         rawSender.email ||
//                         msg.senderEmail ||
//                         ''
//                 }

//                 : {
//                     _id:
//                         isAI
//                             ? 'ai'
//                             : rawSender ||
//                               msg.senderId ||
//                               '',

//                     email:
//                         isAI
//                             ? 'AI Assistant'
//                             : msg.senderEmail ||
//                               ''
//                 }


//         return {

//             ...msg,

//             _id:
//                 String(
//                     msg._id ||
//                     msg.id ||
//                     `${Date.now()}-${Math.random()}`
//                 ),

//             sender,

//             role:
//                 msg.role ||
//                 'user',

//             message:
//                 msg.message ||
//                 msg.content ||
//                 ''
//         }
//     }


//     // ============================================================
//     // USER ID
//     // ============================================================

//     const getUserId =
//         user => {

//             if (user) {

//                 const id =
//                     user._id ||
//                     user.id ||
//                     user.userId


//                 if (id) {
//                     return String(id)
//                 }
//             }


//             try {

//                 const token =
//                     getToken()


//                 if (!token) {
//                     return ''
//                 }


//                 const payload =
//                     JSON.parse(
//                         atob(
//                             token.split('.')[1]
//                         )
//                     )


//                 return String(
//                     payload._id ||
//                     payload.id ||
//                     payload.userId ||
//                     ''
//                 )

//             } catch {

//                 return ''
//             }
//         }


//     // ============================================================
//     // SENDER ID
//     // ============================================================

//     const getSenderId =
//         sender => {

//             if (!sender) {
//                 return ''
//             }


//             if (
//                 typeof sender ===
//                 'string'
//             ) {
//                 return String(
//                     sender
//                 )
//             }


//             return String(
//                 sender._id ||
//                 sender.id ||
//                 sender.userId ||
//                 ''
//             )
//         }


//     // ============================================================
//     // AI MESSAGE
//     // ============================================================

//     const isAiMessage =
//         msg => {

//             return (
//                 msg?.role ===
//                     'assistant' ||

//                 msg?.role ===
//                     'ai' ||

//                 getSenderId(
//                     msg?.sender
//                 ) === 'ai'
//             )
//         }


//     // ============================================================
//     // AUTO SCROLL
//     // ============================================================

//     useEffect(() => {

//         messagesEndRef.current?.scrollIntoView({
//             behavior: 'smooth'
//         })

//     }, [
//         messages,
//         aiThinking
//     ])


//     // ============================================================
//     // SEND MESSAGE
//     // ============================================================

//     const send =
//         () => {

//             const cleanMessage =
//                 message.trim()


//             if (
//                 !cleanMessage ||
//                 !projectId
//             ) {
//                 return
//             }


//             const socket =
//                 socketRef.current


//             if (
//                 !socket ||
//                 !socket.connected
//             ) {

//                 setChatError(
//                     'Chat connection is not ready.'
//                 )

//                 return
//             }


//             setChatError('')


//             socket.emit(
//                 'project-message',
//                 {
//                     projectId,

//                     message:
//                         cleanMessage
//                 }
//             )


//             setMessage('')
//         }


//     // ============================================================
//     // ENTER TO SEND
//     // ============================================================

//     const handleMessageKeyDown =
//         event => {

//             if (
//                 event.key ===
//                     'Enter' &&
//                 !event.shiftKey
//             ) {

//                 event.preventDefault()

//                 send()
//             }
//         }


//     // ============================================================
//     // FLEXIBLE CHAT RESIZE
//     // ============================================================

//     useEffect(() => {

//         const handlePointerMove =
//             event => {

//                 if (
//                     !resizeRef.current
//                 ) {
//                     return
//                 }


//                 const delta =
//                     event.clientX -
//                     resizeStartRef.current.x


//                 /*
//                  * Chat is NEVER hidden because
//                  * of width.
//                  *
//                  * It simply becomes smaller.
//                  */

//                 const minWidth =
//                     280


//                 /*
//                  * Don't let chat consume
//                  * almost the entire screen.
//                  */

//                 const rightPanelWidth = 360
//                 const resizeHandleWidth = 8
//                 const pagePadding = 32

//                 const maxWidth =
//                     Math.max(
//                         minWidth,
//                         window.innerWidth -
//                         rightPanelWidth -
//                         resizeHandleWidth -
//                         pagePadding
//                     )


//                 const nextWidth =
//                     Math.min(
//                         maxWidth,
//                         Math.max(
//                             minWidth,
//                             resizeStartRef.current.width +
//                             delta
//                         )
//                     )


//                 setChatWidth(
//                     nextWidth
//                 )
//             }


//         const stopResize =
//             () => {

//                 resizeRef.current =
//                     false


//                 setIsResizing(
//                     false
//                 )


//                 document.body.style.cursor =
//                     ''


//                 document.body.style.userSelect =
//                     ''
//             }


//         window.addEventListener(
//             'pointermove',
//             handlePointerMove
//         )


//         window.addEventListener(
//             'pointerup',
//             stopResize
//         )


//         return () => {

//             window.removeEventListener(
//                 'pointermove',
//                 handlePointerMove
//             )


//             window.removeEventListener(
//                 'pointerup',
//                 stopResize
//             )
//         }

//     }, [])


//     const startResize =
//         event => {

//             event.preventDefault()


//             resizeRef.current =
//                 true


//             resizeStartRef.current = {

//                 x:
//                     event.clientX,

//                 width:
//                     chatWidth
//             }


//             setIsResizing(
//                 true
//             )


//             document.body.style.cursor =
//                 'col-resize'


//             document.body.style.userSelect =
//                 'none'
//         }


//     // ============================================================
//     // COLLABORATOR MODAL
//     // ============================================================

//     const openCollaboratorModal =
//         async () => {

//             setSelectedUserId(
//                 new Set()
//             )


//             setCollaboratorError('')


//             setIsModalOpen(
//                 true
//             )


//             try {

//                 const response =
//                     await axios.get(
//                         '/users/all'
//                     )


//                 const users =
//                     response.data?.users ||
//                     response.data?.data ||
//                     []


//                 setAllUsers(
//                     Array.isArray(users)
//                         ? users
//                         : []
//                 )

//             } catch (error) {

//                 console.error(
//                     'Failed to load users:',
//                     error.response?.data ||
//                     error
//                 )


//                 setAllUsers([])


//                 setCollaboratorError(
//                     error.response?.data?.error ||
//                     'Unable to load users.'
//                 )
//             }
//         }


//     // ============================================================
//     // SELECT USER
//     // ============================================================

//     const handleUserClick =
//         id => {

//             setSelectedUserId(
//                 previous => {

//                     const next =
//                         new Set(
//                             previous
//                         )


//                     if (
//                         next.has(id)
//                     ) {

//                         next.delete(id)

//                     } else {

//                         next.add(id)
//                     }


//                     return next
//                 }
//             )
//         }


//     // ============================================================
//     // ADD COLLABORATORS
//     // ============================================================

//     const addCollaborators =
//         async () => {

//             const users =
//                 Array.from(
//                     selectedUserId
//                 )


//             if (
//                 !users.length ||
//                 !projectId
//             ) {

//                 setIsModalOpen(
//                     false
//                 )

//                 return
//             }


//             try {

//                 setAddingUsers(
//                     true
//                 )


//                 const response =
//                     await axios.put(
//                         '/projects/add-user',
//                         {
//                             projectId,
//                             users
//                         }
//                     )


//                 const updatedProject =
//                     response.data?.project ||
//                     response.data


//                 if (
//                     updatedProject?.users
//                 ) {

//                     setProject(
//                         previous => ({
//                             ...previous,
//                             ...updatedProject
//                         })
//                     )

//                 } else {

//                     const refreshed =
//                         await axios.get(
//                             `/projects/get-project/${projectId}`
//                         )


//                     setProject(
//                         refreshed.data.project
//                     )
//                 }


//                 setSelectedUserId(
//                     new Set()
//                 )


//                 setIsModalOpen(
//                     false
//                 )

//             } catch (error) {

//                 console.error(
//                     'Add collaborators failed:',
//                     error.response?.data ||
//                     error
//                 )


//                 setCollaboratorError(
//                     error.response?.data?.error ||
//                     'Unable to add collaborators.'
//                 )

//             } finally {

//                 setAddingUsers(
//                     false
//                 )
//             }
//         }


//     // ============================================================
//     // ONLINE USER
//     // ============================================================

//     const isUserOnline =
//         id => {

//             return onlineUsers.some(
//                 user => {

//                     if (
//                         typeof user ===
//                         'string'
//                     ) {

//                         return (
//                             user ===
//                             String(id)
//                         )
//                     }


//                     return (
//                         String(
//                             user?._id ||
//                             user?.id ||
//                             user?.userId
//                         ) ===
//                         String(id)
//                     )
//                 }
//             )
//         }


//     // ============================================================
//     // PDF UPLOAD
//     // ============================================================

//     const handlePdfChange =
//         event => {

//             const file =
//                 event.target.files?.[0] ||
//                 null

//             setPdfStatus('')
//             setPdfError('')

//             if (!file) {
//                 setPdfInput(null)
//                 return
//             }

//             const isPdf =
//                 file.type === 'application/pdf' ||
//                 file.name
//                     .toLowerCase()
//                     .endsWith('.pdf')

//             if (!isPdf) {
//                 setPdfInput(null)
//                 setPdfError(
//                     'Please select a PDF file.'
//                 )

//                 if (pdfInputRef.current) {
//                     pdfInputRef.current.value = ''
//                 }

//                 return
//             }

//             const maxSize =
//                 10 * 1024 * 1024

//             if (file.size > maxSize) {
//                 setPdfInput(null)
//                 setPdfError(
//                     'PDF must be smaller than 10 MB.'
//                 )

//                 if (pdfInputRef.current) {
//                     pdfInputRef.current.value = ''
//                 }

//                 return
//             }

//             setPdfInput(file)
//         }


//     const clearPdfSelection =
//         () => {

//             setPdfInput(null)
//             setPdfStatus('')
//             setPdfError('')

//             if (pdfInputRef.current) {
//                 pdfInputRef.current.value = ''
//             }
//         }


//     const uploadPdf = async () => {

//         if (!pdfInput || !projectId) {
//             setPdfError(
//                 'Select a PDF before uploading.'
//             )
//             return
//         }

//         setUploadingPdf(true)
//         setPdfStatus('')
//         setPdfError('')

//         try {

//             const formData =
//                 new FormData()

//             formData.append(
//                 'file',
//                 pdfInput
//             )

//             const response =
//                 await axios.post(
//                     `/ai/projects/${projectId}/documents`,
//                     formData
//                 )

//             const result =
//                 response.data?.data ||
//                 response.data ||
//                 {}

//             const fileName =
//                 result.fileName ||
//                 pdfInput.name

//             const chunkCount =
//                 Number(result.chunks) || 0

//             setPdfStatus(
//                 chunkCount > 0
//                     ? `${fileName} indexed successfully · ${chunkCount} chunks`
//                     : `${fileName} indexed successfully`
//             )

//             setPdfInput(null)

//             if (pdfInputRef.current) {
//                 pdfInputRef.current.value = ''
//             }

//         } catch (error) {

//             console.error(
//                 'PDF upload failed:',
//                 error
//             )

//             const status =
//                 error.response?.status

//             const backendMessage =
//                 error.response?.data?.message ||
//                 error.response?.data?.error ||
//                 error.response?.data?.errors?.[0]?.msg

//             setPdfError(
//                 backendMessage ||
//                 (
//                     status === 413
//                         ? 'PDF is too large.'
//                         : status === 401
//                             ? 'Your session expired. Please log in again.'
//                             : 'Failed to upload and index the PDF.'
//                 )
//             )

//         } finally {

//             setUploadingPdf(false)
//         }
//     }



//     // ============================================================
//     // AI MESSAGE UI
//     // ============================================================

//     function WriteAiMessage(
//         content
//     ) {

//         return (

//             <div className="rounded-2xl border-2 border-black bg-[#B9A9F5] p-4">

//                 <div className="mb-2 flex items-center gap-2">

//                     <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-black bg-[#FFC928] text-xs font-black">
//                         AI
//                     </div>


//                     <span className="text-xs font-black">
//                         AI Assistant
//                     </span>

//                 </div>


//                 <p className="whitespace-pre-wrap text-sm font-medium leading-relaxed">
//                     {content}
//                 </p>

//             </div>
//         )
//     }


//     // ============================================================
//     // MISSING PROJECT ID
//     // ============================================================

//     if (!projectId) {

//         return (

//             <main className="flex h-screen w-screen items-center justify-center bg-[#C9BDF8]">

//                 <div className="rounded-2xl border-[3px] border-black bg-white px-6 py-5 font-black shadow-[5px_5px_0px_#17151d]">

//                     Project ID is missing.

//                 </div>

//             </main>
//         )
//     }


//     // ============================================================
//     // LOADING
//     // ============================================================

//     if (projectLoading) {

//         return (

//             <main className="flex h-screen w-screen items-center justify-center bg-[#C9BDF8]">

//                 <div className="rounded-2xl border-[3px] border-black bg-white px-6 py-5 font-black shadow-[5px_5px_0px_#17151d]">

//                     Loading project...

//                 </div>

//             </main>
//         )
//     }


//     // ============================================================
//     // ERROR
//     // ============================================================

//     if (
//         projectError ||
//         !project
//     ) {

//         return (

//             <main className="flex h-screen w-screen items-center justify-center bg-[#C9BDF8]">

//                 <div className="max-w-md rounded-2xl border-[3px] border-black bg-white px-6 py-5 shadow-[5px_5px_0px_#17151d]">

//                     <p className="text-lg font-black">
//                         Unable to open project
//                     </p>


//                     <p className="mt-2 text-sm font-medium text-black/60">
//                         {
//                             projectError ||
//                             'Project not found.'
//                         }
//                     </p>

//                 </div>

//             </main>
//         )
//     }


//     // ============================================================
//     // MAIN UI
//     // ============================================================

//     return (

//         <main className="h-screen w-screen overflow-hidden bg-[#C9BDF8] p-3 md:p-4">

//             <div className="flex h-full min-w-0 overflow-x-auto overflow-y-hidden rounded-[28px] border-[3px] border-black bg-[#F8F6FF] shadow-[8px_8px_0px_#17151d]">


//                 {/* =================================================
//                     CHAT
//                 ================================================= */}

//                 <section
//                     className="flex min-w-0 flex-1 flex-col bg-[#F8F6FF]"
//                     style={{
//                         width:
//                             `${chatWidth}px`,

//                         maxWidth:
//                             'calc(100vw - 400px)',

//                         minWidth:
//                             '280px',

//                         flexShrink: 0
//                     }}
//                 >


//                     {/* =================================================
//                         CHAT HEADER
//                     ================================================= */}

//                     <header className="flex items-center justify-between border-b-[3px] border-black bg-[#D5CCFF] px-4 py-3">

//                         <div className="flex min-w-0 items-center gap-3">

//                             <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-[3px] border-black bg-[#FFC928]">

//                                 <div className="flex gap-1">

//                                     <span className="h-2 w-2 rounded-full bg-black" />

//                                     <span className="h-2 w-2 rounded-full bg-black" />

//                                     <span className="h-2 w-2 rounded-full bg-black" />

//                                 </div>

//                             </div>


//                             <div className="min-w-0">

//                                 <h1 className="truncate font-black">
//                                     {project.name}
//                                 </h1>


//                                 <p className="text-xs font-bold text-black/50">

//                                     {project.users?.length || 0}

//                                     {' '}

//                                     collaborators

//                                 </p>

//                             </div>

//                         </div>


//                         <div className="flex shrink-0 gap-2">

//                             <button
//                                 onClick={
//                                     openCollaboratorModal
//                                 }

//                                 className="flex h-9 w-9 items-center justify-center rounded-xl border-2 border-black bg-[#FFC928] text-lg font-black transition hover:-translate-y-0.5 hover:shadow-[2px_2px_0px_#17151d]"
//                             >
//                                 +
//                             </button>




//                         </div>

//                     </header>


//                     {/* =================================================
//                         CHAT CONTENT
//                     ================================================= */}

//                     <div className="flex min-h-0 flex-1 flex-col">


//                         {/* =================================================
//                             MESSAGES
//                         ================================================= */}

//                         <div className="flex-1 space-y-3 overflow-y-auto p-4">

//                             <div className="mb-5 text-center">

//                                 <span className="rounded-full border-2 border-black bg-[#D5CCFF] px-4 py-1.5 text-xs font-black">
//                                     Today
//                                 </span>

//                             </div>


//                             {messages.map(
//                                 msg => {

//                                     const currentId =
//                                         getUserId(
//                                             currentUser
//                                         )


//                                     const senderId =
//                                         getSenderId(
//                                             msg.sender
//                                         )


//                                     const isAI =
//                                         isAiMessage(
//                                             msg
//                                         )


//                                     const isOwn =
//                                         !isAI &&
//                                         Boolean(
//                                             currentId
//                                         ) &&
//                                         Boolean(
//                                             senderId
//                                         ) &&
//                                         senderId ===
//                                         currentId


//                                     return (

//                                         <div
//                                             key={
//                                                 msg._id
//                                             }

//                                             className={`flex ${
//                                                 isOwn
//                                                     ? 'justify-end'
//                                                     : 'justify-start'
//                                             }`}
//                                         >

//                                             <div
//                                                 className={`flex max-w-[88%] flex-col ${
//                                                     isOwn
//                                                         ? 'items-end'
//                                                         : 'items-start'
//                                                 }`}
//                                             >

//                                                 {!isOwn &&
//                                                     !isAI && (

//                                                         <small className="mb-1 ml-2 max-w-full truncate text-[10px] font-black text-black/50">

//                                                             {
//                                                                 msg.sender?.email
//                                                             }

//                                                         </small>

//                                                     )}


//                                                 {isAI ? (

//                                                     WriteAiMessage(
//                                                         msg.message
//                                                     )

//                                                 ) : (

//                                                     <div
//                                                         className={`rounded-2xl border-[3px] border-black px-4 py-3 ${
//                                                             isOwn
//                                                                 ? 'rounded-br-md bg-[#FFC928]'
//                                                                 : 'rounded-bl-md bg-white'
//                                                         }`}
//                                                     >

//                                                         <p className="whitespace-pre-wrap text-sm font-medium leading-relaxed">
//                                                             {
//                                                                 msg.message
//                                                             }
//                                                         </p>

//                                                     </div>

//                                                 )}

//                                             </div>

//                                         </div>
//                                     )
//                                 }
//                             )}


//                             {/* =================================================
//                                 AI THINKING
//                             ================================================= */}

//                             {aiThinking && (

//                                 <div className="flex justify-start">

//                                     <div className="rounded-2xl border-[3px] border-black bg-[#B9A9F5] px-4 py-3">

//                                         <div className="flex items-center gap-2">

//                                             <span className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-black bg-[#FFC928] text-[9px] font-black">
//                                                 AI
//                                             </span>


//                                             <span className="text-xs font-black">
//                                                 Thinking...
//                                             </span>

//                                         </div>

//                                     </div>

//                                 </div>
//                             )}


//                             <div
//                                 ref={
//                                     messagesEndRef
//                                 }
//                             />

//                         </div>


//                         {/* =================================================
//                             INPUT
//                         ================================================= */}

//                         <div className="border-t-[3px] border-black bg-[#EDE9FF] p-3">

//                             {chatError && (

//                                 <div className="mb-2 rounded-xl border-2 border-black bg-white px-3 py-2 text-xs font-bold">
//                                     {chatError}
//                                 </div>

//                             )}


//                             <div className="flex gap-2">

//                                 <input
//                                     value={
//                                         message
//                                     }

//                                     onChange={
//                                         event =>
//                                             setMessage(
//                                                 event.target.value
//                                             )
//                                     }

//                                     onKeyDown={
//                                         handleMessageKeyDown
//                                     }

//                                     type="text"

//                                     placeholder="Type a message... try @AI"

//                                     className="min-w-0 flex-1 rounded-2xl border-[3px] border-black bg-white px-4 py-3 text-sm font-medium outline-none placeholder:text-gray-400 focus:shadow-[3px_3px_0px_#17151d]"
//                                 />


//                                 <button
//                                     onClick={
//                                         send
//                                     }

//                                     className="flex h-[50px] w-[50px] shrink-0 items-center justify-center rounded-2xl border-[3px] border-black bg-[#FFC928] font-black shadow-[3px_3px_0px_#17151d] transition hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
//                                 >
//                                     →
//                                 </button>

//                             </div>


//                             <p className="mt-2 text-center text-[10px] font-bold text-black/40">
//                                 Enter to send · @AI for project assistant
//                             </p>

//                         </div>

//                     </div>

//                 </section>


//                 {/* =================================================
//                     RESIZE HANDLE
//                 ================================================= */}

//                 <div
//                     onPointerDown={
//                         startResize
//                     }

//                     className={`group relative z-20 hidden w-[8px] shrink-0 cursor-col-resize border-x-[2px] border-black bg-[#D5CCFF] md:block ${
//                         isResizing
//                             ? 'bg-[#FFC928]'
//                             : ''
//                     }`}
//                 >

//                     <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col gap-1 rounded-full border-2 border-black bg-white px-1 py-2 opacity-0 shadow-[2px_2px_0px_#17151d] transition group-hover:opacity-100">

//                         <span className="h-1 w-1 rounded-full bg-black" />

//                         <span className="h-1 w-1 rounded-full bg-black" />

//                         <span className="h-1 w-1 rounded-full bg-black" />

//                     </div>

//                 </div>


//                 {/* =================================================
//                     ALWAYS VISIBLE RIGHT PANEL
//                     Collaborators + PDF / RAG
//                 ================================================= */}

//                 <aside
//                     className="flex h-full min-w-[320px] w-[360px] shrink-0 flex-col border-l-[3px] border-black bg-[#F8F6FF]"
//                 >

//                     <header className="flex shrink-0 items-center justify-between border-b-[3px] border-black bg-[#D5CCFF] px-4 py-3">

//                         <div className="min-w-0">

//                             <p className="text-xs font-black uppercase tracking-wider">
//                                 Project
//                             </p>

//                             <h2 className="truncate text-xl font-black">
//                                 Collaborators
//                             </h2>

//                         </div>

//                         <button
//                             onClick={
//                                 openCollaboratorModal
//                             }
//                             className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border-2 border-black bg-[#FFC928] text-lg font-black transition hover:-translate-y-0.5 hover:shadow-[2px_2px_0px_#17151d]"
//                             aria-label="Add collaborator"
//                             title="Add collaborator"
//                         >
//                             +
//                         </button>

//                     </header>


//                     <div className="min-h-0 flex-1 overflow-y-auto">

//                         <div className="p-4">

//                             <div className="mb-4 rounded-2xl border-[2px] border-black bg-[#B9A9F5] p-4">

//                                 <p className="text-sm font-black">
//                                     Team members
//                                 </p>

//                                 <p className="mt-1 text-xs font-medium">
//                                     People currently working on this project.
//                                 </p>

//                             </div>


//                             <div className="space-y-2">

//                                 {(
//                                     project.users ||
//                                     []
//                                 ).map(
//                                     member => {

//                                         const memberId =
//                                             member?._id ||
//                                             member?.id


//                                         const online =
//                                             isUserOnline(
//                                                 memberId
//                                             )


//                                         return (

//                                             <div
//                                                 key={
//                                                     String(
//                                                         memberId
//                                                     )
//                                                 }
//                                                 className="flex items-center gap-3 rounded-2xl border-[2px] border-black bg-white p-3 transition hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_#17151d]"
//                                             >

//                                                 <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-black bg-[#B9A9F5] font-black">

//                                                     {member?.email
//                                                         ?.charAt(0)
//                                                         .toUpperCase() ||
//                                                         '?'}

//                                                     <span
//                                                         className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-black ${
//                                                             online
//                                                                 ? 'bg-green-500'
//                                                                 : 'bg-gray-300'
//                                                         }`}
//                                                     />

//                                                 </div>


//                                                 <div className="min-w-0">

//                                                     <p className="truncate text-sm font-black">
//                                                         {
//                                                             member?.email ||
//                                                             'Unknown user'
//                                                         }
//                                                     </p>

//                                                     <span className="text-[10px] font-bold text-black/50">

//                                                         {online
//                                                             ? 'Online'
//                                                             : 'Offline'}

//                                                     </span>

//                                                 </div>

//                                             </div>

//                                         )
//                                     }
//                                 )}

//                             </div>

//                         </div>


//                         {/* =================================================
//                             PROJECT KNOWLEDGE / RAG
//                         ================================================= */}

//                         <div className="border-t-[3px] border-black p-4">

//                             <div className="mb-3 rounded-2xl border-2 border-black bg-[#EDE9FF] p-3">

//                                 <div className="flex items-start justify-between gap-3">

//                                     <div className="min-w-0">

//                                         <p className="text-xs font-black uppercase tracking-wider">
//                                             Project Knowledge
//                                         </p>

//                                         <p className="mt-1 text-[11px] font-medium text-black/60">
//                                             Upload a PDF and @AI can answer questions using it.
//                                         </p>

//                                     </div>

//                                     <span className="shrink-0 rounded-lg border-2 border-black bg-white px-2 py-1 text-[9px] font-black">
//                                         RAG
//                                     </span>

//                                 </div>

//                             </div>


//                             <input
//                                 ref={
//                                     pdfInputRef
//                                 }
//                                 type="file"
//                                 accept="application/pdf,.pdf"
//                                 onChange={
//                                     handlePdfChange
//                                 }
//                                 className="sr-only"
//                             />


//                             <button
//                                 type="button"
//                                 onClick={() =>
//                                     pdfInputRef.current?.click()
//                                 }
//                                 disabled={
//                                     uploadingPdf
//                                 }
//                                 className="w-full rounded-2xl border-[3px] border-dashed border-black bg-white p-3 text-left transition hover:bg-[#EDE9FF] disabled:cursor-not-allowed disabled:opacity-50"
//                             >

//                                 <div className="flex items-center gap-3">

//                                     <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border-2 border-black bg-[#FFC928] text-sm font-black">
//                                         PDF
//                                     </div>

//                                     <div className="min-w-0 flex-1">

//                                         <p className="truncate text-xs font-black">

//                                             {pdfInput
//                                                 ? pdfInput.name
//                                                 : 'Choose a PDF'}

//                                         </p>

//                                         <p className="mt-1 text-[10px] font-bold text-black/50">

//                                             {pdfInput
//                                                 ? `${(
//                                                     pdfInput.size /
//                                                     (1024 * 1024)
//                                                 ).toFixed(2)} MB · Ready to index`
//                                                 : 'PDF only · Maximum 10 MB'}

//                                         </p>

//                                     </div>

//                                     <span className="shrink-0 text-lg font-black">
//                                         +
//                                     </span>

//                                 </div>

//                             </button>


//                             {pdfInput && (

//                                 <button
//                                     type="button"
//                                     onClick={
//                                         clearPdfSelection
//                                     }
//                                     disabled={
//                                         uploadingPdf
//                                     }
//                                     className="mt-2 w-full rounded-xl border-2 border-black bg-white px-3 py-2 text-[10px] font-black hover:bg-[#FFC928] disabled:opacity-50"
//                                 >
//                                     Remove selected PDF
//                                 </button>

//                             )}


//                             <button
//                                 type="button"
//                                 onClick={
//                                     uploadPdf
//                                 }
//                                 disabled={
//                                     !pdfInput ||
//                                     uploadingPdf
//                                 }
//                                 className="mt-2 w-full rounded-xl border-2 border-black bg-[#FFC928] px-3 py-2 text-xs font-black shadow-[2px_2px_0px_#17151d] transition hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none disabled:cursor-not-allowed disabled:opacity-50"
//                             >

//                                 {uploadingPdf
//                                     ? 'Indexing PDF...'
//                                     : 'Add PDF to RAG'}

//                             </button>


//                             {uploadingPdf && (

//                                 <div className="mt-2 rounded-xl border-2 border-black bg-white px-3 py-2">

//                                     <div className="flex items-center gap-2">

//                                         <span className="h-2.5 w-2.5 animate-pulse rounded-full border-2 border-black bg-[#FFC928]" />

//                                         <p className="text-[10px] font-black">
//                                             Reading PDF and creating searchable vectors...
//                                         </p>

//                                     </div>

//                                 </div>

//                             )}


//                             {pdfStatus && !uploadingPdf && (

//                                 <div className="mt-2 rounded-xl border-2 border-black bg-[#B9A9F5] px-3 py-2">

//                                     <p className="text-[10px] font-black">
//                                         ✓ {pdfStatus}
//                                     </p>

//                                 </div>

//                             )}


//                             {pdfError && !uploadingPdf && (

//                                 <div className="mt-2 rounded-xl border-2 border-black bg-white px-3 py-2">

//                                     <p className="text-[10px] font-black">
//                                         {pdfError}
//                                     </p>

//                                 </div>

//                             )}

//                         </div>

//                     </div>


//                     <div className="shrink-0 border-t-[3px] border-black p-4">

//                         <button
//                             onClick={
//                                 openCollaboratorModal
//                             }
//                             className="w-full rounded-2xl border-[3px] border-black bg-[#FFC928] px-4 py-3 font-black shadow-[3px_3px_0px_#17151d]"
//                         >
//                             + Add collaborator
//                         </button>

//                     </div>

//                 </aside>


//                 </div>


//             {/* =========================================================
//                 ADD COLLABORATOR MODAL
//             ========================================================= */}

//             {isModalOpen && (

//                 <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-5">

//                     <div className="w-full max-w-md overflow-hidden rounded-[28px] border-[3px] border-black bg-[#F8F6FF] shadow-[8px_8px_0px_#17151d]">


//                         <header className="flex items-center justify-between border-b-[3px] border-black bg-[#B9A9F5] px-5 py-4">

//                             <div>

//                                 <p className="text-xs font-black uppercase tracking-wider">
//                                     Project
//                                 </p>


//                                 <h2 className="text-xl font-black">
//                                     Add collaborator
//                                 </h2>

//                             </div>


//                             <button
//                                 onClick={() =>
//                                     setIsModalOpen(
//                                         false
//                                     )
//                                 }

//                                 className="flex h-9 w-9 items-center justify-center rounded-xl border-2 border-black bg-white font-black hover:bg-[#FFC928]"
//                             >
//                                 ×
//                             </button>

//                         </header>


//                         <div className="max-h-[400px] overflow-y-auto p-4">

//                             <p className="mb-4 text-sm font-medium text-black/60">
//                                 Select people you want to invite.
//                             </p>


//                             {collaboratorError && (

//                                 <div className="mb-3 rounded-xl border-2 border-black bg-white px-3 py-2 text-xs font-bold">
//                                     {collaboratorError}
//                                 </div>

//                             )}


//                             <div className="space-y-2">

//                                 {allUsers
//                                     .filter(
//                                         user => {

//                                             const id =
//                                                 user?._id ||
//                                                 user?.id


//                                             const alreadyMember =
//                                                 (
//                                                     project.users ||
//                                                     []
//                                                 ).some(
//                                                     member =>
//                                                         String(
//                                                             member?._id ||
//                                                             member?.id
//                                                         ) ===
//                                                         String(
//                                                             id
//                                                         )
//                                                 )


//                                             return (
//                                                 id &&
//                                                 !alreadyMember
//                                             )
//                                         }
//                                     )
//                                     .map(
//                                         user => {

//                                             const userId =
//                                                 user._id ||
//                                                 user.id


//                                             const isSelected =
//                                                 selectedUserId.has(
//                                                     userId
//                                                 )


//                                             return (

//                                                 <button
//                                                     key={
//                                                         userId
//                                                     }

//                                                     onClick={() =>
//                                                         handleUserClick(
//                                                             userId
//                                                         )
//                                                     }

//                                                     className={`flex w-full items-center gap-3 rounded-2xl border-[2px] border-black p-3 text-left transition ${
//                                                         isSelected
//                                                             ? 'bg-[#FFC928] shadow-[3px_3px_0px_#17151d]'
//                                                             : 'bg-white hover:bg-[#EDE9FF]'
//                                                     }`}
//                                                 >

//                                                     <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-black bg-[#B9A9F5] font-black">

//                                                         {user.email
//                                                             ?.charAt(
//                                                                 0
//                                                             )
//                                                             .toUpperCase()}

//                                                     </div>


//                                                     <div className="min-w-0 flex-1">

//                                                         <p className="truncate text-sm font-black">
//                                                             {
//                                                                 user.email
//                                                             }
//                                                         </p>


//                                                         <p className="text-[10px] font-bold text-black/50">
//                                                             Available to collaborate
//                                                         </p>

//                                                     </div>


//                                                     <div
//                                                         className={`flex h-6 w-6 items-center justify-center rounded-full border-2 border-black ${
//                                                             isSelected
//                                                                 ? 'bg-black text-white'
//                                                                 : 'bg-white'
//                                                         }`}
//                                                     >

//                                                         {isSelected &&
//                                                             '✓'}

//                                                     </div>

//                                                 </button>
//                                             )
//                                         }
//                                     )}

//                             </div>

//                         </div>


//                         <footer className="border-t-[3px] border-black p-4">

//                             <button
//                                 onClick={
//                                     addCollaborators
//                                 }

//                                 disabled={
//                                     addingUsers
//                                 }

//                                 className="w-full rounded-2xl border-[3px] border-black bg-[#FFC928] px-4 py-3 font-black shadow-[3px_3px_0px_#17151d] transition hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none disabled:opacity-50"
//                             >

//                                 {addingUsers
//                                     ? 'Adding...'
//                                     : 'Add Collaborators →'}

//                             </button>

//                         </footer>

//                     </div>

//                 </div>

//             )}

//         </main>
//     )
// }


// export default Project



import React, {
    useContext,
    useEffect,
    useRef,
    useState
} from 'react'



import {
    useNavigate,
    useParams
} from 'react-router-dom'

import {
    io
} from 'socket.io-client'

import axios from '../config/axios'

import {
    UserContext
} from '../context/user.context'


const API_URL =
    import.meta.env.VITE_API_URL ||
    'http://localhost:3000'


const Project = () => {
    


    const {
        projectId
    } = useParams()


    const navigate =
        useNavigate()


    const {
        user: currentUser
    } = useContext(
        UserContext
    )


    // ============================================================
    // AUTH
    // ============================================================

    const getToken = () =>
        localStorage.getItem('token')


    // ============================================================
    // PROJECT
    // ============================================================

    const [
        project,
        setProject
    ] = useState(null)


    const [
        projectLoading,
        setProjectLoading
    ] = useState(true)


    const [
        projectError,
        setProjectError
    ] = useState('')


    // ============================================================
    // CHAT
    // ============================================================

    const [
        messages,
        setMessages
    ] = useState([])


    const [
        message,
        setMessage
    ] = useState('')


    const [
        aiThinking,
        setAiThinking
    ] = useState(false)


    const [
        chatError,
        setChatError
    ] = useState('')


    const messagesEndRef =
        useRef(null)


    const socketRef =
        useRef(null)


    // ============================================================
    // CHAT RESIZE
    // ============================================================

    const [
        chatWidth,
        setChatWidth
    ] = useState(420)


    const [
        isResizing,
        setIsResizing
    ] = useState(false)


    const resizeRef =
        useRef(false)


    const resizeStartRef =
        useRef({
            x: 0,
            width: 420
        })


    // ============================================================
    // COLLABORATORS
    // ============================================================

    const [
        isModalOpen,
        setIsModalOpen
    ] = useState(false)


    const [
        selectedUserId,
        setSelectedUserId
    ] = useState(new Set())


    const [
        allUsers,
        setAllUsers
    ] = useState([])


    const [
        addingUsers,
        setAddingUsers
    ] = useState(false)


    const [
        collaboratorError,
        setCollaboratorError
    ] = useState('')


    const [
        onlineUsers,
        setOnlineUsers
    ] = useState([])


    // ============================================================
    // PDF / RAG
    // ============================================================

    const [
        pdfInput,
        setPdfInput
    ] = useState(null)


    const [
        uploadingPdf,
        setUploadingPdf
    ] = useState(false)

    const [
        pdfStatus,
        setPdfStatus
    ] = useState('')

    const [
        pdfError,
        setPdfError
    ] = useState('')

    const pdfInputRef =
        useRef(null)


    // ============================================================
    // LOAD PROJECT
    // ============================================================

    useEffect(() => {

        let cancelled = false


        const loadProject =
            async () => {

                if (!projectId) {

                    setProjectError(
                        'Project ID is missing.'
                    )

                    setProjectLoading(false)

                    return
                }


                try {

                    setProjectLoading(true)

                    setProjectError('')


                    const response =
                        await axios.get(
                            `/projects/get-project/${projectId}`
                        )


                    if (cancelled) {
                        return
                    }


                    const loadedProject =
                        response.data?.project


                    if (!loadedProject) {

                        throw new Error(
                            'Project was not returned by backend.'
                        )
                    }


                    setProject(
                        loadedProject
                    )

                } catch (error) {

                    console.error(
                        'Loading project failed:',
                        error.response?.data ||
                        error
                    )


                    if (!cancelled) {

                        if (
                            error.response?.status === 401
                        ) {

                            localStorage.removeItem(
                                'token'
                            )

                            navigate(
                                '/login',
                                {
                                    replace: true
                                }
                            )

                            return
                        }


                        setProjectError(
                            error.response?.data?.error ||
                            error.response?.data?.message ||
                            error.message ||
                            'Unable to load project.'
                        )
                    }

                } finally {

                    if (!cancelled) {

                        setProjectLoading(
                            false
                        )
                    }
                }
            }


        loadProject()


        return () => {
            cancelled = true
        }

    }, [
        projectId,
        navigate
    ])


    // ============================================================
    // LOAD CHAT HISTORY
    // ============================================================

    useEffect(() => {

        if (!projectId) {
            return
        }


        let cancelled = false


        const loadMessages =
            async () => {

                try {

                    const response =
                        await axios.get(
                            `/messages/${projectId}`
                        )


                    if (cancelled) {
                        return
                    }


                    setMessages(
                        (
                            response.data?.messages ||
                            []
                        ).map(
                            normalizeMessage
                        )
                    )

                } catch (error) {

                    console.error(
                        'Failed to load messages:',
                        error.response?.data ||
                        error
                    )
                }
            }


        loadMessages()


        return () => {
            cancelled = true
        }

    }, [
        projectId
    ])


    // ============================================================
    // SOCKET.IO
    // ============================================================

    useEffect(() => {

        if (
            !projectId ||
            !getToken()
        ) {
            return
        }

        const socket = io(API_URL, {
            auth: {
                token: getToken()
            },
            withCredentials: true,
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: Infinity,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            timeout: 20000
        })

        socketRef.current = socket

        // `connect` fires again after every successful reconnect.
        // This restores the project room and Redis presence.
        socket.on(
            'connect',
            () => {
                console.log(
                    'Socket connected:',
                    socket.id
                )

                setChatError('')

                socket.emit(
                    'join-project',
                    projectId
                )
            }
        )

        // --------------------------------------------------------
        // PRESENCE HEARTBEAT
        // --------------------------------------------------------
        // Redis presence expires after 45 seconds.
        // Refresh every 15 seconds while this socket is connected.
        const heartbeat = window.setInterval(() => {
            if (socket.connected) {
                socket.emit(
                    'presence-heartbeat',
                    projectId
                )
            }
        }, 15000)

        // --------------------------------------------------------
        // NORMAL + AI MESSAGE
        // --------------------------------------------------------

        socket.on(
            'project-message',
            incomingMessage => {

                const normalized =
                    normalizeMessage(
                        incomingMessage
                    )

                setMessages(
                    previous => {

                        const exists =
                            previous.some(
                                item =>
                                    item._id ===
                                    normalized._id
                            )

                        if (exists) {
                            return previous
                        }

                        return [
                            ...previous,
                            normalized
                        ]
                    }
                )
            }
        )

        // --------------------------------------------------------
        // AI THINKING
        // --------------------------------------------------------

        socket.on(
            'ai-status',
            data => {
                setAiThinking(
                    data?.status ===
                    'thinking'
                )
            }
        )

        // --------------------------------------------------------
        // ONLINE USERS
        // --------------------------------------------------------

        socket.on(
            'online-users',
            users => {
                setOnlineUsers(
                    Array.isArray(users)
                        ? users
                        : []
                )
            }
        )

        // --------------------------------------------------------
        // SOCKET ERROR
        // --------------------------------------------------------

        socket.on(
            'project-error',
            data => {

                const errorMessage =
                    data?.message ||
                    data?.error ||
                    'Failed to process message.'

                console.error(
                    'Project socket error:',
                    errorMessage
                )

                setChatError(
                    errorMessage
                )
            }
        )

        socket.on(
            'connect_error',
            error => {
                console.error(
                    'Socket connect error:',
                    error.message
                )
            }
        )

        socket.on(
            'disconnect',
            reason => {
                console.warn(
                    'Socket disconnected:',
                    reason
                )
            }
        )

        return () => {
            window.clearInterval(heartbeat)
            socket.disconnect()
            socketRef.current = null
        }

    }, [
        projectId
    ])


    // ============================================================
    // MESSAGE NORMALIZER
    // ============================================================

    function normalizeMessage(
        msg = {}
    ) {

        const rawSender =
            msg.sender


        const isAI =
            msg.role === 'assistant' ||
            msg.role === 'ai'


        const sender =
            rawSender &&
            typeof rawSender === 'object'

                ? {
                    ...rawSender,

                    _id:
                        rawSender._id ||
                        rawSender.id ||
                        rawSender.userId,

                    email:
                        rawSender.email ||
                        msg.senderEmail ||
                        ''
                }

                : {
                    _id:
                        isAI
                            ? 'ai'
                            : rawSender ||
                              msg.senderId ||
                              '',

                    email:
                        isAI
                            ? 'AI Assistant'
                            : msg.senderEmail ||
                              ''
                }


        return {

            ...msg,

            _id:
                String(
                    msg._id ||
                    msg.id ||
                    `${Date.now()}-${Math.random()}`
                ),

            sender,

            role:
                msg.role ||
                'user',

            message:
                msg.message ||
                msg.content ||
                ''
        }
    }


    // ============================================================
    // USER ID
    // ============================================================

    const getUserId =
        user => {

            if (user) {

                const id =
                    user._id ||
                    user.id ||
                    user.userId


                if (id) {
                    return String(id)
                }
            }


            try {

                const token =
                    getToken()


                if (!token) {
                    return ''
                }


                const payload =
                    JSON.parse(
                        atob(
                            token.split('.')[1]
                        )
                    )


                return String(
                    payload._id ||
                    payload.id ||
                    payload.userId ||
                    ''
                )

            } catch {

                return ''
            }
        }


    // ============================================================
    // SENDER ID
    // ============================================================

    const getSenderId =
        sender => {

            if (!sender) {
                return ''
            }


            if (
                typeof sender ===
                'string'
            ) {
                return String(
                    sender
                )
            }


            return String(
                sender._id ||
                sender.id ||
                sender.userId ||
                ''
            )
        }


    // ============================================================
    // AI MESSAGE
    // ============================================================

    const isAiMessage =
        msg => {

            return (
                msg?.role ===
                    'assistant' ||

                msg?.role ===
                    'ai' ||

                getSenderId(
                    msg?.sender
                ) === 'ai'
            )
        }


    // ============================================================
    // AUTO SCROLL
    // ============================================================

    useEffect(() => {

        messagesEndRef.current?.scrollIntoView({
            behavior: 'smooth'
        })

    }, [
        messages,
        aiThinking
    ])


    // ============================================================
    // LOGOUT
    // ============================================================

    const handleLogout = () => {
        const socket = socketRef.current

        if (socket) {
            socket.disconnect()
        }

        socketRef.current = null
        localStorage.removeItem('token')
        navigate('/login', { replace: true })
    }


    // ============================================================
    // SEND MESSAGE
    // ============================================================

    const send =
        () => {

            const cleanMessage =
                message.trim()


            if (
                !cleanMessage ||
                !projectId
            ) {
                return
            }


            const socket =
                socketRef.current


            if (
                !socket ||
                !socket.connected
            ) {

                setChatError(
                    'Chat connection is not ready.'
                )

                return
            }


            setChatError('')


            socket.emit(
                'project-message',
                {
                    projectId,

                    message:
                        cleanMessage
                }
            )


            setMessage('')
        }


    // ============================================================
    // ENTER TO SEND
    // ============================================================

    const handleMessageKeyDown =
        event => {

            if (
                event.key ===
                    'Enter' &&
                !event.shiftKey
            ) {

                event.preventDefault()

                send()
            }
        }


    // ============================================================
    // FLEXIBLE CHAT RESIZE
    // ============================================================

    useEffect(() => {

        const handlePointerMove =
            event => {

                if (
                    !resizeRef.current
                ) {
                    return
                }


                const delta =
                    event.clientX -
                    resizeStartRef.current.x


                /*
                 * Chat is NEVER hidden because
                 * of width.
                 *
                 * It simply becomes smaller.
                 */

                const minWidth =
                    280


                /*
                 * Don't let chat consume
                 * almost the entire screen.
                 */

                const rightPanelWidth = 360
                const resizeHandleWidth = 8
                const pagePadding = 32

                const maxWidth =
                    Math.max(
                        minWidth,
                        window.innerWidth -
                        rightPanelWidth -
                        resizeHandleWidth -
                        pagePadding
                    )


                const nextWidth =
                    Math.min(
                        maxWidth,
                        Math.max(
                            minWidth,
                            resizeStartRef.current.width +
                            delta
                        )
                    )


                setChatWidth(
                    nextWidth
                )
            }


        const stopResize =
            () => {

                resizeRef.current =
                    false


                setIsResizing(
                    false
                )


                document.body.style.cursor =
                    ''


                document.body.style.userSelect =
                    ''
            }


        window.addEventListener(
            'pointermove',
            handlePointerMove
        )


        window.addEventListener(
            'pointerup',
            stopResize
        )


        return () => {

            window.removeEventListener(
                'pointermove',
                handlePointerMove
            )


            window.removeEventListener(
                'pointerup',
                stopResize
            )
        }

    }, [])


    const startResize =
        event => {

            event.preventDefault()


            resizeRef.current =
                true


            resizeStartRef.current = {

                x:
                    event.clientX,

                width:
                    chatWidth
            }


            setIsResizing(
                true
            )


            document.body.style.cursor =
                'col-resize'


            document.body.style.userSelect =
                'none'
        }


    // ============================================================
    // COLLABORATOR MODAL
    // ============================================================

    const openCollaboratorModal =
        async () => {

            setSelectedUserId(
                new Set()
            )


            setCollaboratorError('')


            setIsModalOpen(
                true
            )


            try {

                const response =
                    await axios.get(
                        '/users/all'
                    )


                const users =
                    response.data?.users ||
                    response.data?.data ||
                    []


                setAllUsers(
                    Array.isArray(users)
                        ? users
                        : []
                )

            } catch (error) {

                console.error(
                    'Failed to load users:',
                    error.response?.data ||
                    error
                )


                setAllUsers([])


                setCollaboratorError(
                    error.response?.data?.error ||
                    'Unable to load users.'
                )
            }
        }


    // ============================================================
    // SELECT USER
    // ============================================================

    const handleUserClick =
        id => {

            setSelectedUserId(
                previous => {

                    const next =
                        new Set(
                            previous
                        )


                    if (
                        next.has(id)
                    ) {

                        next.delete(id)

                    } else {

                        next.add(id)
                    }


                    return next
                }
            )
        }


    // ============================================================
    // ADD COLLABORATORS
    // ============================================================

    const addCollaborators =
        async () => {

            const users =
                Array.from(
                    selectedUserId
                )


            if (
                !users.length ||
                !projectId
            ) {

                setIsModalOpen(
                    false
                )

                return
            }


            try {

                setAddingUsers(
                    true
                )


                const response =
                    await axios.put(
                        '/projects/add-user',
                        {
                            projectId,
                            users
                        }
                    )


                const updatedProject =
                    response.data?.project ||
                    response.data


                if (
                    updatedProject?.users
                ) {

                    setProject(
                        previous => ({
                            ...previous,
                            ...updatedProject
                        })
                    )

                } else {

                    const refreshed =
                        await axios.get(
                            `/projects/get-project/${projectId}`
                        )


                    setProject(
                        refreshed.data.project
                    )
                }


                setSelectedUserId(
                    new Set()
                )


                setIsModalOpen(
                    false
                )

            } catch (error) {

                console.error(
                    'Add collaborators failed:',
                    error.response?.data ||
                    error
                )


                setCollaboratorError(
                    error.response?.data?.error ||
                    'Unable to add collaborators.'
                )

            } finally {

                setAddingUsers(
                    false
                )
            }
        }


    // ============================================================
    // ONLINE USER
    // ============================================================

    const isUserOnline =
        id => {

            return onlineUsers.some(
                user => {

                    if (
                        typeof user ===
                        'string'
                    ) {

                        return (
                            user ===
                            String(id)
                        )
                    }


                    return (
                        String(
                            user?._id ||
                            user?.id ||
                            user?.userId
                        ) ===
                        String(id)
                    )
                }
            )
        }


    // ============================================================
    // PDF UPLOAD
    // ============================================================

    const handlePdfChange =
        event => {

            const file =
                event.target.files?.[0] ||
                null

            setPdfStatus('')
            setPdfError('')

            if (!file) {
                setPdfInput(null)
                return
            }

            const isPdf =
                file.type === 'application/pdf' ||
                file.name
                    .toLowerCase()
                    .endsWith('.pdf')

            if (!isPdf) {
                setPdfInput(null)
                setPdfError(
                    'Please select a PDF file.'
                )

                if (pdfInputRef.current) {
                    pdfInputRef.current.value = ''
                }

                return
            }

            const maxSize =
                10 * 1024 * 1024

            if (file.size > maxSize) {
                setPdfInput(null)
                setPdfError(
                    'PDF must be smaller than 10 MB.'
                )

                if (pdfInputRef.current) {
                    pdfInputRef.current.value = ''
                }

                return
            }

            setPdfInput(file)
        }


    const clearPdfSelection =
        () => {

            setPdfInput(null)
            setPdfStatus('')
            setPdfError('')

            if (pdfInputRef.current) {
                pdfInputRef.current.value = ''
            }
        }


    const uploadPdf = async () => {

        if (!pdfInput || !projectId) {
            setPdfError(
                'Select a PDF before uploading.'
            )
            return
        }

        setUploadingPdf(true)
        setPdfStatus('')
        setPdfError('')

        try {

            const formData =
                new FormData()

            formData.append(
                'file',
                pdfInput
            )

            const response =
                await axios.post(
                    `/ai/projects/${projectId}/documents`,
                    formData
                )

            const result =
                response.data?.data ||
                response.data ||
                {}

            const fileName =
                result.fileName ||
                pdfInput.name

            const chunkCount =
                Number(result.chunks) || 0

            setPdfStatus(
                chunkCount > 0
                    ? `${fileName} indexed successfully · ${chunkCount} chunks`
                    : `${fileName} indexed successfully`
            )

            setPdfInput(null)

            if (pdfInputRef.current) {
                pdfInputRef.current.value = ''
            }

        } catch (error) {

            console.error(
                'PDF upload failed:',
                error
            )

            const status =
                error.response?.status

            const backendMessage =
                error.response?.data?.message ||
                error.response?.data?.error ||
                error.response?.data?.errors?.[0]?.msg

            setPdfError(
                backendMessage ||
                (
                    status === 413
                        ? 'PDF is too large.'
                        : status === 401
                            ? 'Your session expired. Please log in again.'
                            : 'Failed to upload and index the PDF.'
                )
            )

        } finally {

            setUploadingPdf(false)
        }
    }



    // ============================================================
    // AI MESSAGE UI
    // ============================================================

    function WriteAiMessage(
        content
    ) {

        return (

            <div className="rounded-2xl border-2 border-black bg-[#B9A9F5] p-4">

                <div className="mb-2 flex items-center gap-2">

                    <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-black bg-[#FFC928] text-xs font-black">
                        AI
                    </div>


                    <span className="text-xs font-black">
                        AI Assistant
                    </span>

                </div>


                <p className="whitespace-pre-wrap text-sm font-medium leading-relaxed">
                    {content}
                </p>

            </div>
        )
    }


    // ============================================================
    // MISSING PROJECT ID
    // ============================================================

    if (!projectId) {

        return (

            <main className="flex h-screen w-screen items-center justify-center bg-[#C9BDF8]">

                <div className="rounded-2xl border-[3px] border-black bg-white px-6 py-5 font-black shadow-[5px_5px_0px_#17151d]">

                    Project ID is missing.

                </div>

            </main>
        )
    }


    // ============================================================
    // LOADING
    // ============================================================

    if (projectLoading) {

        return (

            <main className="flex h-screen w-screen items-center justify-center bg-[#C9BDF8]">

                <div className="rounded-2xl border-[3px] border-black bg-white px-6 py-5 font-black shadow-[5px_5px_0px_#17151d]">

                    Loading project...

                </div>

            </main>
        )
    }


    // ============================================================
    // ERROR
    // ============================================================

    if (
        projectError ||
        !project
    ) {

        return (

            <main className="flex h-screen w-screen items-center justify-center bg-[#C9BDF8]">

                <div className="max-w-md rounded-2xl border-[3px] border-black bg-white px-6 py-5 shadow-[5px_5px_0px_#17151d]">

                    <p className="text-lg font-black">
                        Unable to open project
                    </p>


                    <p className="mt-2 text-sm font-medium text-black/60">
                        {
                            projectError ||
                            'Project not found.'
                        }
                    </p>

                </div>

            </main>
        )
    }


    // ============================================================
    // MAIN UI
    // ============================================================

    return (

        <main className="h-screen w-screen overflow-hidden bg-[#C9BDF8] p-3 md:p-4">

            <div className="flex h-full min-w-0 overflow-x-auto overflow-y-hidden rounded-[28px] border-[3px] border-black bg-[#F8F6FF] shadow-[8px_8px_0px_#17151d]">


                {/* =================================================
                    CHAT
                ================================================= */}

                <section
                    className="flex min-w-0 flex-1 flex-col bg-[#F8F6FF]"
                    style={{
                        width:
                            `${chatWidth}px`,

                        maxWidth:
                            'calc(100vw - 400px)',

                        minWidth:
                            '280px',

                        flexShrink: 0
                    }}
                >


                    {/* =================================================
                        CHAT HEADER
                    ================================================= */}

                    <header className="flex items-center justify-between border-b-[3px] border-black bg-[#D5CCFF] px-4 py-3">

                        <div className="flex min-w-0 items-center gap-3">

                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-[3px] border-black bg-[#FFC928]">

                                <div className="flex gap-1">

                                    <span className="h-2 w-2 rounded-full bg-black" />

                                    <span className="h-2 w-2 rounded-full bg-black" />

                                    <span className="h-2 w-2 rounded-full bg-black" />

                                </div>

                            </div>


                            <div className="min-w-0">

                                <h1 className="truncate font-black">
                                    {project.name}
                                </h1>


                                <p className="text-xs font-bold text-black/50">

                                    {project.users?.length || 0}

                                    {' '}

                                    collaborators

                                </p>

                            </div>

                        </div>


                        <div className="flex shrink-0 gap-2">

                            <button
                                onClick={
                                    openCollaboratorModal
                                }

                                className="flex h-9 w-9 items-center justify-center rounded-xl border-2 border-black bg-[#FFC928] text-lg font-black transition hover:-translate-y-0.5 hover:shadow-[2px_2px_0px_#17151d]"
                            >
                                +
                            </button>

                            <button
                                onClick={
                                    handleLogout
                                }
                                className="rounded-xl border-2 border-black bg-white px-3 py-2 text-xs font-black transition hover:-translate-y-0.5 hover:bg-[#FFC928] hover:shadow-[2px_2px_0px_#17151d]"
                                aria-label="Logout"
                                title="Logout"
                            >
                                Logout
                            </button>

                            <button
    onClick={() => navigate('/')}
    className="px-4 py-2 rounded-lg border bg-white hover:-translate-y-0.5 hover:bg-[#FFC928] hover:shadow-[2px_2px_0px_#17151d] transition"
>
    ← Home
</button>




                        </div>

                    </header>


                    {/* =================================================
                        CHAT CONTENT
                    ================================================= */}

                    <div className="flex min-h-0 flex-1 flex-col">


                        {/* =================================================
                            MESSAGES
                        ================================================= */}

                        <div className="flex-1 space-y-3 overflow-y-auto p-4">

                            <div className="mb-5 text-center">

                                <span className="rounded-full border-2 border-black bg-[#D5CCFF] px-4 py-1.5 text-xs font-black">
                                    Today
                                </span>

                            </div>


                            {messages.map(
                                msg => {

                                    const currentId =
                                        getUserId(
                                            currentUser
                                        )


                                    const senderId =
                                        getSenderId(
                                            msg.sender
                                        )


                                    const isAI =
                                        isAiMessage(
                                            msg
                                        )


                                    const isOwn =
                                        !isAI &&
                                        Boolean(
                                            currentId
                                        ) &&
                                        Boolean(
                                            senderId
                                        ) &&
                                        senderId ===
                                        currentId


                                    return (

                                        <div
                                            key={
                                                msg._id
                                            }

                                            className={`flex ${
                                                isOwn
                                                    ? 'justify-end'
                                                    : 'justify-start'
                                            }`}
                                        >

                                            <div
                                                className={`flex max-w-[88%] flex-col ${
                                                    isOwn
                                                        ? 'items-end'
                                                        : 'items-start'
                                                }`}
                                            >

                                                {!isOwn &&
                                                    !isAI && (

                                                        <small className="mb-1 ml-2 max-w-full truncate text-[10px] font-black text-black/50">

                                                            {
                                                                msg.sender?.email
                                                            }

                                                        </small>

                                                    )}


                                                {isAI ? (

                                                    WriteAiMessage(
                                                        msg.message
                                                    )

                                                ) : (

                                                    <div
                                                        className={`rounded-2xl border-[3px] border-black px-4 py-3 ${
                                                            isOwn
                                                                ? 'rounded-br-md bg-[#FFC928]'
                                                                : 'rounded-bl-md bg-white'
                                                        }`}
                                                    >

                                                        <p className="whitespace-pre-wrap text-sm font-medium leading-relaxed">
                                                            {
                                                                msg.message
                                                            }
                                                        </p>

                                                    </div>

                                                )}

                                            </div>

                                        </div>
                                    )
                                }
                            )}


                            {/* =================================================
                                AI THINKING
                            ================================================= */}

                            {aiThinking && (

                                <div className="flex justify-start">

                                    <div className="rounded-2xl border-[3px] border-black bg-[#B9A9F5] px-4 py-3">

                                        <div className="flex items-center gap-2">

                                            <span className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-black bg-[#FFC928] text-[9px] font-black">
                                                AI
                                            </span>


                                            <span className="text-xs font-black">
                                                Thinking...
                                            </span>

                                        </div>

                                    </div>

                                </div>
                            )}


                            <div
                                ref={
                                    messagesEndRef
                                }
                            />

                        </div>


                        {/* =================================================
                            INPUT
                        ================================================= */}

                        <div className="border-t-[3px] border-black bg-[#EDE9FF] p-3">

                            {chatError && (

                                <div className="mb-2 rounded-xl border-2 border-black bg-white px-3 py-2 text-xs font-bold">
                                    {chatError}
                                </div>

                            )}


                            <div className="flex gap-2">

                                <input
                                    value={
                                        message
                                    }

                                    onChange={
                                        event =>
                                            setMessage(
                                                event.target.value
                                            )
                                    }

                                    onKeyDown={
                                        handleMessageKeyDown
                                    }

                                    type="text"

                                    placeholder="Type a message... try @AI"

                                    className="min-w-0 flex-1 rounded-2xl border-[3px] border-black bg-white px-4 py-3 text-sm font-medium outline-none placeholder:text-gray-400 focus:shadow-[3px_3px_0px_#17151d]"
                                />


                                <button
                                    onClick={
                                        send
                                    }

                                    className="flex h-[50px] w-[50px] shrink-0 items-center justify-center rounded-2xl border-[3px] border-black bg-[#FFC928] font-black shadow-[3px_3px_0px_#17151d] transition hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
                                >
                                    →
                                </button>

                            </div>


                            <p className="mt-2 text-center text-[10px] font-bold text-black/40">
                                Enter to send · @AI for project assistant
                            </p>

                        </div>

                    </div>

                </section>


                {/* =================================================
                    RESIZE HANDLE
                ================================================= */}

                <div
                    onPointerDown={
                        startResize
                    }

                    className={`group relative z-20 hidden w-[8px] shrink-0 cursor-col-resize border-x-[2px] border-black bg-[#D5CCFF] md:block ${
                        isResizing
                            ? 'bg-[#FFC928]'
                            : ''
                    }`}
                >

                    <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col gap-1 rounded-full border-2 border-black bg-white px-1 py-2 opacity-0 shadow-[2px_2px_0px_#17151d] transition group-hover:opacity-100">

                        <span className="h-1 w-1 rounded-full bg-black" />

                        <span className="h-1 w-1 rounded-full bg-black" />

                        <span className="h-1 w-1 rounded-full bg-black" />

                    </div>

                </div>


                {/* =================================================
                    ALWAYS VISIBLE RIGHT PANEL
                    Collaborators + PDF / RAG
                ================================================= */}

                <aside
                    className="flex h-full min-w-[320px] w-[360px] shrink-0 flex-col border-l-[3px] border-black bg-[#F8F6FF]"
                >

                    <header className="flex shrink-0 items-center justify-between border-b-[3px] border-black bg-[#D5CCFF] px-4 py-3">

                        <div className="min-w-0">

                            <p className="text-xs font-black uppercase tracking-wider">
                                Project
                            </p>

                            <h2 className="truncate text-xl font-black">
                                Collaborators
                            </h2>

                        </div>

                        <button
                            onClick={
                                openCollaboratorModal
                            }
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border-2 border-black bg-[#FFC928] text-lg font-black transition hover:-translate-y-0.5 hover:shadow-[2px_2px_0px_#17151d]"
                            aria-label="Add collaborator"
                            title="Add collaborator"
                        >
                            +
                        </button>

                    </header>


                    <div className="min-h-0 flex-1 overflow-y-auto">

                        <div className="p-4">

                            <div className="mb-4 rounded-2xl border-[2px] border-black bg-[#B9A9F5] p-4">

                                <p className="text-sm font-black">
                                    Team members
                                </p>

                                <p className="mt-1 text-xs font-medium">
                                    People currently working on this project.
                                </p>

                            </div>


                            <div className="space-y-2">

                                {(
                                    project.users ||
                                    []
                                ).map(
                                    member => {

                                        const memberId =
                                            member?._id ||
                                            member?.id


                                        const online =
                                            isUserOnline(
                                                memberId
                                            )


                                        return (

                                            <div
                                                key={
                                                    String(
                                                        memberId
                                                    )
                                                }
                                                className="flex items-center gap-3 rounded-2xl border-[2px] border-black bg-white p-3 transition hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_#17151d]"
                                            >

                                                <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-black bg-[#B9A9F5] font-black">

                                                    {member?.email
                                                        ?.charAt(0)
                                                        .toUpperCase() ||
                                                        '?'}

                                                    <span
                                                        className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-black ${
                                                            online
                                                                ? 'bg-green-500'
                                                                : 'bg-gray-300'
                                                        }`}
                                                    />

                                                </div>


                                                <div className="min-w-0">

                                                    <p className="truncate text-sm font-black">
                                                        {
                                                            member?.email ||
                                                            'Unknown user'
                                                        }
                                                    </p>

                                                    <span className="text-[10px] font-bold text-black/50">

                                                        {online
                                                            ? 'Online'
                                                            : 'Offline'}

                                                    </span>

                                                </div>

                                            </div>

                                        )
                                    }
                                )}

                            </div>

                        </div>


                        {/* =================================================
                            PROJECT KNOWLEDGE / RAG
                        ================================================= */}

                        <div className="border-t-[3px] border-black p-4">

                            <div className="mb-3 rounded-2xl border-2 border-black bg-[#EDE9FF] p-3">

                                <div className="flex items-start justify-between gap-3">

                                    <div className="min-w-0">

                                        <p className="text-xs font-black uppercase tracking-wider">
                                            Project Knowledge
                                        </p>

                                        <p className="mt-1 text-[11px] font-medium text-black/60">
                                            Upload a PDF and @AI can answer questions using it.
                                        </p>

                                    </div>

                                    <span className="shrink-0 rounded-lg border-2 border-black bg-white px-2 py-1 text-[9px] font-black">
                                        RAG
                                    </span>

                                </div>

                            </div>


                            <input
                                ref={
                                    pdfInputRef
                                }
                                type="file"
                                accept="application/pdf,.pdf"
                                onChange={
                                    handlePdfChange
                                }
                                className="sr-only"
                            />


                            <button
                                type="button"
                                onClick={() =>
                                    pdfInputRef.current?.click()
                                }
                                disabled={
                                    uploadingPdf
                                }
                                className="w-full rounded-2xl border-[3px] border-dashed border-black bg-white p-3 text-left transition hover:bg-[#EDE9FF] disabled:cursor-not-allowed disabled:opacity-50"
                            >

                                <div className="flex items-center gap-3">

                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border-2 border-black bg-[#FFC928] text-sm font-black">
                                        PDF
                                    </div>

                                    <div className="min-w-0 flex-1">

                                        <p className="truncate text-xs font-black">

                                            {pdfInput
                                                ? pdfInput.name
                                                : 'Choose a PDF'}

                                        </p>

                                        <p className="mt-1 text-[10px] font-bold text-black/50">

                                            {pdfInput
                                                ? `${(
                                                    pdfInput.size /
                                                    (1024 * 1024)
                                                ).toFixed(2)} MB · Ready to index`
                                                : 'PDF only · Maximum 10 MB'}

                                        </p>

                                    </div>

                                    <span className="shrink-0 text-lg font-black">
                                        +
                                    </span>

                                </div>

                            </button>


                            {pdfInput && (

                                <button
                                    type="button"
                                    onClick={
                                        clearPdfSelection
                                    }
                                    disabled={
                                        uploadingPdf
                                    }
                                    className="mt-2 w-full rounded-xl border-2 border-black bg-white px-3 py-2 text-[10px] font-black hover:bg-[#FFC928] disabled:opacity-50"
                                >
                                    Remove selected PDF
                                </button>

                            )}


                            <button
                                type="button"
                                onClick={
                                    uploadPdf
                                }
                                disabled={
                                    !pdfInput ||
                                    uploadingPdf
                                }
                                className="mt-2 w-full rounded-xl border-2 border-black bg-[#FFC928] px-3 py-2 text-xs font-black shadow-[2px_2px_0px_#17151d] transition hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none disabled:cursor-not-allowed disabled:opacity-50"
                            >

                                {uploadingPdf
                                    ? 'Indexing PDF...'
                                    : 'Add PDF to RAG'}

                            </button>


                            {uploadingPdf && (

                                <div className="mt-2 rounded-xl border-2 border-black bg-white px-3 py-2">

                                    <div className="flex items-center gap-2">

                                        <span className="h-2.5 w-2.5 animate-pulse rounded-full border-2 border-black bg-[#FFC928]" />

                                        <p className="text-[10px] font-black">
                                            Reading PDF and creating searchable vectors...
                                        </p>

                                    </div>

                                </div>

                            )}


                            {pdfStatus && !uploadingPdf && (

                                <div className="mt-2 rounded-xl border-2 border-black bg-[#B9A9F5] px-3 py-2">

                                    <p className="text-[10px] font-black">
                                        ✓ {pdfStatus}
                                    </p>

                                </div>

                            )}


                            {pdfError && !uploadingPdf && (

                                <div className="mt-2 rounded-xl border-2 border-black bg-white px-3 py-2">

                                    <p className="text-[10px] font-black">
                                        {pdfError}
                                    </p>

                                </div>

                            )}

                        </div>

                    </div>


                    <div className="shrink-0 border-t-[3px] border-black p-4">

                        <button
                            onClick={
                                openCollaboratorModal
                            }
                            className="w-full rounded-2xl border-[3px] border-black bg-[#FFC928] px-4 py-3 font-black shadow-[3px_3px_0px_#17151d]"
                        >
                            + Add collaborator
                        </button>

                    </div>

                </aside>


                </div>


            {/* =========================================================
                ADD COLLABORATOR MODAL
            ========================================================= */}

            {isModalOpen && (

                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-5">

                    <div className="w-full max-w-md overflow-hidden rounded-[28px] border-[3px] border-black bg-[#F8F6FF] shadow-[8px_8px_0px_#17151d]">


                        <header className="flex items-center justify-between border-b-[3px] border-black bg-[#B9A9F5] px-5 py-4">

                            <div>

                                <p className="text-xs font-black uppercase tracking-wider">
                                    Project
                                </p>


                                <h2 className="text-xl font-black">
                                    Add collaborator
                                </h2>

                            </div>


                            <button
                                onClick={() =>
                                    setIsModalOpen(
                                        false
                                    )
                                }

                                className="flex h-9 w-9 items-center justify-center rounded-xl border-2 border-black bg-white font-black hover:bg-[#FFC928]"
                            >
                                ×
                            </button>

                        </header>


                        <div className="max-h-[400px] overflow-y-auto p-4">

                            <p className="mb-4 text-sm font-medium text-black/60">
                                Select people you want to invite.
                            </p>


                            {collaboratorError && (

                                <div className="mb-3 rounded-xl border-2 border-black bg-white px-3 py-2 text-xs font-bold">
                                    {collaboratorError}
                                </div>

                            )}


                            <div className="space-y-2">

                                {allUsers
                                    .filter(
                                        user => {

                                            const id =
                                                user?._id ||
                                                user?.id


                                            const alreadyMember =
                                                (
                                                    project.users ||
                                                    []
                                                ).some(
                                                    member =>
                                                        String(
                                                            member?._id ||
                                                            member?.id
                                                        ) ===
                                                        String(
                                                            id
                                                        )
                                                )


                                            return (
                                                id &&
                                                !alreadyMember
                                            )
                                        }
                                    )
                                    .map(
                                        user => {

                                            const userId =
                                                user._id ||
                                                user.id


                                            const isSelected =
                                                selectedUserId.has(
                                                    userId
                                                )


                                            return (

                                                <button
                                                    key={
                                                        userId
                                                    }

                                                    onClick={() =>
                                                        handleUserClick(
                                                            userId
                                                        )
                                                    }

                                                    className={`flex w-full items-center gap-3 rounded-2xl border-[2px] border-black p-3 text-left transition ${
                                                        isSelected
                                                            ? 'bg-[#FFC928] shadow-[3px_3px_0px_#17151d]'
                                                            : 'bg-white hover:bg-[#EDE9FF]'
                                                    }`}
                                                >

                                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-black bg-[#B9A9F5] font-black">

                                                        {user.email
                                                            ?.charAt(
                                                                0
                                                            )
                                                            .toUpperCase()}

                                                    </div>


                                                    <div className="min-w-0 flex-1">

                                                        <p className="truncate text-sm font-black">
                                                            {
                                                                user.email
                                                            }
                                                        </p>


                                                        <p className="text-[10px] font-bold text-black/50">
                                                            Available to collaborate
                                                        </p>

                                                    </div>


                                                    <div
                                                        className={`flex h-6 w-6 items-center justify-center rounded-full border-2 border-black ${
                                                            isSelected
                                                                ? 'bg-black text-white'
                                                                : 'bg-white'
                                                        }`}
                                                    >

                                                        {isSelected &&
                                                            '✓'}

                                                    </div>

                                                </button>
                                            )
                                        }
                                    )}

                            </div>

                        </div>


                        <footer className="border-t-[3px] border-black p-4">

                            <button
                                onClick={
                                    addCollaborators
                                }

                                disabled={
                                    addingUsers
                                }

                                className="w-full rounded-2xl border-[3px] border-black bg-[#FFC928] px-4 py-3 font-black shadow-[3px_3px_0px_#17151d] transition hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none disabled:opacity-50"
                            >

                                {addingUsers
                                    ? 'Adding...'
                                    : 'Add Collaborators →'}

                            </button>

                        </footer>

                    </div>

                </div>

            )}

        </main>
    )
}


export default Project




