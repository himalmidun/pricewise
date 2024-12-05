'use client'

import React from 'react'
import { useEffect, useState } from 'react';
import { addUserEmailToProduct, getAcessToken } from '@/lib/actions';
import { redirect } from 'next/navigation';

const OauthPage = () => {
  const [authCode, setAuthCode] = useState<string | null>(null);
  const [scope, setScope] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  console.log('Oauth Page');

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const scope = urlParams.get('scope');
    setAuthCode(code);
    setScope(scope);
    console.log('Inside the first useEffect')
    
    const fetchData = async () => {
      if (code) {
        console.log('Code: ', code);
        const tokens = await getAcessToken(code);
        console.log('Fetched Tokens:'); // Debugging line to check fetched tokens
        if (tokens) {
          setAccessToken(tokens.accessToken);
          setRefreshToken(tokens.refreshToken);
        }
      }
    };
    
    fetchData();
  }, []); // Empty dependency array ensures this effect runs once on component mount
  
  // Effect to log the token and handle redirection
  useEffect(() => {
    if (accessToken && refreshToken) {
      console.log('Access Token:', accessToken); // This should now log after the state is updated
      console.log('Refresh Token:', refreshToken);
      const productId = sessionStorage.getItem('productId');
      const email = sessionStorage.getItem('email');
      sessionStorage.removeItem('productId');
      sessionStorage.removeItem('email');
      if (productId && email) {
        addUserEmailToProduct(productId, email,accessToken, refreshToken);
        redirect(`/products/${productId}`); // Redirect after tokens are set
      } else {
        console.log('Product ID or Email is missing');
      }
    }
  }, [accessToken, refreshToken]);

  return (
    <div>
      <h1>Oauth Page</h1>
      <p>Auth code: {authCode}</p>
      <p>Scope: {scope}</p>
    </div>
  );
};

export default OauthPage;
