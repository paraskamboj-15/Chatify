import React, { useState } from 'react';
import GenderCheckbox from './GenderCheckbox';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setAuthUser } from '../redux/authSlice';
import toast from 'react-hot-toast';
import { BASE_URL } from '../utils/config';
import axios from 'axios';

const SignUp = () => {
    const [inputs, setInputs] = useState({
        fullName: '', username: '', password: '', confirmPassword: '', gender: ''
    });
    const [suggestions, setSuggestions] = useState([]);
    const dispatch = useDispatch();

    const handleCheckboxChange = (gender) => {
        setInputs({ ...inputs, gender });
    };

    const handleUsernameBlur = async (e) => {
        const val = e.target.value;
        if(val.length < 3) return;
        try {
            const { data } = await axios.post(`${BASE_URL}/api/auth/check-username`, { username: val });
            if(!data.available) {
                toast.error("Username taken!");
                setSuggestions(data.suggestions);
            } else {
                setSuggestions([]);
            }
        } catch(err) { console.error(err); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const { fullName, username, password, confirmPassword, gender } = inputs;
        if(!fullName || !username || !password || !confirmPassword || !gender) return toast.error("Please fill all fields");
        if(password !== confirmPassword) return toast.error("Passwords do not match");

        try {
            const { data } = await axios.post(`${BASE_URL}/api/auth/signup`, inputs);
            if (data.error) throw new Error(data.error);
            dispatch(setAuthUser(data));
        } catch (error) { toast.error(error.message); }
    };

    return (
        <div className='flex flex-col items-center justify-center min-w-96 mx-auto'>
            <div className='w-full p-6 rounded-lg shadow-md bg-gray-400 bg-clip-padding backdrop-filter backdrop-blur-lg bg-opacity-0'>
                <h1 className='text-3xl font-semibold text-center text-gray-300'>
                    Sign Up <span className='text-blue-500'>ChatApp</span>
                </h1>
                <form onSubmit={handleSubmit}>
                    <div>
                        <label className='label p-2'><span className='text-base label-text text-gray-300'>Full Name</span></label>
                        <input type='text' placeholder='John Doe' className='w-full input input-bordered h-10' 
                            value={inputs.fullName} onChange={(e) => setInputs({ ...inputs, fullName: e.target.value })}/>
                    </div>
                    <div>
                        <label className='label p-2'><span className='text-base label-text text-gray-300'>Username</span></label>
                        <input type='text' placeholder='johndoe' className='w-full input input-bordered h-10' 
                            value={inputs.username} 
                            onChange={(e) => setInputs({ ...inputs, username: e.target.value })}
                            onBlur={handleUsernameBlur}
                        />
                        {suggestions.length > 0 && (
                            <div className="text-xs text-red-400 mt-1">
                                Taken! Try: {suggestions.map(s => (
                                    <span key={s} className="underline cursor-pointer ml-2 hover:text-blue-300" 
                                        onClick={() => { setInputs({...inputs, username: s}); setSuggestions([]); }}>
                                        {s}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                    <div>
                        <label className='label'><span className='text-base label-text text-gray-300'>Password</span></label>
                        <input type='password' placeholder='Enter Password' className='w-full input input-bordered h-10' 
                            value={inputs.password} onChange={(e) => setInputs({ ...inputs, password: e.target.value })}/>
                    </div>
                    <div>
                        <label className='label'><span className='text-base label-text text-gray-300'>Confirm Password</span></label>
                        <input type='password' placeholder='Confirm Password' className='w-full input input-bordered h-10' 
                            value={inputs.confirmPassword} onChange={(e) => setInputs({ ...inputs, confirmPassword: e.target.value })}/>
                    </div>

                    <GenderCheckbox onCheckboxChange={handleCheckboxChange} selectedGender={inputs.gender} />

                    <Link to='/login' className='text-sm hover:underline hover:text-blue-600 mt-2 inline-block text-gray-300'>
                        Already have an account?
                    </Link>
                    <div><button className='btn btn-block btn-sm mt-2 border border-slate-700'>Sign Up</button></div>
                </form>
            </div>
        </div>
    );
};
export default SignUp;