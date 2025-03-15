import { useState } from "react"

function Login() {

    return(
        <>
            <div className="container">
                <div className="row">
                    <div className="col-md-4 offset-md-4">
                        <form>
                            <div className="form-group">
                                <label>Email</label>
                                <input type="email" className="form-control" />
                            </div>
                            <div className="form-group">
                                <label>Password</label>
                                <input type="password" className="form-control" />
                            </div>
                        <button type="submit" className="btn btn-primary">Login</button>
                        </form>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Login