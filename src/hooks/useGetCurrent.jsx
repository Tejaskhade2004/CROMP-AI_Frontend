import axios from 'axios';
import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setUserData } from '../redux/userSlice';
import { serverUrl } from '../App';

function useGetCurrent() {
    const dispatch = useDispatch()
    useEffect(() => {
        const getCurrentUser = async () => {
            try {
                const result = await axios.get(`${serverUrl}/api/user/me`, { withCredentials: true })
                dispatch(setUserData(result.data));

            } catch (error) {
                // It is expected to get a 400 when the user is not authenticated yet.
                if (error.response?.status === 400) {
                    console.log('GET /api/user/me returned 400', {
                        data: error.response.data,
                        headers: error.response.headers
                    });
                } else {
                    console.log(error);
                }
            }
        }
        getCurrentUser()
    }, [])
}

export default useGetCurrent;
