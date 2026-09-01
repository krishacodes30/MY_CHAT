import React, {
    useContext,
    useEffect,
    useState
} from 'react'

import {
    useNavigate
} from 'react-router-dom'

import axios from '../config/axios'

import {
    UserContext
} from '../context/user.context'


const Home = () => {

    const navigate = useNavigate()

    const {
        user,
        setUser
    } = useContext(UserContext)


    const [projects, setProjects] =
        useState([])


    const [loading, setLoading] =
        useState(true)


    const [creating, setCreating] =
        useState(false)


    const [projectName, setProjectName] =
        useState('')


    const [error, setError] =
        useState('')


    // ============================================================
    // LOAD ALL PROJECTS
    // ============================================================

    const loadProjects = async () => {

        try {

            setLoading(true)
            setError('')


            const response =
                await axios.get(
                    '/projects/all'
                )


            console.log(
                'ALL PROJECTS:',
                response.data
            )


            const projectsData =
                response.data.projects ||
                []


            setProjects(
                projectsData
            )

        } catch (error) {

            console.error(
                'GET PROJECTS ERROR:',
                error.response?.data ||
                error
            )


            setError(
                error.response?.data?.message ||
                'Failed to load projects'
            )

        } finally {

            setLoading(false)
        }
    }


    // ============================================================
    // LOAD PROJECTS ON PAGE LOAD
    // ============================================================

    useEffect(() => {

        loadProjects()

    }, [])


    // ============================================================
    // OPEN PROJECT
    // ============================================================

    const openProject = project => {

        /*
         * MongoDB normally gives us _id.
         */

        const projectId =
            project?._id


        console.log(
            'Opening project:',
            project
        )


        console.log(
            'Project ID:',
            projectId
        )


        if (!projectId) {

            console.error(
                'PROJECT ID IS MISSING',
                project
            )


            setError(
                'This project does not have a valid ID.'
            )


            return
        }


        /*
         * IMPORTANT
         *
         * Project.jsx uses:
         *
         * const { projectId } = useParams()
         *
         * Therefore we must navigate to:
         *
         * /project/<actual MongoDB _id>
         */

        navigate(
            `/project/${projectId}`
        )
    }


    // ============================================================
    // CREATE PROJECT
    // ============================================================

    const createProject =
        async event => {

            event.preventDefault()


            const cleanName =
                projectName.trim()


            if (!cleanName) {
                return
            }


            try {

                setCreating(true)
                setError('')


                const response =
                    await axios.post(
                        '/projects/create',
                        {
                            name: cleanName
                        }
                    )


                console.log(
                    'CREATE PROJECT:',
                    response.data
                )

const newProject =
    response.data


                if (!newProject?._id) {

                    console.error(
                        'Invalid project response:',
                        response.data
                    )


                    throw new Error(
                        'Project ID was not returned by backend'
                    )
                }


                /*
                 * Add project to UI.
                 */

                setProjects(
                    previous => [
                        newProject,
                        ...previous
                    ]
                )


                setProjectName('')


                /*
                 * Immediately open the new project.
                 */

                navigate(
                    `/project/${newProject._id}`
                )

            } catch (error) {

                console.error(
                    'CREATE PROJECT ERROR:',
                    error.response?.data ||
                    error
                )


                setError(
                    error.response?.data?.message ||
                    error.message ||
                    'Failed to create project'
                )

            } finally {

                setCreating(false)
            }
        }


    // ============================================================
    // LOGOUT
    // ============================================================

    const logout = async () => {

        try {

            await axios.get(
                '/users/logout'
            )

        } catch (error) {

            console.error(
                'Logout API error:',
                error.response?.data ||
                error
            )

        } finally {

            localStorage.removeItem(
                'token'
            )

            localStorage.removeItem(
                'user'
            )


            setUser(null)


            navigate(
                '/login',
                {
                    replace: true
                }
            )
        }
    }


    // ============================================================
    // PROJECT CARD
    // ============================================================

    const ProjectCard = ({
        project
    }) => {

        const users =
            project.users || []


        return (

            <button
                type="button"
                onClick={() =>
                    openProject(
                        project
                    )
                }
                className="group w-full rounded-[24px] border-[3px] border-black bg-white p-5 text-left shadow-[5px_5px_0px_#17151d] transition hover:-translate-y-1 hover:shadow-[7px_7px_0px_#17151d]"
            >

                <div className="flex items-start justify-between gap-4">

                    <div className="flex min-w-0 items-center gap-3">

                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border-[3px] border-black bg-[#B9A9F5] text-lg font-black">

                            {(
                                project.name ||
                                'P'
                            )
                                .charAt(0)
                                .toUpperCase()}

                        </div>


                        <div className="min-w-0">

                            <h3 className="truncate text-lg font-black">
                                {project.name ||
                                    'Untitled project'}
                            </h3>


                            <p className="mt-1 text-xs font-bold text-black/45">

                                {users.length}
                                {' '}
                                collaborator
                                {users.length === 1
                                    ? ''
                                    : 's'}

                            </p>

                        </div>

                    </div>


                    <span className="shrink-0 rounded-xl border-2 border-black bg-[#FFC928] px-3 py-2 text-xs font-black">

                        Open →

                    </span>

                </div>


                <div className="mt-5 flex items-center justify-between border-t-2 border-black/10 pt-4">

                    <div className="flex -space-x-2">

                        {users
                            .slice(0, 4)
                            .map(
                                member => {

                                    const id =
                                        member?._id


                                    return (

                                        <div
                                            key={
                                                id
                                            }
                                            className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-black bg-[#D5CCFF] text-[10px] font-black"
                                        >

                                            {(
                                                member?.email ||
                                                'U'
                                            )
                                                .charAt(0)
                                                .toUpperCase()}

                                        </div>

                                    )
                                }
                            )}

                    </div>


                    <span className="text-xs font-bold text-black/40">
                        Shared workspace
                    </span>

                </div>

            </button>
        )
    }


    // ============================================================
    // RENDER
    // ============================================================

    return (

        <main className="min-h-screen bg-[#C9BDF8] p-3 sm:p-5">

            <div className="mx-auto max-w-6xl">


                {/* ==================================================
                    HEADER
                ================================================== */}

                <header className="mb-6 flex flex-col gap-4 rounded-[28px] border-[3px] border-black bg-[#F8F6FF] p-5 shadow-[7px_7px_0px_#17151d] sm:flex-row sm:items-center sm:justify-between">

                    <div className="flex items-center gap-3">

                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-[3px] border-black bg-[#FFC928]">

                            <div className="flex gap-1">

                                <span className="h-2 w-2 rounded-full bg-black" />

                                <span className="h-2 w-2 rounded-full bg-black" />

                                <span className="h-2 w-2 rounded-full bg-black" />

                            </div>

                        </div>


                        <div>

                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-black/50">
                                TalkSpace
                            </p>


                            <h1 className="text-2xl font-black">
                                Your projects
                            </h1>

                        </div>

                    </div>


                    <div className="flex items-center gap-3">

                        <div className="max-w-[200px] truncate rounded-2xl border-2 border-black bg-white px-4 py-2 text-xs font-black">

                            {user?.email ||
                                'User'}

                        </div>


                        <button
                            type="button"
                            onClick={
                                logout
                            }
                            className="rounded-2xl border-2 border-black bg-white px-4 py-2 text-sm font-black transition hover:bg-[#FFC928]"
                        >
                            Logout
                        </button>

                    </div>

                </header>


                {/* ==================================================
                    HERO + CREATE
                ================================================== */}

                <section className="mb-6 grid gap-5 lg:grid-cols-[1.4fr_0.8fr]">


                    {/* HERO */}

                    <div className="rounded-[28px] border-[3px] border-black bg-[#B9A9F5] p-6 shadow-[6px_6px_0px_#17151d] sm:p-8">

                        <p className="text-xs font-black uppercase tracking-[0.2em]">
                            Private workspace
                        </p>


                        <h2 className="mt-3 text-4xl font-black leading-[0.95] sm:text-5xl">

                            Chat with your
                            <br />
                            people + AI.

                        </h2>


                        <p className="mt-5 max-w-xl text-sm font-semibold leading-relaxed sm:text-base">

                            Create a project, invite your
                            friends and have a real-time
                            shared conversation. Add PDFs
                            to give your AI assistant project
                            knowledge.

                        </p>


                        <div className="mt-6 flex flex-wrap gap-2">

                            <span className="rounded-full border-2 border-black bg-[#FFC928] px-3 py-1.5 text-xs font-black">
                                Real-time chat
                            </span>

                            <span className="rounded-full border-2 border-black bg-white px-3 py-1.5 text-xs font-black">
                                Shared AI
                            </span>

                            <span className="rounded-full border-2 border-black bg-white px-3 py-1.5 text-xs font-black">
                                PDF RAG
                            </span>

                        </div>

                    </div>


                    {/* CREATE */}

                    <div className="rounded-[28px] border-[3px] border-black bg-[#F8F6FF] p-6 shadow-[6px_6px_0px_#17151d]">

                        <p className="text-xs font-black uppercase tracking-[0.2em]">
                            New workspace
                        </p>


                        <h3 className="mt-2 text-2xl font-black">
                            Create a project
                        </h3>


                        <p className="mt-2 text-sm font-medium text-black/55">
                            Start a shared conversation.
                        </p>


                        <form
                            onSubmit={
                                createProject
                            }
                            className="mt-5"
                        >

                            <input
                                value={
                                    projectName
                                }
                                onChange={
                                    event =>
                                        setProjectName(
                                            event.target.value
                                        )
                                }
                                placeholder="e.g. College project"
                                className="w-full rounded-2xl border-[3px] border-black bg-white px-4 py-3 text-sm font-medium outline-none focus:shadow-[3px_3px_0px_#17151d]"
                            />


                            <button
                                type="submit"
                                disabled={
                                    creating ||
                                    !projectName.trim()
                                }
                                className="mt-3 w-full rounded-2xl border-[3px] border-black bg-[#FFC928] px-4 py-3 font-black shadow-[3px_3px_0px_#17151d] transition hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none disabled:cursor-not-allowed disabled:opacity-50"
                            >

                                {creating
                                    ? 'Creating...'
                                    : 'Create project →'}

                            </button>

                        </form>

                    </div>

                </section>


                {/* ==================================================
                    ERROR
                ================================================== */}

                {error && (

                    <div className="mb-5 flex items-center justify-between gap-3 rounded-2xl border-[3px] border-black bg-[#FFC928] p-4">

                        <p className="text-sm font-black">
                            {error}
                        </p>


                        <button
                            type="button"
                            onClick={
                                loadProjects
                            }
                            className="shrink-0 rounded-xl border-2 border-black bg-white px-3 py-2 text-xs font-black"
                        >
                            Retry
                        </button>

                    </div>

                )}


                {/* ==================================================
                    PROJECT LIST
                ================================================== */}

                <section>

                    <div className="mb-4 flex items-end justify-between">

                        <div>

                            <p className="text-xs font-black uppercase tracking-[0.2em]">
                                Workspace
                            </p>


                            <h2 className="mt-1 text-2xl font-black">
                                Your projects
                            </h2>

                        </div>


                        {!loading && (

                            <span className="rounded-full border-2 border-black bg-white px-3 py-1 text-xs font-black">
                                {projects.length}
                            </span>

                        )}

                    </div>


                    {loading ? (

                        <div className="grid gap-5 md:grid-cols-2">

                            <div className="h-36 animate-pulse rounded-[24px] border-[3px] border-black bg-[#D5CCFF]" />

                            <div className="h-36 animate-pulse rounded-[24px] border-[3px] border-black bg-[#D5CCFF]" />

                        </div>

                    ) : projects.length === 0 ? (

                        <div className="rounded-[28px] border-[3px] border-black bg-[#F8F6FF] p-8 text-center shadow-[5px_5px_0px_#17151d]">

                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border-[3px] border-black bg-[#FFC928] text-2xl font-black">
                                +
                            </div>


                            <h3 className="mt-5 text-2xl font-black">
                                No projects yet
                            </h3>


                            <p className="mx-auto mt-2 max-w-md text-sm font-medium text-black/55">
                                Create your first project
                                above and start chatting.
                            </p>

                        </div>

                    ) : (

                        <div className="grid gap-5 md:grid-cols-2">

                            {projects.map(
                                project => (

                                    <ProjectCard
                                        key={
                                            project._id
                                        }
                                        project={
                                            project
                                        }
                                    />

                                )
                            )}

                        </div>

                    )}

                </section>


                <footer className="py-8 text-center">

                    <p className="text-xs font-bold text-black/40">
                        TalkSpace · shared conversations
                    </p>

                </footer>

            </div>

        </main>
    )
}


export default Home