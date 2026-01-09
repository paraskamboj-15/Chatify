import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setAuthUser } from '../redux/authSlice';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { BASE_URL } from '../utils/config';
import axios from 'axios';

const Settings = () => {
    const { authUser } = useSelector(state => state.auth);
    const dispatch = useDispatch();
    const [inputs, setInputs] = useState({ fullName: authUser.fullName, password: "", gender: authUser.gender });

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            const { data } = await axios.put(`${BASE_URL}/api/auth/update-profile`, inputs, { headers: { Authorization: `Bearer ${authUser?.token}` } });
            if(data.error) throw new Error(data.error);
            dispatch(setAuthUser({ ...data, token: authUser?.token }));
            toast.success("Profile Updated Successfully");
        } catch(err) { toast.error(err.message); }
    };

    return (
        <div className='flex flex-col items-center justify-center w-full max-w-md mx-auto p-4'>
            <div className='w-full p-6 rounded-lg shadow-xl bg-gray-800 border border-gray-700'>
                <h1 className='text-3xl font-semibold text-center text-gray-300 mb-6'>Settings</h1>
                
                <div className="flex justify-center mb-6">
                    <img src={authUser.profilePic} alt="Profile" className="w-24 h-24 rounded-full border-4 border-blue-500" />
                </div>

                <form onSubmit={handleUpdate}>
                    <div className="mt-4">
                        <label className='label'><span className='text-base label-text text-gray-300'>Full Name</span></label>
                        <input type='text' value={inputs.fullName} onChange={(e)=>setInputs({...inputs, fullName:e.target.value})} 
                            className='w-full input input-bordered bg-gray-700 text-white' />
                    </div>
                    
                    <div className="mt-4">
                        <label className='label'><span className='text-base label-text text-gray-300'>New Password (Optional)</span></label>
                        <input type='password' value={inputs.password} onChange={(e)=>setInputs({...inputs, password:e.target.value})} 
                            className='w-full input input-bordered bg-gray-700 text-white' placeholder="Leave empty to keep current" />
                    </div>
                    
                    <div className="mt-4">
                        <label className='label'><span className='text-base label-text text-gray-300'>Gender</span></label>
                        <select className="select select-bordered w-full bg-gray-700 text-white" 
                            value={inputs.gender} onChange={(e) => setInputs({...inputs, gender: e.target.value})}>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                        </select>
                    </div>

                    <button className='btn btn-block btn-primary mt-6'>Save Changes</button>
                    <Link to="/" className='btn btn-block btn-outline mt-2 text-white hover:bg-gray-700'>Back to Chat</Link>
                </form>
            </div>
        </div>
    );
};
export default Settings;