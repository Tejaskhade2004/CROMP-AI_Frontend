import axios from 'axios';
import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setUserData } from '../redux/userSlice';
import { serverUrl } from '../config/api';

function useGetCurrent() {
    const dispatch = useDispatch()
    useEffect(() => {
        const getCurrentUser = async () => {
            try {
                const result = await axios.get(`${serverUrl}/api/user/me`, { withCredentials: true })
                dispatch(setUserData(result.data));

            } catch (error) {
                const status = error.response?.status
                const code = error.response?.data?.code
                
                // Expected when user is not authenticated
                if (status === 401 || status === 400) {
                    // Clear any stale user data
                    dispatch(setUserData(null))
                } else {
                    console.log('GetCurrent error:', error);
                }
            }
        }
        getCurrentUser()
    }, [dispatch])
}

export default useGetCurrent;
