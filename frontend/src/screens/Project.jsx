
// import React,{useContext,useEffect,useRef,useState} from 'react'
// import {useNavigate,useParams} from 'react-router-dom'
// import {io} from 'socket.io-client'
// import axios from '../config/axios'
// import {UserContext} from '../context/user.context'

// const API_URL=import.meta.env.VITE_API_URL||'http://localhost:3000'
// const MAX_PDF_SIZE=10*1024*1024

// const Project=()=>{
//     const {projectId}=useParams()
//     const navigate=useNavigate()
//     const {user:currentUser}=useContext(UserContext)

//     const getToken=()=>localStorage.getItem('token')

//     const [project,setProject]=useState(null)
//     const [projectLoading,setProjectLoading]=useState(true)
//     const [projectError,setProjectError]=useState('')
//     const [messages,setMessages]=useState([])
//     const [message,setMessage]=useState('')
//     const [aiThinking,setAiThinking]=useState(false)
//     const [chatError,setChatError]=useState('')
//     const messagesEndRef=useRef(null)
//     const socketRef=useRef(null)

//     const [isModalOpen,setIsModalOpen]=useState(false)
//     const [selectedUserId,setSelectedUserId]=useState(new Set())
//     const [allUsers,setAllUsers]=useState([])
//     const [addingUsers,setAddingUsers]=useState(false)
//     const [collaboratorError,setCollaboratorError]=useState('')
//     const [onlineUsers,setOnlineUsers]=useState([])

//     const [pdfInput,setPdfInput]=useState(null)
//     const [activeDocument,setActiveDocument]=useState(null)
//     const [uploadingPdf,setUploadingPdf]=useState(false)
//     const [removingPdf,setRemovingPdf]=useState(false)
//     const [pdfStatus,setPdfStatus]=useState('')
//     const [pdfError,setPdfError]=useState('')
//     const [showRemovePdfConfirm,setShowRemovePdfConfirm]=useState(false)
//     const pdfInputRef=useRef(null)

//     useEffect(()=>{
//         let cancelled=false

//         const loadProject=async()=>{
//             if(!projectId){
//                 setProjectError('Project ID is missing.')
//                 setProjectLoading(false)
//                 return
//             }

//             try{
//                 setProjectLoading(true)
//                 setProjectError('')

//                 const response=await axios.get(`/projects/get-project/${projectId}`)

//                 if(cancelled)return

//                 const loadedProject=response.data?.project

//                 if(!loadedProject){
//                     throw new Error('Project was not returned by backend.')
//                 }

//                 setProject(loadedProject)

//                 if(loadedProject.ragDocument){
//                     setActiveDocument(loadedProject.ragDocument)
//                 }
//             }catch(error){
//                 console.error('Loading project failed:',error.response?.data||error)

//                 if(cancelled)return

//                 if(error.response?.status===401){
//                     localStorage.removeItem('token')
//                     navigate('/login',{replace:true})
//                     return
//                 }

//                 setProjectError(
//                     error.response?.data?.error||
//                     error.response?.data?.message||
//                     error.message||
//                     'Unable to load project.'
//                 )
//             }finally{
//                 if(!cancelled)setProjectLoading(false)
//             }
//         }

//         loadProject()

//         return()=>{cancelled=true}
//     },[projectId,navigate])

//     useEffect(()=>{
//         if(!projectId)return

//         let cancelled=false

//         const loadMessages=async()=>{
//             try{
//                 const response=await axios.get(`/messages/${projectId}`)

//                 if(cancelled)return

//                 setMessages(
//                     (response.data?.messages||[]).map(normalizeMessage)
//                 )
//             }catch(error){
//                 console.error('Failed to load messages:',error.response?.data||error)
//             }
//         }

//         loadMessages()

//         return()=>{cancelled=true}
//     },[projectId])

//     useEffect(()=>{
//         if(!projectId||!getToken())return

//         const socket=io(API_URL,{
//             auth:{token:getToken()},
//             withCredentials:true,
//             transports:['websocket','polling'],
//             reconnection:true,
//             reconnectionAttempts:Infinity,
//             reconnectionDelay:1000,
//             reconnectionDelayMax:5000,
//             timeout:20000
//         })

//         socketRef.current=socket

//         socket.on('connect',()=>{
//             console.log('Socket connected:',socket.id)
//             setChatError('')
//             socket.emit('join-project',projectId)
//         })

//         const heartbeat=window.setInterval(()=>{
//             if(socket.connected){
//                 socket.emit('presence-heartbeat',projectId)
//             }
//         },15000)

//         socket.on('project-message',incomingMessage=>{
//             const normalized=normalizeMessage(incomingMessage)

//             setMessages(previous=>{
//                 const exists=previous.some(
//                     item=>item._id===normalized._id
//                 )

//                 if(exists)return previous

//                 return [...previous,normalized]
//             })
//         })

//         socket.on('ai-status',data=>{
//             setAiThinking(data?.status==='thinking')
//         })

//         socket.on('online-users',users=>{
//             setOnlineUsers(Array.isArray(users)?users:[])
//         })

//         socket.on('project-error',data=>{
//             const errorMessage=
//                 data?.message||
//                 data?.error||
//                 'Failed to process message.'

//             console.error('Project socket error:',errorMessage)
//             setChatError(errorMessage)
//             setAiThinking(false)
//         })

//         socket.on('connect_error',error=>{
//             console.error('Socket connect error:',error.message)
//             setChatError('Unable to connect to project chat.')
//         })

//         socket.on('disconnect',reason=>{
//             console.warn('Socket disconnected:',reason)
//         })

//         return()=>{
//             window.clearInterval(heartbeat)
//             socket.disconnect()
//             socketRef.current=null
//         }
//     },[projectId])

//     function normalizeMessage(msg={}){
//         const rawSender=msg.sender
//         const isAI=msg.role==='assistant'||msg.role==='ai'

//         const sender=
//             rawSender&&typeof rawSender==='object'
//                 ? {
//                     ...rawSender,
//                     _id:rawSender._id||rawSender.id||rawSender.userId,
//                     email:rawSender.email||msg.senderEmail||''
//                 }
//                 : {
//                     _id:isAI?'ai':rawSender||msg.senderId||'',
//                     email:isAI?'AI Assistant':msg.senderEmail||''
//                 }

//         return {
//             ...msg,
//             _id:String(
//                 msg._id||
//                 msg.id||
//                 `${Date.now()}-${Math.random()}`
//             ),
//             sender,
//             role:msg.role||'user',
//             message:msg.message||msg.content||''
//         }
//     }

//     const getUserId=user=>{
//         if(user){
//             const id=user._id||user.id||user.userId
//             if(id)return String(id)
//         }

//         try{
//             const token=getToken()
//             if(!token)return ''

//             const payload=JSON.parse(
//                 atob(token.split('.')[1])
//             )

//             return String(
//                 payload._id||
//                 payload.id||
//                 payload.userId||
//                 ''
//             )
//         }catch{
//             return ''
//         }
//     }

//     const getSenderId=sender=>{
//         if(!sender)return ''

//         if(typeof sender==='string'){
//             return String(sender)
//         }

//         return String(
//             sender._id||
//             sender.id||
//             sender.userId||
//             ''
//         )
//     }

//     const isAiMessage=msg=>{
//         return (
//             msg?.role==='assistant'||
//             msg?.role==='ai'||
//             getSenderId(msg?.sender)==='ai'
//         )
//     }

//     useEffect(()=>{
//         messagesEndRef.current?.scrollIntoView({
//             behavior:'smooth',
//             block:'end'
//         })
//     },[messages,aiThinking])

//     const send=()=>{
//         const cleanMessage=message.trim()

//         if(!cleanMessage||!projectId)return

//         const socket=socketRef.current

//         if(!socket||!socket.connected){
//             setChatError('Chat connection is not ready.')
//             return
//         }

//         setChatError('')

//         socket.emit('project-message',{
//             projectId,
//             message:cleanMessage
//         })

//         setMessage('')
//     }

//     const handleMessageKeyDown=event=>{
//         if(event.key==='Enter'&&!event.shiftKey){
//             event.preventDefault()
//             send()
//         }
//     }

//     const openCollaboratorModal=async()=>{
//         setSelectedUserId(new Set())
//         setCollaboratorError('')
//         setIsModalOpen(true)

//         try{
//             const response=await axios.get('/users/all')

//             const users=
//                 response.data?.users||
//                 response.data?.data||
//                 []

//             setAllUsers(Array.isArray(users)?users:[])
//         }catch(error){
//             console.error(
//                 'Failed to load users:',
//                 error.response?.data||error
//             )

//             setAllUsers([])

//             setCollaboratorError(
//                 error.response?.data?.error||
//                 error.response?.data?.message||
//                 'Unable to load users.'
//             )
//         }
//     }

//     const handleUserClick=id=>{
//         setSelectedUserId(previous=>{
//             const next=new Set(previous)

//             if(next.has(id)){
//                 next.delete(id)
//             }else{
//                 next.add(id)
//             }

//             return next
//         })
//     }

//     const addCollaborators=async()=>{
//         const users=Array.from(selectedUserId)

//         if(!users.length||!projectId){
//             setIsModalOpen(false)
//             return
//         }

//         try{
//             setAddingUsers(true)
//             setCollaboratorError('')

//             const response=await axios.put(
//                 '/projects/add-user',
//                 {projectId,users}
//             )

//             const updatedProject=
//                 response.data?.project||
//                 response.data

//             if(updatedProject?.users){
//                 setProject(previous=>({
//                     ...previous,
//                     ...updatedProject
//                 }))
//             }else{
//                 const refreshed=await axios.get(
//                     `/projects/get-project/${projectId}`
//                 )

//                 setProject(
//                     refreshed.data?.project||project
//                 )
//             }

//             setSelectedUserId(new Set())
//             setIsModalOpen(false)
//         }catch(error){
//             console.error(
//                 'Add collaborators failed:',
//                 error.response?.data||error
//             )

//             setCollaboratorError(
//                 error.response?.data?.error||
//                 error.response?.data?.message||
//                 'Unable to add collaborators.'
//             )
//         }finally{
//             setAddingUsers(false)
//         }
//     }

//     const isUserOnline=id=>{
//         return onlineUsers.some(user=>{
//             if(typeof user==='string'){
//                 return user===String(id)
//             }

//             return String(
//                 user?._id||
//                 user?.id||
//                 user?.userId
//             )===String(id)
//         })
//     }

//     const handlePdfChange=event=>{
//         const file=event.target.files?.[0]||null

//         setPdfError('')
//         setPdfStatus('')

