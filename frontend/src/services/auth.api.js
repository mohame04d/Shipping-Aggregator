import api from "./api";;

export const signUp=async(userData)=>{
    const res= await api.post('/auth/signUp', userData);
    return res.data;
}

export const login= async(credentials)=>{
    const res= await api.post('/auth/login', credentials);
    return res.data
}

export const logOut=async()=>{
    const res= await api.get('/auth/logOut');
    return res.data
}

export const getMe=async()=>{
    const res= await api.get('/auth/me');
    return res.data
}

export const refreshToken=async()=>{
    const res=await api.post('/auth/refreshToken');
    return res.data;
}