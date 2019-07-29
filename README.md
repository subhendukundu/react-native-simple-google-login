# react-native-simple-google-login

![npm (tag)](https://img.shields.io/npm/v/react-native-simple-google-login/latest) [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com) ![GitHub top language](https://img.shields.io/github/languages/top/subhendukundu/react-native-simple-google-login) ![David](https://img.shields.io/david/subhendukundu/react-native-simple-google-login) [![publish size](https://badgen.net/packagephobia/publish/react-native-simple-google-login)](https://badgen.net/packagephobia/publish/react-native-simple-google-login)

A `<GoogleLogin />` component for react-native no native code added light weight library to make user Google login. No setup, no linking required, use it like a component.

This module uses [Google OAuth2](https://developers.google.com/identity/protocols/OAuth2).

## Installation

```sh
npm i --save react-native-simple-google-login
```

or

```sh
yarn add react-native-simple-google-login
```

### Setup Instructions

1. Go to the [Google Developers Console](https://console.developers.google.com/apis/dashboard)
2. Select your project or create a new one (and then select it)
3. Create a service account for your project
  - In the sidebar on the left, expand __APIs & auth__ > __Credentials__
  - Click blue "Add credentials" button
  - Select the "OAuth client ID" option
  - Select the "other" key type option
  - Click blue "Create" button
  - Save the Client_id, that's all you need (__it is the only copy!__)

## Props

| name | desc | type | default
| --- | --- | --- | --- |
| `credentialsDetails` | Google client details | object | {redirectUrl: '', clientId:''}
| `scope` | scope for the login which will be included in access token | string | `'profile email openid'`
| `getAccessToken` | Callback for access token when token received | function | `undefined`
| `getUserDetails` | Callback for user details when received | function | `undefined`

## Usage

```javascript
import React, { useState } from 'react';
import GoogleLogin, { userDetails, accessToken } from 'react-native-simple-google-login';

export default function App() {
  const clientId = 'YOUR_CLIENT_ID';
  const GOOGLE_REDIRECT_URI = 'http://localhost';
  const [ isLoggedIn, setLoggedIn ] = useState(false);

  function _onPressLoginButton() {
    if(isLoggedIn) {
      //do something else
    } else {
      setLoggedIn(true);
    }
  }

  function getAccessToken(token) {
      console.log(token, 'User logged in, token received');
      setLoggedIn(false);
  }

  function getUserDetails(data) {
      console.log(data, 'User details received');
  }

  function _onPressDetailsButton() {
    console.log(userDetails, 'stored user details in async storage');
    console.log(accessToken, 'stored token details in async storage');
  }

  return (
    <View style={{flex: 1}}>
      <GoogleLogin
        credentialsDetails={{
          redirectUrl: GOOGLE_REDIRECT_URI,
          clientId,
        }}
        getAccessToken={getAccessToken}
        getUserDetails={getUserDetails}
      />
      <TouchableOpacity onPress={_onPressLoginButton}>
        <Text>Login with Google</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={_onPressDetailsButton}>
        <Text>Get user details</Text>
      </TouchableOpacity>
    </View>
  )
}
```

## Dependency

[react-native-webview](https://github.com/react-native-community/react-native-webview)
[react-native-webview](https://github.com/react-native-community/async-storage)

### Contribute

Help to make it better! Please see [CONTRIBUTING.md](https://github.com/subhendukundu/react-native-simple-google-login/blob/master/CONTRIBUTING.md) for more details.

License

----
MIT License