//         if(!file){
//             setPdfInput(null)
//             return
//         }

//         const isPdf=
//             file.type==='application/pdf'||
//             file.name.toLowerCase().endsWith('.pdf')

//         if(!isPdf){
//             setPdfInput(null)
//             setPdfError('Please select a PDF file.')

//             if(pdfInputRef.current){
//                 pdfInputRef.current.value=''
//             }

//             return
//         }

//         if(file.size>MAX_PDF_SIZE){
//             setPdfInput(null)
//             setPdfError('PDF must be smaller than 10 MB.')

//             if(pdfInputRef.current){
//                 pdfInputRef.current.value=''
//             }

//             return
//         }

//         setPdfInput(file)
//     }

//     const clearPdfSelection=()=>{
//         if(uploadingPdf)return

//         setPdfInput(null)
//         setPdfError('')
//         setPdfStatus('')

//         if(pdfInputRef.current){
//             pdfInputRef.current.value=''
//         }
//     }

//     const uploadPdf=async()=>{
//         if(!projectId){
//             setPdfError('Project ID is missing.')
//             return
//         }

//         if(!pdfInput){
//             setPdfError('Please select a PDF first.')
//             return
//         }

//         if(uploadingPdf)return

//         setUploadingPdf(true)
//         setPdfError('')
//         setPdfStatus('')

//         try{
//             const formData=new FormData()
//             formData.append('file',pdfInput)

//             const response=await axios.post(
//                 `/ai/projects/${projectId}/documents`,
//                 formData
//             )

//             const result=
//                 response.data?.data||
//                 response.data?.result||
//                 response.data||
//                 {}

//             const documentInfo={
//                 docId:result.docId||null,
//                 fileName:result.fileName||pdfInput.name
//             }

//             setActiveDocument(documentInfo)
//             setPdfStatus(
//                 `${documentInfo.fileName} indexed successfully`
//             )

//             setPdfInput(null)

//             if(pdfInputRef.current){
//                 pdfInputRef.current.value=''
//             }
//         }catch(error){
//             console.error(
//                 'PDF upload failed:',
//                 error.response?.data||error
//             )

//             const status=error.response?.status

//             const backendMessage=
//                 error.response?.data?.message||
//                 error.response?.data?.error||
//                 error.response?.data?.errors?.[0]?.msg

//             setPdfError(
//                 backendMessage||
//                 (
//                     status===413
//                         ? 'PDF is too large.'
//                         : status===401
//                             ? 'Your session expired. Please log in again.'
//                             : status===422
//                                 ? 'The PDF could not be processed.'
//                                 : 'Failed to upload and index the PDF.'
//                 )
//             )
//         }finally{
//             setUploadingPdf(false)
//         }
//     }

//     const removePdf=async()=>{
//         if(!projectId||removingPdf)return

//         setRemovingPdf(true)
//         setPdfError('')
//         setPdfStatus('')

//         try{
//             await axios.delete(
//                 `/ai/projects/${projectId}/documents`
//             )

//             setActiveDocument(null)
//             setPdfInput(null)

//             if(pdfInputRef.current){
//                 pdfInputRef.current.value=''
//             }

//             setPdfStatus(
//                 'PDF removed from project knowledge.'
//             )
//         }catch(error){
//             console.error(
//                 'PDF removal failed:',
//                 error.response?.data||error
//             )

//             setPdfError(
//                 error.response?.data?.message||
//                 error.response?.data?.error||
//                 'Failed to remove the PDF.'
//             )
//         }finally{
//             setRemovingPdf(false)
//             setShowRemovePdfConfirm(false)
//         }
//     }

//     const handleLogout=()=>{
//         const socket=socketRef.current

//         if(socket){
//             socket.disconnect()
//         }

//         socketRef.current=null
//         localStorage.removeItem('token')

//         navigate('/login',{replace:true})
//     }

//     const WriteAiMessage=content=>(
//         <div className="w-full rounded-2xl border-2 border-black bg-[#B9A9F5] p-4">
//             <div className="mb-2 flex items-center gap-2">
//                 <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-black bg-[#FFC928] text-xs font-black">
//                     AI
//                 </div>
//                 <span className="text-xs font-black">
//                     AI Assistant
//                 </span>
//             </div>

//             <p className="whitespace-pre-wrap break-words text-sm font-medium leading-relaxed">
//                 {content}
//             </p>
//         </div>
//     )

//     if(!projectId){
//         return(
//             <main className="flex h-screen w-screen items-center justify-center bg-[#C9BDF8]">
//                 <div className="rounded-2xl border-[3px] border-black bg-white px-6 py-5 font-black shadow-[5px_5px_0px_#17151d]">
//                     Project ID is missing.
//                 </div>
//             </main>
//         )
//     }

//     if(projectLoading){
//         return(
//             <main className="flex h-screen w-screen items-center justify-center bg-[#C9BDF8]">
//                 <div className="rounded-2xl border-[3px] border-black bg-white px-6 py-5 font-black shadow-[5px_5px_0px_#17151d]">
//                     Loading project...
//                 </div>
//             </main>
//         )
//     }

//     if(projectError||!project){
//         return(
//             <main className="flex h-screen w-screen items-center justify-center bg-[#C9BDF8]">
//                 <div className="max-w-md rounded-2xl border-[3px] border-black bg-white px-6 py-5 shadow-[5px_5px_0px_#17151d]">
//                     <p className="text-lg font-black">
//                         Unable to open project
//                     </p>
//                     <p className="mt-2 text-sm font-medium text-black/60">
//                         {projectError||'Project not found.'}
//                     </p>
//                 </div>
//             </main>
//         )
//     }

//     const currentId=getUserId(currentUser)

//     return(
//         <main className="h-screen w-screen overflow-hidden bg-[#C9BDF8] p-3 md:p-4">
//             <div className="flex h-full min-w-0 overflow-hidden rounded-[28px] border-[3px] border-black bg-[#F8F6FF] shadow-[8px_8px_0px_#17151d]">
                
//                 {/* CHAT */}
//                 <section className="flex min-w-0 flex-1 flex-col bg-[#F8F6FF]">
//                     <header className="flex shrink-0 items-center justify-between border-b-[3px] border-black bg-[#D5CCFF] px-4 py-3">
//                         <div className="min-w-0">
//                             <p className="text-xs font-black uppercase tracking-wider">
//                                 Project
//                             </p>
//                             <h1 className="truncate text-xl font-black">
//                                 {project.name||'Untitled Project'}
//                             </h1>
//                         </div>

//                         <div className="flex items-center gap-2">
//                             <div className={`h-3 w-3 rounded-full border-2 border-black ${
//                                 socketRef.current?.connected
//                                     ? 'bg-green-500'
//                                     : 'bg-gray-300'
//                             }`}/>
//                             <span className="text-[10px] font-black uppercase">
//                                 {aiThinking?'AI thinking':'AI ready'}
//                             </span>
//                         </div>
//                     </header>

//                     {/* MESSAGES */}
//                     <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden p-4">
//                         <div className="flex w-full flex-col gap-3">
//                             {messages.length===0&&(
//                                 <div className="w-full rounded-2xl border-[3px] border-dashed border-black bg-white p-6 text-center">
//                                     <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-black bg-[#B9A9F5] text-xl font-black">
//                                         AI
//                                     </div>
//                                     <p className="mt-3 text-lg font-black">
//                                         Start the conversation
//                                     </p>
//                                     <p className="mt-1 text-sm font-medium text-black/50">
//                                         Ask @AI anything about your project.
//                                     </p>
//                                 </div>
//                             )}

//                             {messages.map(msg=>{
//                                 const isAI=isAiMessage(msg)
//                                 const senderId=getSenderId(msg.sender)
//                                 const isOwn=
//                                     !isAI&&
//                                     Boolean(currentId)&&
//                                     Boolean(senderId)&&
//                                     senderId===currentId

//                                 return(
//                                     <div
//                                         key={msg._id}
//                                         className={`flex w-full ${
//                                             isOwn?'justify-end':'justify-start'
//                                         }`}
//                                     >
//                                         <div className={`flex w-full max-w-full flex-col ${
//                                             isOwn?'items-end':'items-start'
//                                         }`}>
//                                             {!isOwn&&!isAI&&(
//                                                 <small className="mb-1 ml-2 max-w-[90%] truncate text-[10px] font-black text-black/50">
//                                                     {msg.sender?.email||'Project member'}
//                                                 </small>
//                                             )}

//                                             {isAI
//                                                 ? WriteAiMessage(msg.message)
//                                                 :(
//                                                     <div className={`max-w-[90%] rounded-2xl border-[3px] border-black px-4 py-3 ${
//                                                         isOwn
//                                                             ? 'rounded-br-md bg-[#FFC928]'
//                                                             : 'rounded-bl-md bg-white'
//                                                     }`}>
//                                                         <p className="whitespace-pre-wrap break-words text-sm font-medium leading-relaxed">
//                                                             {msg.message}
//                                                         </p>
//                                                     </div>
//                                                 )
//                                             }
//                                         </div>
//                                     </div>
//                                 )
//                             })}

//                             {aiThinking&&(
//                                 <div className="flex w-full justify-start">
//                                     <div className="rounded-2xl border-2 border-black bg-[#B9A9F5] px-4 py-3 text-sm font-black">
//                                         AI is thinking...
//                                     </div>
//                                 </div>
//                             )}

//                             {chatError&&(
//                                 <div className="rounded-xl border-2 border-black bg-[#FFD6D6] px-3 py-2 text-xs font-black">
//                                     {chatError}
//                                 </div>
//                             )}

//                             <div ref={messagesEndRef}/>
//                         </div>
//                     </div>

//                     {/* INPUT */}
//                     <footer className="shrink-0 border-t-[3px] border-black bg-[#F8F6FF] p-3">
//                         <div className="flex items-end gap-2">
//                             <textarea
//                                 value={message}
//                                 onChange={e=>setMessage(e.target.value)}
//                                 onKeyDown={handleMessageKeyDown}
//                                 rows={2}
//                                 placeholder="Ask @AI about your project..."
//                                 className="min-h-[64px] flex-1 resize-none rounded-2xl border-[3px] border-black bg-white px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-black/20"
//                             />

//                             <button
//                                 type="button"
//                                 onClick={send}
//                                 disabled={!message.trim()}
//                                 className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border-[3px] border-black bg-[#FFC928] text-lg font-black shadow-[3px_3px_0px_#17151d] disabled:cursor-not-allowed disabled:opacity-50"
//                             >
//                                 →
//                             </button>
//                         </div>

