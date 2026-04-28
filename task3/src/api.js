import axios from 'axios';

const API = axios.create({
  baseURL: 'https://taskpro-ai-8302.onrender.com',
});

export default API;