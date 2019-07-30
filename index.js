import React, { useState, useEffect } from 'react';
import { Modal } from 'react-native';
import { WebView } from 'react-native-webview';
import AsyncStorage from '@react-native-community/async-storage';

const GOOGLE_AUTHORIZATION_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_URL = 'https://www.googleapis.com/oauth2/v4/token';
const GOOGLE_PROFILE_URL = 'https://www.googleapis.com/userinfo/v2/me';

function parse(querystring) {
    querystring = querystring.substring(querystring.indexOf('?')+1).split('&');
    const params = {};
    let pair = void 0;
    const d = decodeURIComponent;
    for (let i = querystring.length - 1; i >= 0; i--) {
      pair = querystring[i].split('=');
      params[d(pair[0])] = d(pair[1] || '');
    }
    return params;
}

/**
 * Get query string
 *
 * @param   {*}   query   query object (any object that Object.entries() can handle)
 * @returns {string}      query string
 */

function querystring(obj) {
    const keyValuePairs = [];
    for (const key in obj) {
      if (obj[key] !== undefined) {
          keyValuePairs.push(encodeURIComponent(key) + '=' + encodeURIComponent(obj[key]));
      }
    }
    return keyValuePairs.join('&');
}

class ReactNativeGoogleLogin {
    constructor() {
        this.accessToken = '';
        this.userDetails = null;
        this.sessionValid = false;
        this.checkValidToken();
        this.getUserDetailsFromAsyncStorage();
    }

    checkAccessToken = async (token) => {
        return fetch(`https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=${token}`).then(res => res.json());
    }

    getUserDetailsFromAsyncStorage = async () => {
        try {
            const data = await AsyncStorage.getItem('@storage_GoogleSimpleLoginUserData');
            if (data !== null) {
              this.userDetails = data;
            }
            return data;
        } catch(e) {
            console.error('Error fetching toekn in async-storage');
        }
    };

    getCurrentUser = () => {
      return this.getUserDetailsFromAsyncStorage();
    };

    getToken = () => {
      return this.checkValidToken();
    };

    getStatus = async () => {
      const data = await this.checkAccessToken(token);
      return data.access_type && !data.error_description;
    };

    revokeAccess = async () => {
      const token = await checkValidToken();
      return await fetch(`https://accounts.google.com/o/oauth2/revoke?token=${token}`).then(res => res.json());
    };

    checkValidToken = async () => {
        try {
            const token = await AsyncStorage.getItem('@storage_GoogleSimpleLoginToken');
            if (token !== null) {
              const data = await this.checkAccessToken(token);
              if(data.access_type && !data.error_description) {
                this.accessToken = token;
                this.sessionValid = true;
              }
            }
            return token;
        } catch(e) {
            console.error('Error fetching toekn in async-storage');
        }
    };

    storeData = async (type, data) => {
        try {
          await AsyncStorage.setItem(type, data);
        } catch (e) {
          console.error('Error saving toekn in async-storage');
        }
    }

    GoogleLogin = (props) => {
        const { credentialsDetails, getAccessToken, getUserDetails, scope, startLogin } = props;
        const { redirectUrl = 'https://localhost', clientId } = credentialsDetails;
        const loginState = (this.accessToken && this.sessionValid);
        const [ isLoggedIn, setLoggedIn ] = useState(loginState);
        useEffect(() => {
          if(!loginState) {
            setLoggedIn(!startLogin);
          } else {
            console.log('User is already logged in');
          }
        }, [!startLogin]);
        
        const urlParams = {
          response_type: 'code',
          redirect_uri: redirectUrl,
          client_id: clientId,
          scope: scope || 'profile email openid',
        };
        const authUrl = `${GOOGLE_AUTHORIZATION_URL}?${querystring(urlParams)}`;
      
        async function fetchAccessTokens(code) {
            const params = {
                code,
                client_id: clientId,
                redirect_uri: redirectUrl,
                grant_type: 'authorization_code',
            };
            const response = await fetch(`${GOOGLE_TOKEN_URL}?${querystring(params)}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                }
            });
            return response.json();
        }
      
        async function fetchUserDetails(accessToken) {
            const response = await fetch(GOOGLE_PROFILE_URL, {
                method: "GET", 
                headers: {
                    'Content-Type': 'application/json; charset=UTF-8',
                    'Authorization': `Bearer ${accessToken}`,
                }
            });
            return response.json();
        }
        handleNavigation = (url) => {
          const query = parse(url);
          if (query) {
            if (query.code) {
              setLoggedIn(true);
              fetchAccessTokens(query.code).then((tokenData) => {
                const token = tokenData.access_token;
                this.storeData('@storage_GoogleSimpleLoginToken', token);
                if (typeof getAccessToken === 'function') {
                  getAccessToken(token);
                }
                this.accessToken = token;
                fetchUserDetails(token).then((userData) => {
                  this.userDetails = userData;
                  this.storeData('@storage_GoogleSimpleLoginUserData', userData);
                  if (typeof getUserDetails === 'function') {
                      getUserDetails(userData);
                  }
                });
              }).catch(e => console.log(e));
            }
          }
        };
        function onNavigationStateChange(e) {
          handleNavigation(e.url);
        }
      
        return (
            <>
            {
                isLoggedIn ? null :
                <Modal>
                    <WebView
                        useWebKit
                        sharedCookiesEnabled
                        source={{ uri: authUrl }}
                        mixedContentMode="compatibility"
                        javaScriptEnabled
                        javaScriptEnabledAndroid
                        bounces
                        userAgent = "Mozilla/5.0 (Linux; Android 4.1.1; Galaxy Nexus Build/JRO03C) AppleWebKit/535.19 (KHTML, like Gecko) Chrome/18.0.1025.166 Mobile Safari/535.19"
                        domStorageEnabled
                        thirdPartyCookiesEnabled
                        originWhitelist={['*']}
                        onNavigationStateChange={onNavigationStateChange}
                    />
                </Modal>
            }
            </>
        );
    }
}
const {
    GoogleLogin,
    getCurrentUser,
    getToken,
    getStatus,
    revokeAccess
} = new ReactNativeGoogleLogin();
export default GoogleLogin;
export {
    getCurrentUser,
    getToken,
    getStatus,
    revokeAccess
};