//                         <p className="mt-1 text-center text-[9px] font-medium text-black/40">
//                             Enter to send · Shift+Enter for new line · @AI for project assistant
//                         </p>
//                     </footer>
//                 </section>

//                 {/* RIGHT PANEL */}
//                 <aside className="flex h-full w-[360px] shrink-0 flex-col border-l-[3px] border-black bg-[#F8F6FF] max-md:w-[300px]">
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
//                             type="button"
//                             onClick={openCollaboratorModal}
//                             className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border-2 border-black bg-[#FFC928] text-lg font-black"
//                         >
//                             +
//                         </button>
//                     </header>

//                     <div className="min-h-0 flex-1 overflow-y-auto">
//                         <div className="p-4">
//                             <div className="mb-3 rounded-2xl border-2 border-black bg-[#B9A9F5] p-3">
//                                 <p className="text-sm font-black">
//                                     Team members
//                                 </p>
//                                 <p className="mt-1 text-[10px] font-medium">
//                                     People currently working on this project.
//                                 </p>
//                             </div>

//                             <div className="space-y-2">
//                                 {(project.users||[]).map(member=>{
//                                     const memberId=member?._id||member?.id
//                                     const online=isUserOnline(memberId)

//                                     return(
//                                         <div
//                                             key={String(memberId)}
//                                             className="flex items-center gap-3 rounded-2xl border-2 border-black bg-white p-3"
//                                         >
//                                             <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-black bg-[#B9A9F5] font-black">
//                                                 {member?.email?.charAt(0).toUpperCase()||'?'}
//                                                 <span className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-black ${
//                                                     online?'bg-green-500':'bg-gray-300'
//                                                 }`}/>
//                                             </div>

//                                             <div className="min-w-0">
//                                                 <p className="truncate text-xs font-black">
//                                                     {member?.email||'Unknown user'}
//                                                 </p>
//                                                 <span className="text-[9px] font-bold text-black/50">
//                                                     {online?'Online':'Offline'}
//                                                 </span>
//                                             </div>
//                                         </div>
//                                     )
//                                 })}
//                             </div>
//                         </div>
//                     </div>

//                     {/* PROJECT KNOWLEDGE */}
//                     <div className="shrink-0 border-t-[3px] border-black p-3">
//                         <div className="rounded-2xl border-2 border-black bg-[#EDE9FF] p-3">
//                             <div className="flex items-center justify-between">
//                                 <div>
//                                     <p className="text-xs font-black uppercase tracking-wider">
//                                         Project Knowledge
//                                     </p>
//                                     <p className="mt-1 text-[10px] font-medium text-black/60">
//                                         One active PDF for project AI.
//                                     </p>
//                                 </div>

//                                 <span className="rounded-lg border-2 border-black bg-white px-2 py-1 text-[8px] font-black">
//                                     RAG
//                                 </span>
//                             </div>

//                             <input
//                                 ref={pdfInputRef}
//                                 type="file"
//                                 accept="application/pdf,.pdf"
//                                 onChange={handlePdfChange}
//                                 className="sr-only"
//                             />

//                             {activeDocument&&(
//                                 <div className="mt-3 rounded-2xl border-2 border-black bg-white p-3">
//                                     <div className="flex items-center gap-3">
//                                         <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border-2 border-black bg-[#FFC928] text-[9px] font-black">
//                                             PDF
//                                         </div>

//                                         <div className="min-w-0 flex-1">
//                                             <p className="truncate text-xs font-black">
//                                                 {activeDocument.fileName}
//                                             </p>
//                                             <p className="mt-1 text-[9px] font-bold text-black/50">
//                                                 Active document
//                                             </p>
//                                         </div>

//                                         <span className="rounded-lg border-2 border-black bg-[#C8F7C5] px-2 py-1 text-[8px] font-black">
//                                             INDEXED
//                                         </span>
//                                     </div>

//                                     <div className="mt-3 flex gap-2">
//                                         <button
//                                             type="button"
//                                             onClick={()=>pdfInputRef.current?.click()}
//                                             disabled={uploadingPdf||removingPdf}
//                                             className="flex-1 rounded-xl border-2 border-black bg-[#FFC928] px-3 py-2 text-[10px] font-black"
//                                         >
//                                             Replace PDF
//                                         </button>

//                                         <button
//                                             type="button"
//                                             onClick={()=>setShowRemovePdfConfirm(true)}
//                                             disabled={uploadingPdf||removingPdf}
//                                             className="rounded-xl border-2 border-black bg-white px-3 py-2 text-[10px] font-black"
//                                         >
//                                             Remove
//                                         </button>
//                                     </div>
//                                 </div>
//                             )}

//                             {!activeDocument&&(
//                                 <div className="mt-3 rounded-2xl border-2 border-dashed border-black bg-white p-3 text-center">
//                                     <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl border-2 border-black bg-[#FFC928] text-[9px] font-black">
//                                         PDF
//                                     </div>

//                                     <p className="mt-2 text-xs font-black">
//                                         No PDF uploaded
//                                     </p>

//                                     <button
//                                         type="button"
//                                         onClick={()=>pdfInputRef.current?.click()}
//                                         disabled={uploadingPdf}
//                                         className="mt-2 w-full rounded-xl border-2 border-black bg-[#B9A9F5] px-3 py-2 text-[10px] font-black"
//                                     >
//                                         Select PDF
//                                     </button>
//                                 </div>
//                             )}

//                             {pdfInput&&(
//                                 <div className="mt-2 rounded-xl border-2 border-black bg-white p-2">
//                                     <div className="flex items-center gap-2">
//                                         <p className="min-w-0 flex-1 truncate text-[10px] font-black">
//                                             {pdfInput.name}
//                                         </p>

//                                         <button
//                                             type="button"
//                                             onClick={clearPdfSelection}
//                                             disabled={uploadingPdf}
//                                             className="text-[9px] font-black underline"
//                                         >
//                                             Clear
//                                         </button>
//                                     </div>

//                                     <button
//                                         type="button"
//                                         onClick={uploadPdf}
//                                         disabled={uploadingPdf}
//                                         className="mt-2 w-full rounded-xl border-2 border-black bg-[#B9A9F5] px-3 py-2 text-[10px] font-black"
//                                     >
//                                         {uploadingPdf
//                                             ? 'Processing PDF...'
//                                             : activeDocument
//                                                 ? 'Replace & Index PDF'
//                                                 : 'Upload & Index PDF'}
//                                     </button>
//                                 </div>
//                             )}

//                             {pdfStatus&&(
//                                 <div className="mt-2 rounded-xl border-2 border-black bg-[#C8F7C5] px-3 py-2 text-[9px] font-black">
//                                     ✓ {pdfStatus}
//                                 </div>
//                             )}

//                             {pdfError&&(
//                                 <div className="mt-2 rounded-xl border-2 border-black bg-[#FFD6D6] px-3 py-2 text-[9px] font-black">
//                                     {pdfError}
//                                 </div>
//                             )}
//                         </div>
//                     </div>

//                     <div className="shrink-0 border-t-[3px] border-black p-3">
//                         <button
//                             type="button"
//                             onClick={openCollaboratorModal}
//                             className="w-full rounded-2xl border-[3px] border-black bg-[#FFC928] px-4 py-3 text-sm font-black shadow-[3px_3px_0px_#17151d]"
//                         >
//                             + Add collaborator
//                         </button>

//                         <button
//                             type="button"
//                             onClick={handleLogout}
//                             className="mt-2 w-full rounded-2xl border-2 border-black bg-white px-4 py-2 text-xs font-black"
//                         >
//                             Logout
//                         </button>
//                     </div>
//                 </aside>
//             </div>

//             {/* REMOVE PDF MODAL */}
//             {showRemovePdfConfirm&&(
//                 <div
//                     className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
//                     onMouseDown={event=>{
//                         if(event.target===event.currentTarget){
//                             setShowRemovePdfConfirm(false)
//                         }
//                     }}
//                 >
//                     <div className="w-full max-w-sm rounded-[28px] border-[3px] border-black bg-[#F8F6FF] p-5 shadow-[8px_8px_0px_#17151d]">
//                         <p className="text-lg font-black">
//                             Remove PDF?
//                         </p>

//                         <p className="mt-2 text-sm font-medium text-black/60">
//                             This removes the current PDF from project knowledge. Your conversation will remain unchanged.
//                         </p>

//                         <div className="mt-5 flex gap-2">
//                             <button
//                                 type="button"
//                                 onClick={()=>setShowRemovePdfConfirm(false)}
//                                 disabled={removingPdf}
//                                 className="flex-1 rounded-xl border-2 border-black bg-white px-4 py-3 text-sm font-black"
//                             >
//                                 Cancel
//                             </button>

//                             <button
//                                 type="button"
//                                 onClick={removePdf}
//                                 disabled={removingPdf}
//                                 className="flex-1 rounded-xl border-2 border-black bg-[#FF8E8E] px-4 py-3 text-sm font-black"
//                             >
//                                 {removingPdf?'Removing...':'Remove PDF'}
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             )}

//             {/* ADD COLLABORATOR MODAL */}
//             {isModalOpen&&(
//                 <div
//                     className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
//                     onMouseDown={event=>{
//                         if(
//                             event.target===event.currentTarget&&
//                             !addingUsers
//                         ){
//                             setIsModalOpen(false)
//                         }
//                     }}
//                 >
//                     <div className="flex max-h-[85vh] w-full max-w-md flex-col overflow-hidden rounded-[28px] border-[3px] border-black bg-[#F8F6FF] shadow-[8px_8px_0px_#17151d]">
//                         <header className="flex shrink-0 items-center justify-between border-b-[3px] border-black bg-[#B9A9F5] px-5 py-4">
//                             <div>
//                                 <p className="text-xs font-black uppercase tracking-wider">
//                                     Project
//                                 </p>
//                                 <h2 className="text-xl font-black">
//                                     Add Collaborators
//                                 </h2>
//                             </div>

//                             <button
//                                 type="button"
//                                 onClick={()=>setIsModalOpen(false)}
//                                 disabled={addingUsers}
//                                 className="flex h-9 w-9 items-center justify-center rounded-xl border-2 border-black bg-white font-black"
//                             >
//                                 ×
//                             </button>
//                         </header>

//                         <div className="min-h-0 flex-1 overflow-y-auto p-4">
//                             {collaboratorError&&(
//                                 <div className="mb-3 rounded-xl border-2 border-black bg-[#FFD6D6] p-3 text-xs font-black">
//                                     {collaboratorError}
//                                 </div>
//                             )}

