import React from 'react'
import { Link } from 'react-router-dom'

function Home() {
    return (
        <div>
            <h1>Home Page</h1>
            <div>
                <Link to="/register">
                    <button>Go to Register</button>
                </Link>
                <Link to="/login">
                    <button>Go to Login</button>
                </Link>
                <Link to="/profile">
                    <button>Go to Profile</button>
                </Link>
            </div>
        </div>
    )
}

export default Home
