import React, {
    createContext,
    useState
} from 'react'


export const UserContext =
    createContext(null)


export const UserProvider = ({
    children
}) => {

    const [
        user,
        setUserState
    ] = useState(() => {

        try {

            const savedUser =
                localStorage.getItem('user')


            if (!savedUser) {
                return null
            }


            return JSON.parse(
                savedUser
            )

        } catch {

            return null
        }
    })


    const setUser = user => {

        setUserState(user)


        if (user) {

            localStorage.setItem(
                'user',
                JSON.stringify(user)
            )

        } else {

            localStorage.removeItem(
                'user'
            )
        }
    }


    return (

        <UserContext.Provider
            value={{
                user,
                setUser
            }}
        >

            {children}

        </UserContext.Provider>
    )
}