//                             {!allUsers.length&&(
//                                 <div className="rounded-2xl border-2 border-dashed border-black bg-white p-5 text-center">
//                                     <p className="text-sm font-black">
//                                         No users available
//                                     </p>
//                                 </div>
//                             )}

//                             <div className="space-y-2">
//                                 {allUsers.map(user=>{
//                                     const userId=String(
//                                         user?._id||
//                                         user?.id||
//                                         user?.userId||
//                                         ''
//                                     )

//                                     if(!userId)return null

//                                     const isSelected=
//                                         selectedUserId.has(userId)

//                                     return(
//                                         <button
//                                             type="button"
//                                             key={userId}
//                                             onClick={()=>handleUserClick(userId)}
//                                             disabled={addingUsers}
//                                             className={`flex w-full items-center gap-3 rounded-2xl border-2 border-black p-3 text-left ${
//                                                 isSelected
//                                                     ? 'bg-[#FFC928] shadow-[3px_3px_0px_#17151d]'
//                                                     : 'bg-white'
//                                             }`}
//                                         >
//                                             <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-black bg-[#B9A9F5] font-black">
//                                                 {user.email?.charAt(0).toUpperCase()||'?'}
//                                             </div>

//                                             <div className="min-w-0 flex-1">
//                                                 <p className="truncate text-sm font-black">
//                                                     {user.email||'Unknown user'}
//                                                 </p>
//                                                 <p className="text-[10px] font-bold text-black/50">
//                                                     Available to collaborate
//                                                 </p>
//                                             </div>

//                                             <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-black ${
//                                                 isSelected
//                                                     ? 'bg-black text-white'
//                                                     : 'bg-white'
//                                             }`}>
//                                                 {isSelected?'✓':''}
//                                             </div>
//                                         </button>
//                                     )
//                                 })}
//                             </div>
//                         </div>

//                         <footer className="shrink-0 border-t-[3px] border-black p-4">
//                             <button
//                                 type="button"
//                                 onClick={addCollaborators}
//                                 disabled={
//                                     addingUsers||
//                                     selectedUserId.size===0
//                                 }
//                                 className="w-full rounded-2xl border-[3px] border-black bg-[#FFC928] px-4 py-3 font-black shadow-[3px_3px_0px_#17151d] disabled:opacity-50"
//                             >
//                                 {addingUsers
//                                     ? 'Adding...'
//                                     : `Add ${selectedUserId.size||''} Collaborator${selectedUserId.size===1?'':'s'} →`}
//                             </button>
//                         </footer>
//                     </div>
//                 </div>
//             )}
//         </main>
//     )
// }

// export default Project
import React,{useContext,useEffect,useRef,useState} from 'react'
import {useNavigate,useParams} from 'react-router-dom'
import {io} from 'socket.io-client'
import axios from '../config/axios'
import {UserContext} from '../context/user.context'

const API_URL=import.meta.env.VITE_API_URL||'http://localhost:3000'
const MAX_PDF_SIZE=10*1024*1024

