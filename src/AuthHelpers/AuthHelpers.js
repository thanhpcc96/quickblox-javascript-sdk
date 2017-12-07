import Crypto from 'crypto-js/hmac-sha1';

function signAuthMessage(message, salt) {
  const stingify =  Object.keys(message).map(function(key) {
    if (typeof message[key] === 'object') {
      return Object.keys(message[key]).map(function(keySub) {
        return key + '[' + keySub + ']=' + message[key][keySub];
      }).sort().join('&');
    } else {
      return key + '=' + message[key];
    }
  }).sort().join('&');

  return Crypto(stingify, salt).toString();
}

/**
 * randomNonce - generate 4-digit number 
 */
function randomNonce() {
  return Math.floor(Math.random() * 10000);
}

/** unixTime - return now in Unix format */
function unixTime() {
  return Math.floor(Date.now() / 1000);
}

export function generateAuthMessage(appId, authKey, authSecret) {
  let authMessage =  {
    application_id: appId,
    auth_key: authKey,
    nonce: randomNonce(),
    timestamp: unixTime()
  };

  authMessage.signature = signAuthMessage(authMessage, authSecret);

  return authMessage;
}

