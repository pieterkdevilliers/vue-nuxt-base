// middleware/auth.js

export default function ({ redirect }) {
    const token = localStorage.getItem('token')
    if (!token) {
        return redirect('/account') // Redirect to the login page if the user is not authenticated
    }
}