const Project=()=>{
    const {projectId}=useParams()
    const navigate=useNavigate()
    const {user:currentUser}=useContext(UserContext)

    const getToken=()=>localStorage.getItem('token')

    const [project,setProject]=useState(null)
    const [projectLoading,setProjectLoading]=useState(true)
    const [projectError,setProjectError]=useState('')
    const [messages,setMessages]=useState([])
    const [message,setMessage]=useState('')
    const [aiThinking,setAiThinking]=useState(false)
    const [chatError,setChatError]=useState('')
    const messagesEndRef=useRef(null)
    const socketRef=useRef(null)

    const [isModalOpen,setIsModalOpen]=useState(false)
    const [selectedUserId,setSelectedUserId]=useState(new Set())
    const [allUsers,setAllUsers]=useState([])
    const [addingUsers,setAddingUsers]=useState(false)
    const [collaboratorError,setCollaboratorError]=useState('')
    const [onlineUsers,setOnlineUsers]=useState([])

    const [pdfInput,setPdfInput]=useState(null)
    const [activeDocument,setActiveDocument]=useState(null)
    const [pdfOperation,setPdfOperation]=useState({
        status:'idle',
        fileName:'',
        userId:''
    })
    const [uploadingPdf,setUploadingPdf]=useState(false)
    const [removingPdf,setRemovingPdf]=useState(false)
    const [pdfStatus,setPdfStatus]=useState('')
    const [pdfError,setPdfError]=useState('')
    const [showRemovePdfConfirm,setShowRemovePdfConfirm]=useState(false)
    const pdfInputRef=useRef(null)

    const normalizeDocument=document=>{
        if(!document)return null

        return {
            ...document,
            docId:
                document.docId||
                document._id||
                document.id||
                null,
            fileName:
                document.fileName||
                document.filename||
                document.name||
                'Project PDF'
        }
    }

    const setProjectDocument=document=>{
        const normalized=normalizeDocument(document)
        setActiveDocument(normalized)
        return normalized
    }

    useEffect(()=>{
        let cancelled=false

        const loadProject=async()=>{
            if(!projectId){
                setProjectError('Project ID is missing.')
                setProjectLoading(false)
                return
            }

            try{
                setProjectLoading(true)
                setProjectError('')

                const response=await axios.get(`/projects/get-project/${projectId}`)

                if(cancelled)return

                const loadedProject=response.data?.project

                if(!loadedProject){
                    throw new Error('Project was not returned by backend.')
                }

                setProject(loadedProject)
                setProjectDocument(loadedProject.ragDocument||null)

                if(!loadedProject.ragDocument){
                    setPdfOperation({
                        status:'idle',
                        fileName:'',
                        userId:''
                    })
                }
            }catch(error){
                console.error('Loading project failed:',error.response?.data||error)

                if(cancelled)return

                if(error.response?.status===401){
                    localStorage.removeItem('token')
                    navigate('/login',{replace:true})
                    return
                }

                setProjectError(
                    error.response?.data?.error||
                    error.response?.data?.message||
                    error.message||
                    'Unable to load project.'
                )
            }finally{
                if(!cancelled)setProjectLoading(false)
            }
        }

        loadProject()

        return()=>{cancelled=true}
    },[projectId,navigate])

    useEffect(()=>{
        if(!projectId)return

        let cancelled=false

        const loadMessages=async()=>{
            try{
                const response=await axios.get(`/messages/${projectId}`)

                if(cancelled)return

                setMessages(
                    (response.data?.messages||[]).map(normalizeMessage)
                )
            }catch(error){
                console.error('Failed to load messages:',error.response?.data||error)
            }
        }

        loadMessages()

        return()=>{cancelled=true}
    },[projectId])

    useEffect(()=>{
        if(!projectId||!getToken())return

        const socket=io(API_URL,{
            auth:{token:getToken()},
            withCredentials:true,
            transports:['websocket','polling'],
            reconnection:true,
            reconnectionAttempts:Infinity,
            reconnectionDelay:1000,
            reconnectionDelayMax:5000,
            timeout:20000
        })

        socketRef.current=socket

        socket.on('connect',()=>{
            console.log('Socket connected:',socket.id)
            setChatError('')
            socket.emit('join-project',projectId)
            socket.emit(
                'request-project-document',
                projectId
            )
        })

        const heartbeat=window.setInterval(()=>{
            if(socket.connected){
                socket.emit('presence-heartbeat',projectId)
            }
        },15000)

        socket.on('project-message',incomingMessage=>{
            const normalized=normalizeMessage(incomingMessage)

            setMessages(previous=>{
                const exists=previous.some(
                    item=>item._id===normalized._id
                )

                if(exists)return previous

                return [...previous,normalized]
            })
        })

        socket.on('project-members-updated',data=>{
    if(
        String(data?.projectId||'')!==
        String(projectId)
    ){
        return
    }

    const users=
        Array.isArray(data?.users)
            ?data.users
            :[]

    setProject(previous=>({
        ...previous,
        users
    }))

    const enrolledIds=new Set(
        users.map(user=>{
            if(typeof user==='string'){
                return String(user)
            }

            return String(
                user?._id||
                user?.id||
                user?.userId||
                ''
            )
        }).filter(Boolean)
    )

    setAllUsers(previous=>
        previous.filter(user=>{
            const id=String(
                user?._id||
                user?.id||
                user?.userId||
                ''
            )

            return !enrolledIds.has(id)
        })
    )
})

        socket.on('ai-status',data=>{
            setAiThinking(data?.status==='thinking')
        })

     socket.on('online-users',users=>{
    const normalized=Array.isArray(users)
        ?users.map(user=>{
            if(typeof user==='string'){
                return String(user)
            }

            return String(
                user?._id||
                user?.id||
                user?.userId||
                ''
            )
        }).filter(Boolean)
        :[]

    setOnlineUsers(normalized)
})

      socket.on('project-document-state',data=>{
    if(
        String(data?.projectId||projectId)!==
        String(projectId)
    ){
        return
    }

    const documentInfo=
        data?.document||
        data?.ragDocument||
        null

    setProjectDocument(
        documentInfo
    )

    const operation=
        data?.operation

    if(
        operation?.status&&
        operation.status!=='idle'
    ){
        setPdfOperation({
            status:
                operation.status,
            fileName:
                operation.fileName||
                documentInfo?.fileName||
                'Project PDF',
            userId:String(
                operation.userId||
                ''
            )
        })

        if(
            operation.status==='removing'
        ){
            setRemovingPdf(true)
        }

        if(
            operation.status==='uploading'||
            operation.status==='replacing'
        ){
            setUploadingPdf(true)
        }
    }else{
        setPdfOperation({
            status:'idle',
            fileName:'',
            userId:''
        })

        setRemovingPdf(false)
        setUploadingPdf(false)
    }
})

  socket.on(
    'project-document-upload-started',
    data=>{
        if(
            String(data?.projectId||projectId)!==
            String(projectId)
        ){
            return
        }

        setPdfOperation({
            status:
                data?.status||
                'uploading',

            fileName:
                data?.fileName||
                'Project PDF',

            userId:
                String(
                    data?.userId||
                    ''
                )
        })

        setUploadingPdf(true)

        setPdfError('')
        setPdfStatus('')

        /*
         * IMPORTANT:
         *
         * Do NOT create a fake activeDocument.
         *
         * During replacement the existing document
         * remains the real document until the new
         * document has been successfully indexed.
         *
         * The final project-document-state event
         * replaces it with the new persisted document.
         */

        setPdfInput(null)

        if(pdfInputRef.current){
            pdfInputRef.current.value=''
        }
    }
)

    socket.on(
    'project-document-updated',
    data=>{
        if(
            String(data?.projectId||projectId)!==
            String(projectId)
        ){
            return
        }

        const documentInfo=
            data?.document||
            data?.ragDocument||
            null

        /*
         * This is the FINAL shared document state.
         *
         * Every collaborator receives the same document
         * from Socket.IO and keeps it visible.
         */
        setProjectDocument(
            documentInfo
        )

        setPdfOperation({
            status:'idle',
            fileName:'',
            userId:''
        })

        setUploadingPdf(false)
        setRemovingPdf(false)

        setPdfError('')

        setPdfStatus(
            data?.message||
            (
                documentInfo
                    ? `${documentInfo.fileName||'Project PDF'} uploaded and indexed successfully.`
                    : ''
            )
        )

        setPdfInput(null)

        if(pdfInputRef.current){
            pdfInputRef.current.value=''
        }
    }
)

  socket.on(
    'project-document-removed',
    data=>{
        if(
            String(data?.projectId||projectId)!==
            String(projectId)
        ){
            return
        }

        /*
         * THIS IS THE IMPORTANT PART.
         *
         * Both A and B receive this event.
         */

        setProjectDocument(null)

        setPdfOperation({
            status:'idle',
            fileName:'',
            userId:''
        })

        setPdfInput(null)

        setUploadingPdf(false)
        setRemovingPdf(false)

        setPdfError('')

        setPdfStatus('')

        setShowRemovePdfConfirm(false)

        if(pdfInputRef.current){
            pdfInputRef.current.value=''
        }
    }
)

  socket.on(
    'project-document-operation-failed',
    data=>{
        if(
            String(data?.projectId||projectId)!==
            String(projectId)
        ){
            return
        }

        setPdfOperation({
            status:'idle',
            fileName:'',
            userId:''
        })

        setUploadingPdf(false)
        setRemovingPdf(false)

        setPdfError(
            data?.message||
            'PDF operation failed.'
        )
    }
)
        socket.on('project-error',data=>{
            const errorMessage=
                data?.message||
                data?.error||
                'Failed to process message.'

            console.error('Project socket error:',errorMessage)
            setChatError(errorMessage)
            setAiThinking(false)
        })

        socket.on('connect_error',error=>{
            console.error('Socket connect error:',error.message)
            setChatError('Unable to connect to project chat.')
        })

        socket.on('disconnect',reason=>{
            console.warn('Socket disconnected:',reason)
        })

        return()=>{
            window.clearInterval(heartbeat)
            socket.disconnect()
            socketRef.current=null
        }
    },[projectId])

    function normalizeMessage(msg={}){
        const rawSender=msg.sender
        const isAI=msg.role==='assistant'||msg.role==='ai'

        const sender=
            rawSender&&typeof rawSender==='object'
                ? {
                    ...rawSender,
                    _id:rawSender._id||rawSender.id||rawSender.userId,
                    email:rawSender.email||msg.senderEmail||''
                }
                : {
                    _id:isAI?'ai':rawSender||msg.senderId||'',
                    email:isAI?'AI Assistant':msg.senderEmail||''
                }

        return {
            ...msg,
            _id:String(
                msg._id||
                msg.id||
                `${Date.now()}-${Math.random()}`
            ),
            sender,
            role:msg.role||'user',
            message:msg.message||msg.content||''
        }
    }

    const getUserId=user=>{
        if(user){
            const id=user._id||user.id||user.userId
            if(id)return String(id)
        }

        try{
            const token=getToken()
            if(!token)return ''

            const payload=JSON.parse(
                atob(token.split('.')[1])
            )

            return String(
                payload._id||
                payload.id||
                payload.userId||
                ''
            )
        }catch{
            return ''
        }
    }

    const getSenderId=sender=>{
        if(!sender)return ''

        if(typeof sender==='string'){
            return String(sender)
        }

        return String(
            sender._id||
            sender.id||
            sender.userId||
            ''
        )
    }

    const isAiMessage=msg=>{
        return (
            msg?.role==='assistant'||
            msg?.role==='ai'||
            getSenderId(msg?.sender)==='ai'
        )
    }

    useEffect(()=>{
        messagesEndRef.current?.scrollIntoView({
            behavior:'smooth',
            block:'end'
        })
    },[messages,aiThinking])

    const send=()=>{
        const cleanMessage=message.trim()

        if(!cleanMessage||!projectId)return

        const socket=socketRef.current

        if(!socket||!socket.connected){
            setChatError('Chat connection is not ready.')
            return
        }

        setChatError('')

        socket.emit('project-message',{
            projectId,
            message:cleanMessage
        })

        setMessage('')
    }

    const handleMessageKeyDown=event=>{
        if(event.key==='Enter'&&!event.shiftKey){
            event.preventDefault()
            send()
        }
    }

   const openCollaboratorModal=async()=>{
    setSelectedUserId(new Set())
    setCollaboratorError('')
    setIsModalOpen(true)

    try{
        const response=await axios.get('/users/all')

        const users=
            response.data?.users||
            response.data?.data||
            []

        const enrolledIds=new Set(
            (project?.users||[]).map(user=>{
                if(typeof user==='string'){
                    return String(user)
                }

                return String(
                    user?._id||
                    user?.id||
                    user?.userId||
                    ''
                )
            }).filter(Boolean)
        )

        const availableUsers=users.filter(user=>{
            const id=String(
                user?._id||
                user?.id||
                user?.userId||
                ''
            )

            return id&&!enrolledIds.has(id)
        })

        setAllUsers(availableUsers)
    }catch(error){
        console.error(
            'Failed to load users:',
            error.response?.data||error
        )

        setAllUsers([])

        setCollaboratorError(
            error.response?.data?.error||
            error.response?.data?.message||
            'Unable to load users.'
        )
    }
}
    const handleUserClick=id=>{
        setSelectedUserId(previous=>{
            const next=new Set(previous)

            if(next.has(id)){
                next.delete(id)
            }else{
                next.add(id)
            }

            return next
        })
    }

    const addCollaborators=async()=>{
        const users=Array.from(selectedUserId)

        if(!users.length||!projectId){
            setIsModalOpen(false)
            return
        }

        try{
            setAddingUsers(true)
            setCollaboratorError('')

            const response=await axios.put(
                '/projects/add-user',
                {projectId,users}
            )

            const updatedProject=
                response.data?.project||
                response.data

            if(updatedProject?.users){
                setProject(previous=>({
                    ...previous,
                    ...updatedProject
                }))
            }else{
                const refreshed=await axios.get(
                    `/projects/get-project/${projectId}`
                )

                setProject(
                    refreshed.data?.project||project
                )
            }

            setSelectedUserId(new Set())
            setIsModalOpen(false)
        }catch(error){
            console.error(
                'Add collaborators failed:',
                error.response?.data||error
            )

            setCollaboratorError(
                error.response?.data?.error||
                error.response?.data?.message||
                'Unable to add collaborators.'
            )
        }finally{
            setAddingUsers(false)
        }
    }

    const isUserOnline=id=>{
        return onlineUsers.some(user=>{
            if(typeof user==='string'){
                return user===String(id)
            }

            return String(
                user?._id||
                user?.id||
                user?.userId
            )===String(id)
        })
    }

    // const handlePdfChange=event=>{
    //     const file=event.target.files?.[0]||null

    //     setPdfError('')
    //     setPdfStatus('')

    //     if(!file){
    //         setPdfInput(null)
    //         return
    //     }

    //     const isPdf=
    //         file.type==='application/pdf'||
    //         file.name.toLowerCase().endsWith('.pdf')

    //     if(!isPdf){
    //         setPdfInput(null)
    //         setPdfError('Please select a PDF file.')

    //         if(pdfInputRef.current){
    //             pdfInputRef.current.value=''
    //         }

    //         return
    //     }

    //     if(file.size>MAX_PDF_SIZE){
    //         setPdfInput(null)
    //         setPdfError('PDF must be smaller than 10 MB.')

    //         if(pdfInputRef.current){
    //             pdfInputRef.current.value=''
    //         }

    //         return
    //     }

    //     setPdfInput(file)
    // }
const handlePdfChange=event=>{
    const file=
        event.target.files?.[0]||null

    setPdfError('')
    setPdfStatus('')

    if(!file){
        setPdfInput(null)
        return
    }

    if(
        uploadingPdf||
        removingPdf||
        pdfOperation.status!=='idle'
    ){
        setPdfInput(null)

        setPdfError(
            'Another collaborator is currently processing the PDF.'
        )

        if(pdfInputRef.current){
            pdfInputRef.current.value=''
        }

        return
    }

    const isPdf=
        file.type==='application/pdf'||
        file.name.toLowerCase().endsWith('.pdf')

    if(!isPdf){
        setPdfInput(null)

        setPdfError(
            'Please select a PDF file.'
        )

        if(pdfInputRef.current){
            pdfInputRef.current.value=''
        }

        return
    }

    if(file.size>MAX_PDF_SIZE){
        setPdfInput(null)

        setPdfError(
            'PDF must be smaller than 10 MB.'
        )

        if(pdfInputRef.current){
            pdfInputRef.current.value=''
        }

        return
    }

    setPdfInput(file)
}

    const clearPdfSelection=()=>{
        if(uploadingPdf)return

        setPdfInput(null)
        setPdfError('')
        setPdfStatus('')

        if(pdfInputRef.current){
            pdfInputRef.current.value=''
        }
    }

//   const uploadPdf=async()=>{
//     if(!projectId){
//         setPdfError(
//             'Project ID is missing.'
//         )

//         return
//     }

//     if(!pdfInput){
//         setPdfError(
//             'Please select a PDF first.'
//         )

//         return
//     }

//     if(
//         uploadingPdf||
//         removingPdf||
//         pdfOperation.status!=='idle'
//     ){
//         return
//     }

//     const socket=
//         socketRef.current

//     if(
//         !socket||
//         !socket.connected
//     ){
//         setPdfError(
//             'Project connection is not ready. Please wait a moment.'
//         )

//         return
//     }

//     const operationStatus=
//         activeDocument
//             ? 'replacing'
//             : 'uploading'

//     setUploadingPdf(true)
//     setPdfError('')
//     setPdfStatus('')

//     setPdfOperation({
//         status:
//             operationStatus,
//         fileName:
//             pdfInput.name,
//         userId:
//             currentId
//     })

//     try{
//         const lockResult=
//             await new Promise(resolve=>{
//                 socket.emit(
//                     'project-document-upload-started',
//                     {
//                         projectId,
//                         fileName:
//                             pdfInput.name,
//                         status:
//                             operationStatus
//                     },
//                     resolve
//                 )
//             })

//         if(
//             lockResult?.ok!==true
//         ){
//             throw new Error(
//                 lockResult?.message||
//                 'Another collaborator is already processing the PDF.'
//             )
//         }

//         const formData=
//             new FormData()

//         formData.append(
//             'file',
//             pdfInput
//         )

//         const response=
//             await axios.post(
//                 `/ai/projects/${projectId}/documents`,
//                 formData
//             )

//         const result=
//             response.data?.data||
//             response.data?.result||
//             response.data||
//             {}

//         const documentInfo={
//             docId:
//                 result.docId||
//                 null,
//             fileName:
//                 result.fileName||
//                 pdfInput.name,
//             pages:
//                 Number(
//                     result.pages
//                 )||0,
//             chunks:
//                 Number(
//                     result.chunks
//                 )||0,
//             vectors:
//                 Number(
//                     result.vectors
//                 )||0,
//             visualPages:
//                 Number(
//                     result.visualPages
//                 )||0
//         }

//         setProjectDocument(
//             documentInfo
//         )

//         setPdfOperation({
//             status:'idle',
//             fileName:'',
//             userId:''
//         })

//         setUploadingPdf(false)

//         setPdfStatus(
//             documentInfo.pages>0
//                 ?`${documentInfo.fileName} indexed successfully · ${documentInfo.pages} pages · ${documentInfo.chunks} chunks`
//                 :`${documentInfo.fileName} indexed successfully`
//         )

//         setPdfInput(null)

//         if(pdfInputRef.current){
//             pdfInputRef.current.value=''
//         }

//         socket.emit(
//             'project-document-updated',
//             {
//                 projectId,
//                 document:
//                     documentInfo,
//                 message:
//                     `${documentInfo.fileName} indexed successfully`
//             }
//         )
//     }catch(error){
//         console.error(
//             'PDF upload failed:',
//             error.response?.data||
//             error
//         )

//         const backendMessage=
//             error.response?.data?.message||
//             error.response?.data?.error||
//             error.response?.data?.errors?.[0]?.msg

//         const finalError=
//             backendMessage||
//             (
//                 error.response?.status===413
//                     ?'PDF is too large.'
//                     :error.response?.status===401
//                         ?'Your session expired. Please log in again.'
//                         :'Failed to upload and index the PDF.'
//             )

//         setPdfOperation({
//             status:'idle',
//             fileName:'',
//             userId:''
//         })

//         setUploadingPdf(false)

//         socket.emit(
//             'project-document-operation-failed',
//             {
//                 projectId,
//                 message:
//                     finalError
//             }
//         )

//         setPdfError(
//             finalError
//         )
//     }
// }


// const uploadPdf=async()=>{
//     if(!projectId){
//         setPdfError(
//             'Project ID is missing.'
//         )

//         return
//     }

//     if(!pdfInput){
//         setPdfError(
//             'Please select a PDF first.'
//         )

//         return
//     }

//     /*
//      * ONLY ONE ACTIVE PDF PER PROJECT.
//      *
//      * Once a PDF exists, another PDF cannot be uploaded.
//      * The current PDF must first be removed.
//      */
//     if(activeDocument){
//         setPdfError(
//             `A PDF is already active in this project: ${activeDocument.fileName||'Project PDF'}. Remove it before uploading another PDF.`
//         )

//         return
//     }

//     if(
//         uploadingPdf||
//         removingPdf||
//         pdfOperation.status!=='idle'
//     ){
//         return
//     }

//     const socket=
//         socketRef.current

//     if(
//         !socket||
//         !socket.connected
//     ){
//         setPdfError(
//             'Project connection is not ready. Please wait a moment.'
//         )

//         return
//     }

//     setUploadingPdf(true)
//     setPdfError('')
//     setPdfStatus('')

//     const currentUserId=
//         getUserId(currentUser)

//     setPdfOperation({
//         status:'uploading',
//         fileName:pdfInput.name,
//         userId:currentUserId
//     })

//     try{
//         /*
//          * Ask backend to acquire the project-level PDF lock.
//          *
//          * This event is broadcast to every collaborator,
//          * so everyone immediately sees that a PDF is being
//          * uploaded.
//          */
//         const lockResult=
//             await new Promise(resolve=>{
//                 socket.emit(
//                     'project-document-upload-started',
//                     {
//                         projectId,
//                         fileName:pdfInput.name,
//                         status:'uploading'
//                     },
//                     resolve
//                 )
//             })

//         if(lockResult?.ok!==true){
//             throw new Error(
//                 lockResult?.message||
//                 'Another collaborator is already processing the PDF.'
//             )
//         }

//         /*
//          * Double-check local state after receiving the lock.
//          */
//         if(activeDocument){
//             throw new Error(
//                 'A PDF has already been uploaded to this project.'
//             )
//         }

//         const formData=
//             new FormData()

//         formData.append(
//             'file',
//             pdfInput
//         )

//         const response=
//             await axios.post(
//                 `/ai/projects/${projectId}/documents`,
//                 formData
//             )

//         const result=
//             response.data?.data||
//             response.data?.result||
//             response.data||
//             {}

//         const documentInfo={
//             docId:
//                 result.docId||
//                 null,

//             fileName:
//                 result.fileName||
//                 pdfInput.name,

//             pages:
//                 Number(
//                     result.pages
//                 )||0,

//             chunks:
//                 Number(
//                     result.chunks
//                 )||0,

//             vectors:
//                 Number(
//                     result.vectors
//                 )||0,

//             visualPages:
//                 Number(
//                     result.visualPages
//                 )||0
//         }

//         /*
//          * DO NOT directly set activeDocument here.
//          *
//          * The backend must persist project.ragDocument first.
//          * Then project-document-updated is broadcast and BOTH
//          * User A and User B receive the same persisted document.
//          */

//         setPdfOperation({
//             status:'idle',
//             fileName:'',
//             userId:''
//         })

//         setUploadingPdf(false)

//         setPdfStatus(
//             documentInfo.pages>0
//                 ?`${documentInfo.fileName} indexed successfully · ${documentInfo.pages} pages · ${documentInfo.chunks} chunks`
//                 :`${documentInfo.fileName} indexed successfully`
//         )

//         setPdfInput(null)

//         if(pdfInputRef.current){
//             pdfInputRef.current.value=''
//         }

//         /*
//          * Tell the backend that indexing completed.
//          *
//          * The server should read the persisted project.ragDocument
//          * and broadcast the final document state to ALL
//          * collaborators.
//          */
//         socket.emit(
//             'project-document-updated',
//             {
//                 projectId,
//                 document:documentInfo,
//                 message:
//                     `${documentInfo.fileName} indexed successfully`
//             }
//         )

//     }catch(error){
//         console.error(
//             'PDF upload failed:',
//             error.response?.data||
//             error
//         )

//         const backendMessage=
//             error.response?.data?.message||
//             error.response?.data?.error||
//             error.response?.data?.errors?.[0]?.msg

//         const finalError=
//             backendMessage||
//             (
//                 error.response?.status===413
//                     ?'PDF is too large.'
//                     :error.response?.status===401
//                         ?'Your session expired. Please log in again.'
//                         :error.message||
//                         'Failed to upload and index the PDF.'
//             )

//         setPdfOperation({
//             status:'idle',
//             fileName:'',
//             userId:''
//         })

//         setUploadingPdf(false)

//         socket.emit(
//             'project-document-operation-failed',
//             {
//                 projectId,
//                 message:finalError
//             }
//         )

//         setPdfError(
//             finalError
//         )
//     }
// }
const uploadPdf=async()=>{
    if(!projectId){
        setPdfError(
            'Project ID is missing.'
        )

        return
    }

    if(!pdfInput){
        setPdfError(
            'Please select a PDF first.'
        )

        return
    }

    if(
        uploadingPdf||
        removingPdf||
        pdfOperation.status!=='idle'
    ){
        return
    }

    const socket=
        socketRef.current

    if(
        !socket||
        !socket.connected
    ){
        setPdfError(
            'Project connection is not ready. Please wait a moment.'
        )

        return
    }

    const replacing=
        Boolean(activeDocument)

    const operationStatus=
        replacing
            ? 'replacing'
            : 'uploading'

    setUploadingPdf(true)

    setPdfError('')
    setPdfStatus('')

    const currentUserId=
        getUserId(currentUser)

    setPdfOperation({
        status:
            operationStatus,
        fileName:
            pdfInput.name,
        userId:
            currentUserId
    })

    try{

        const lockResult=
            await new Promise(resolve=>{

                socket.emit(
                    'project-document-upload-started',
                    {
                        projectId,

                        fileName:
                            pdfInput.name,

                        status:
                            operationStatus
                    },
                    resolve
                )
            })

        if(lockResult?.ok!==true){
            throw new Error(
                lockResult?.message||
                'Another collaborator is already processing the PDF.'
            )
        }

        const formData=
            new FormData()

        formData.append(
            'file',
            pdfInput
        )

        const response=
            await axios.post(
                `/ai/projects/${projectId}/documents`,
                formData
            )

        const result=
            response.data?.data||
            response.data?.result||
            response.data||
            {}

        const documentInfo={
            docId:
                result.docId||
                null,

            fileName:
                result.fileName||
                pdfInput.name,

            pages:
                Number(
                    result.pages
                )||0,

            chunks:
                Number(
                    result.chunks
                )||0,

            vectors:
                Number(
                    result.vectors
                )||0,

            visualPages:
                Number(
                    result.visualPages
                )||0
        }

        /*
         * Do not directly set activeDocument here.
         *
         * Backend first saves the new document
         * into MongoDB and then broadcasts the
         * final shared state to every collaborator.
         */

        setPdfInput(null)

        if(pdfInputRef.current){
            pdfInputRef.current.value=''
        }

        setPdfStatus(
            documentInfo.pages>0
                ?`${documentInfo.fileName} indexed successfully · ${documentInfo.pages} pages · ${documentInfo.chunks} chunks`
                :`${documentInfo.fileName} indexed successfully`
        )

        socket.emit(
            'project-document-updated',
            {
                projectId,

                document:
                    documentInfo,

                message:
                    replacing
                        ?`${documentInfo.fileName} replaced and indexed successfully`
                        :`${documentInfo.fileName} indexed successfully`
            }
        )

    }catch(error){

        console.error(
            'PDF upload failed:',
            error.response?.data||
            error
        )

        const backendMessage=
            error.response?.data?.message||
            error.response?.data?.error||
            error.response?.data?.errors?.[0]?.msg

        const finalError=
            backendMessage||
            (
                error.response?.status===413
                    ?'PDF is too large.'
                    :error.response?.status===401
                        ?'Your session expired. Please log in again.'
                        :error.message||
                        'Failed to upload and index the PDF.'
            )

        setPdfOperation({
            status:'idle',
            fileName:'',
            userId:''
        })

        setUploadingPdf(false)

        socket.emit(
            'project-document-operation-failed',
            {
                projectId,
                message:
                    finalError
            }
        )

        setPdfError(
            finalError
        )
    }
}



  const removePdf=async()=>{
    if(
        !projectId||
        removingPdf
    ){
        return
    }

    const socket=
        socketRef.current

    if(
        !socket||
        !socket.connected
    ){
        setPdfError(
            'Project connection is not ready. Please wait a moment.'
        )

        return
    }

    setRemovingPdf(true)
    setPdfError('')
    setPdfStatus('')

    const result=
        await new Promise(resolve=>{
            socket.emit(
                'project-document-remove',
                {
                    projectId
                },
                resolve
            )
        })

    if(
        !result||
        result.ok!==true
    ){
        setRemovingPdf(false)

        setPdfError(
            result?.message||
            'Failed to remove the PDF.'
        )

        return
    }

    /*
     * Do not close the modal here.
     *
     * The socket event:
     *
     * project-document-remove-started
     *
     * changes both users to Removing...
     *
     * Then:
     *
     * project-document-removed
     *
     * closes the modal and resets both UIs.
     */
}

    const handleLogout=()=>{
        const socket=socketRef.current

        if(socket){
            socket.disconnect()
        }

        socketRef.current=null
        localStorage.removeItem('token')

        navigate('/login',{replace:true})
    }

    const WriteAiMessage=content=>(
        <div className="w-full rounded-2xl border-2 border-black bg-[#B9A9F5] p-4">
            <div className="mb-2 flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-black bg-[#FFC928] text-xs font-black">
                    AI
                </div>
                <span className="text-xs font-black">
                    AI Assistant
                </span>
            </div>

            <p className="whitespace-pre-wrap break-words text-sm font-medium leading-relaxed">
                {content}
            </p>
        </div>
    )

    if(!projectId){
        return(
            <main className="flex h-screen w-screen items-center justify-center bg-[#C9BDF8]">
                <div className="rounded-2xl border-[3px] border-black bg-white px-6 py-5 font-black shadow-[5px_5px_0px_#17151d]">
                    Project ID is missing.
                </div>
            </main>
        )
    }

    if(projectLoading){
        return(
            <main className="flex h-screen w-screen items-center justify-center bg-[#C9BDF8]">
                <div className="rounded-2xl border-[3px] border-black bg-white px-6 py-5 font-black shadow-[5px_5px_0px_#17151d]">
                    Loading project...
                </div>
            </main>
        )
    }

    if(projectError||!project){
        return(
            <main className="flex h-screen w-screen items-center justify-center bg-[#C9BDF8]">
                <div className="max-w-md rounded-2xl border-[3px] border-black bg-white px-6 py-5 shadow-[5px_5px_0px_#17151d]">
                    <p className="text-lg font-black">
                        Unable to open project
                    </p>
                    <p className="mt-2 text-sm font-medium text-black/60">
                        {projectError||'Project not found.'}
                    </p>
                </div>
            </main>
        )
    }

    const currentId=getUserId(currentUser)

    const pdfBusy=
        uploadingPdf||
        removingPdf||
        pdfOperation.status==='uploading'||
        pdfOperation.status==='replacing'||
        pdfOperation.status==='indexing'||
        pdfOperation.status==='removing'

    const pdfOperationLabel=
        pdfOperation.status==='replacing'
            ? 'REPLACING'
            : pdfOperation.status==='indexing'
                ? 'INDEXING'
                : pdfOperation.status==='removing'
                    ? 'REMOVING'
                    : 'UPLOADING'

    return(
        <main className="h-screen w-screen overflow-hidden bg-[#C9BDF8] p-3 md:p-4">
            <div className="flex h-full min-w-0 overflow-hidden rounded-[28px] border-[3px] border-black bg-[#F8F6FF] shadow-[8px_8px_0px_#17151d]">
                
                {/* CHAT */}
                <section className="flex min-w-0 flex-1 flex-col bg-[#F8F6FF]">
                    <header className="flex shrink-0 items-center justify-between border-b-[3px] border-black bg-[#D5CCFF] px-4 py-3">
                        <div className="min-w-0">
                            <p className="text-xs font-black uppercase tracking-wider">
                                Project
                            </p>
                            <h1 className="truncate text-xl font-black">
                                {project.name||'Untitled Project'}
                            </h1>
                        </div>

                        <div className="flex items-center gap-2">
                            <div className={`h-3 w-3 rounded-full border-2 border-black ${
                                socketRef.current?.connected
                                    ? 'bg-green-500'
                                    : 'bg-gray-300'
                            }`}/>
                            <span className="text-[10px] font-black uppercase">
                                {aiThinking?'AI thinking':'AI ready'}
                            </span>
                        </div>
                    </header>

                    {/* MESSAGES */}
                    <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden p-4">
                        <div className="flex w-full flex-col gap-3">
                            {messages.length===0&&(
                                <div className="w-full rounded-2xl border-[3px] border-dashed border-black bg-white p-6 text-center">
                                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-black bg-[#B9A9F5] text-xl font-black">
                                        AI
                                    </div>
                                    <p className="mt-3 text-lg font-black">
                                        Start the conversation
                                    </p>
                                    <p className="mt-1 text-sm font-medium text-black/50">
                                        Ask @AI anything about your project.
                                    </p>
                                </div>
                            )}

                            {messages.map(msg=>{
                                const isAI=isAiMessage(msg)
                                const senderId=getSenderId(msg.sender)
                                const isOwn=
                                    !isAI&&
                                    Boolean(currentId)&&
                                    Boolean(senderId)&&
                                    senderId===currentId

                                return(
                                    <div
                                        key={msg._id}
                                        className={`flex w-full ${
                                            isOwn?'justify-end':'justify-start'
                                        }`}
                                    >
                                        <div className={`flex w-full max-w-full flex-col ${
                                            isOwn?'items-end':'items-start'
                                        }`}>
                                            {!isOwn&&!isAI&&(
                                                <small className="mb-1 ml-2 max-w-[90%] truncate text-[10px] font-black text-black/50">
                                                    {msg.sender?.email||'Project member'}
                                                </small>
                                            )}

                                            {isAI
                                                ? WriteAiMessage(msg.message)
                                                :(
                                                    <div className={`max-w-[90%] rounded-2xl border-[3px] border-black px-4 py-3 ${
                                                        isOwn
                                                            ? 'rounded-br-md bg-[#FFC928]'
                                                            : 'rounded-bl-md bg-white'
                                                    }`}>
                                                        <p className="whitespace-pre-wrap break-words text-sm font-medium leading-relaxed">
                                                            {msg.message}
                                                        </p>
                                                    </div>
                                                )
                                            }
                                        </div>
                                    </div>
                                )
                            })}

                            {aiThinking&&(
                                <div className="flex w-full justify-start">
                                    <div className="rounded-2xl border-2 border-black bg-[#B9A9F5] px-4 py-3 text-sm font-black">
                                        AI is thinking...
                                    </div>
                                </div>
                            )}

                            {chatError&&(
                                <div className="rounded-xl border-2 border-black bg-[#FFD6D6] px-3 py-2 text-xs font-black">
                                    {chatError}
                                </div>
                            )}

                            <div ref={messagesEndRef}/>
                        </div>
                    </div>

                    {/* INPUT */}
                    <footer className="shrink-0 border-t-[3px] border-black bg-[#F8F6FF] p-3">
                        <div className="flex items-end gap-2">
                            <textarea
                                value={message}
                                onChange={e=>setMessage(e.target.value)}
                                onKeyDown={handleMessageKeyDown}
                                rows={2}
                                placeholder="Ask @AI about your project..."
                                className="min-h-[64px] flex-1 resize-none rounded-2xl border-[3px] border-black bg-white px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-black/20"
                            />

                            <button
                                type="button"
                                onClick={send}
                                disabled={!message.trim()}
                                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border-[3px] border-black bg-[#FFC928] text-lg font-black shadow-[3px_3px_0px_#17151d] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                →
                            </button>
                        </div>

                        <p className="mt-1 text-center text-[9px] font-medium text-black/40">
                            Enter to send · Shift+Enter for new line · @AI for project assistant
                        </p>
                    </footer>
                </section>

                {/* RIGHT PANEL */}
                <aside className="flex h-full w-[360px] shrink-0 flex-col border-l-[3px] border-black bg-[#F8F6FF] max-md:w-[300px]">
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
                            type="button"
                            onClick={openCollaboratorModal}
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border-2 border-black bg-[#FFC928] text-lg font-black"
                        >
                            +
                        </button>
                    </header>

                    <div className="min-h-0 flex-1 overflow-y-auto">
                        <div className="p-4">
                            <div className="mb-3 rounded-2xl border-2 border-black bg-[#B9A9F5] p-3">
                                <p className="text-sm font-black">
                                    Team members
                                </p>
                                <p className="mt-1 text-[10px] font-medium">
                                    People currently working on this project.
                                </p>
                            </div>

                            <div className="space-y-2">
                                {(project.users||[]).map(member=>{
                                    const memberId=member?._id||member?.id
                                    const online=isUserOnline(memberId)

                                    return(
                                        <div
                                            key={String(memberId)}
                                            className="flex items-center gap-3 rounded-2xl border-2 border-black bg-white p-3"
                                        >
                                            <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-black bg-[#B9A9F5] font-black">
                                                {member?.email?.charAt(0).toUpperCase()||'?'}
                                                <span className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-black ${
                                                    online?'bg-green-500':'bg-gray-300'
                                                }`}/>
                                            </div>

                                            <div className="min-w-0">
                                                <p className="truncate text-xs font-black">
                                                    {member?.email||'Unknown user'}
                                                </p>
                                                <span className="text-[9px] font-bold text-black/50">
                                                    {online?'Online':'Offline'}
                                                </span>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>

                    {/* PROJECT KNOWLEDGE */}
                    <div className="shrink-0 border-t-[3px] border-black p-3">
                        <div className="rounded-2xl border-2 border-black bg-[#EDE9FF] p-3">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-black uppercase tracking-wider">
                                        Project Knowledge
                                    </p>
                                    <p className="mt-1 text-[10px] font-medium text-black/60">
                                        One active PDF for project AI.
                                    </p>
                                </div>

                                <span className="rounded-lg border-2 border-black bg-white px-2 py-1 text-[8px] font-black">
                                    RAG
                                </span>
                            </div>

               <input
    ref={pdfInputRef}
    type="file"
    accept="application/pdf,.pdf"
    onChange={handlePdfChange}
    disabled={
        uploadingPdf||
        removingPdf||
        pdfOperation.status!=='idle'
    }
    className="sr-only"
/>

   {activeDocument&&(
    <div className="mt-3 rounded-2xl border-2 border-black bg-white p-3">
        <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border-2 border-black bg-[#FFC928] text-[9px] font-black">
                PDF
            </div>

            <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-black">
                    {activeDocument.fileName||'Project PDF'}
                </p>

                <p className="mt-1 text-[9px] font-bold text-black/50">
                    Available to all collaborators
                </p>
            </div>

            <span className="rounded-lg border-2 border-black bg-[#C8F7C5] px-2 py-1 text-[8px] font-black">
    {pdfOperation.status==='replacing'
        ?'REPLACING'
        :'INDEXED'
    }
</span>
        </div>

        <div className="mt-3 rounded-xl border-2 border-black bg-[#EDE9FF] p-3">
            <p className="text-[10px] font-black">
                PDF uploaded for this project
            </p>

            <p className="mt-1 text-[9px] font-medium text-black/60">
                This document is currently being used as project knowledge
                for AI/RAG and is visible to every collaborator.
            </p>
        </div>

       <div className="mt-3 flex gap-2">

    <button
        type="button"
        onClick={()=>{
            if(pdfBusy)return

            setPdfError('')
            setPdfStatus('')

            pdfInputRef.current?.click()
        }}
        disabled={pdfBusy}
        className="flex-1 rounded-xl border-2 border-black bg-[#B9A9F5] px-3 py-2 text-[10px] font-black disabled:cursor-not-allowed disabled:opacity-50"
    >
        {pdfOperation.status==='replacing'
            ?'Replacing...'
            :'Replace PDF'
        }
    </button>

    <button
        type="button"
        onClick={()=>
            setShowRemovePdfConfirm(true)
        }
        disabled={pdfBusy}
        className="flex-1 rounded-xl border-2 border-black bg-white px-3 py-2 text-[10px] font-black disabled:cursor-not-allowed disabled:opacity-50"
    >
        Remove PDF
    </button>

</div>
    </div>
)}

                            {!activeDocument&&(
                                <div className="mt-3 rounded-2xl border-2 border-dashed border-black bg-white p-3 text-center">
                                    <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl border-2 border-black bg-[#FFC928] text-[9px] font-black">
                                        PDF
                                    </div>

                                    {pdfOperation.status!=='idle'
                                        ? (
                                            <>
                                                <p className="mt-2 truncate text-xs font-black">
                                                    {pdfOperation.fileName||'Project PDF'}
                                                </p>
                                               <p className="mt-1 text-[9px] font-bold text-black/50">
    {pdfOperation.status==='replacing'
        ?'Replacing project knowledge...'
        :'Available to all collaborators'
    }
</p>
                                                <div className="mt-2 w-full rounded-xl border-2 border-black bg-[#FFC928] px-3 py-2 text-[10px] font-black">
                                                    {pdfOperationLabel}...
                                                </div>
                                            </>
                                        )
                                        : (
                                            <>
                                                <p className="mt-2 text-xs font-black">
                                                    No PDF uploaded
                                                </p>

                                                <button
                                                    type="button"
                                                    onClick={()=>pdfInputRef.current?.click()}
                                                    disabled={pdfBusy}
                                                    className="mt-2 w-full rounded-xl border-2 border-black bg-[#B9A9F5] px-3 py-2 text-[10px] font-black"
                                                >
                                                    Select PDF
                                                </button>
                                            </>
                                        )}
                                </div>
                            )}

                            {pdfInput&&(
                                <div className="mt-2 rounded-xl border-2 border-black bg-white p-2">
                                    <div className="flex items-center gap-2">
                                        <p className="min-w-0 flex-1 truncate text-[10px] font-black">
                                            {pdfInput.name}
                                        </p>

                                        <button
                                            type="button"
                                            onClick={clearPdfSelection}
                                 disabled={
    Boolean(activeDocument)||
    uploadingPdf||
    removingPdf||
    pdfOperation.status!=='idle'
}
                                            className="text-[9px] font-black underline"
                                        >
                                            Clear
                                        </button>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={uploadPdf}
                                        disabled={pdfBusy}
                                        className="mt-2 w-full rounded-xl border-2 border-black bg-[#B9A9F5] px-3 py-2 text-[10px] font-black"
                                    >
                                        {uploadingPdf
                                            ? 'Processing PDF...'
                                            : activeDocument
                                                ? 'Replace & Index PDF'
                                                : 'Upload & Index PDF'}
                                    </button>
                                </div>
                            )}

                            {pdfStatus&&(
                                <div className="mt-2 rounded-xl border-2 border-black bg-[#C8F7C5] px-3 py-2 text-[9px] font-black">
                                    ✓ {pdfStatus}
                                </div>
                            )}

                            {pdfError&&(
                                <div className="mt-2 rounded-xl border-2 border-black bg-[#FFD6D6] px-3 py-2 text-[9px] font-black">
                                    {pdfError}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="shrink-0 border-t-[3px] border-black p-3">
                        <button
                            type="button"
                            onClick={openCollaboratorModal}
                            className="w-full rounded-2xl border-[3px] border-black bg-[#FFC928] px-4 py-3 text-sm font-black shadow-[3px_3px_0px_#17151d]"
                        >
                            + Add collaborator
                        </button>

                        <button
                            type="button"
                            onClick={handleLogout}
                            className="mt-2 w-full rounded-2xl border-2 border-black bg-white px-4 py-2 text-xs font-black"
                        >
                            Logout
                        </button>
                    </div>
                </aside>
            </div>

            {/* REMOVE PDF MODAL */}
            {showRemovePdfConfirm&&(
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
                    onMouseDown={event=>{
                        if(event.target===event.currentTarget){
                            setShowRemovePdfConfirm(false)
                        }
                    }}
                >
                    <div className="w-full max-w-sm rounded-[28px] border-[3px] border-black bg-[#F8F6FF] p-5 shadow-[8px_8px_0px_#17151d]">
                        <p className="text-lg font-black">
                            Remove PDF?
                        </p>

                        <p className="mt-2 text-sm font-medium text-black/60">
                            This removes the current PDF from project knowledge. Your conversation will remain unchanged.
                        </p>

                        <div className="mt-5 flex gap-2">
                            <button
                                type="button"
                                onClick={()=>setShowRemovePdfConfirm(false)}
                                disabled={removingPdf}
                                className="flex-1 rounded-xl border-2 border-black bg-white px-4 py-3 text-sm font-black"
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                onClick={removePdf}
                                disabled={removingPdf}
                                className="flex-1 rounded-xl border-2 border-black bg-[#FF8E8E] px-4 py-3 text-sm font-black"
                            >
                                {removingPdf?'Removing...':'Remove PDF'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ADD COLLABORATOR MODAL */}
            {isModalOpen&&(
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
                    onMouseDown={event=>{
                        if(
                            event.target===event.currentTarget&&
                            !addingUsers
                        ){
                            setIsModalOpen(false)
                        }
                    }}
                >
                    <div className="flex max-h-[85vh] w-full max-w-md flex-col overflow-hidden rounded-[28px] border-[3px] border-black bg-[#F8F6FF] shadow-[8px_8px_0px_#17151d]">
                        <header className="flex shrink-0 items-center justify-between border-b-[3px] border-black bg-[#B9A9F5] px-5 py-4">
                            <div>
                                <p className="text-xs font-black uppercase tracking-wider">
                                    Project
                                </p>
                                <h2 className="text-xl font-black">
                                    Add Collaborators
                                </h2>
                            </div>

                            <button
                                type="button"
                                onClick={()=>setIsModalOpen(false)}
                                disabled={addingUsers}
                                className="flex h-9 w-9 items-center justify-center rounded-xl border-2 border-black bg-white font-black"
                            >
                                ×
                            </button>
                        </header>

                        <div className="min-h-0 flex-1 overflow-y-auto p-4">
                            {collaboratorError&&(
                                <div className="mb-3 rounded-xl border-2 border-black bg-[#FFD6D6] p-3 text-xs font-black">
                                    {collaboratorError}
                                </div>
                            )}

                            {!allUsers.length&&(
                                <div className="rounded-2xl border-2 border-dashed border-black bg-white p-5 text-center">
                                    <p className="text-sm font-black">
                                        No users available
                                    </p>
                                </div>
                            )}

                            <div className="space-y-2">
                                {allUsers.map(user=>{
                                    const userId=String(
                                        user?._id||
                                        user?.id||
                                        user?.userId||
                                        ''
                                    )

                                    if(!userId)return null

                                    const isSelected=
                                        selectedUserId.has(userId)

                                    return(
                                        <button
                                            type="button"
                                            key={userId}
                                            onClick={()=>handleUserClick(userId)}
                                            disabled={addingUsers}
                                            className={`flex w-full items-center gap-3 rounded-2xl border-2 border-black p-3 text-left ${
                                                isSelected
                                                    ? 'bg-[#FFC928] shadow-[3px_3px_0px_#17151d]'
                                                    : 'bg-white'
                                            }`}
                                        >
                                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-black bg-[#B9A9F5] font-black">
                                                {user.email?.charAt(0).toUpperCase()||'?'}
                                            </div>

                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-black">
                                                    {user.email||'Unknown user'}
                                                </p>
                                                <p className="text-[10px] font-bold text-black/50">
                                                    Available to collaborate
                                                </p>
                                            </div>

                                            <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-black ${
                                                isSelected
                                                    ? 'bg-black text-white'
                                                    : 'bg-white'
                                            }`}>
                                                {isSelected?'✓':''}
                                            </div>
                                        </button>
                                    )
                                })}
                            </div>
                        </div>

                        <footer className="shrink-0 border-t-[3px] border-black p-4">
                            <button
                                type="button"
                                onClick={addCollaborators}
                                disabled={
                                    addingUsers||
                                    selectedUserId.size===0
                                }
                                className="w-full rounded-2xl border-[3px] border-black bg-[#FFC928] px-4 py-3 font-black shadow-[3px_3px_0px_#17151d] disabled:opacity-50"
                            >
                                {addingUsers
                                    ? 'Adding...'
                                    : `Add ${selectedUserId.size||''} Collaborator${selectedUserId.size===1?'':'s'} →`}
                            </button>
                        </footer>
                    </div>
                </div>
            )}
        </main>
    )
}

export default Project