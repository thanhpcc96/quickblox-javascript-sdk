import axios from 'axios';

import ERRORS from '../Error.js';
import config from '../config.js';
import {urls as defaultUrls, endpoints as defaultEndpoints} from '../defaults.js';

import eventEmitterMixin from '../eventEmitter/eventEmitterMixin.js';

import User from '../User/User.js';

import {generateAuthMessage} from '../AuthHelpers/AuthHelpers.js';

/**
 * Contains all JS SDK API classes and functions.
 * This is the top level component for any Quickblox based application.
 * 
 * @extends {User}
 * 
 * @example
 * import Quickblox from 'quickblox';
 * // or require('quickblox-javascript-sdk');
 * // or window.Quickblox
 * 
 * const creds = {
 *   'appId': 5,
 *   'authKey': 'KnUm1',
 *   'authSecret': 'MKmn-asd1'
 * };
 * 
 * const clientInstance = new QB(creds);
 */
class Client extends User {
  /**
   * Creates an instance of Client.
   * @param {object} creds - all of this parameters you could found in admin panel.
   * @param {number} creds.appId - The Id of uses app.
   * @param {string} [creds.authKey] - The authKey of uses app for authorization/ 
   * @param {string} [creds.authSecret] - Uses as salt.
   * @param {any} [opts={}]
   * @memberof Client
   */
  constructor(creds, opts = {}) {
    super();

    if(!creds || !creds.appId) {
      throw new Error(Client.ERRORS['InvalidConfigurationError'].message);
    }

    this.version = '3.0.0';

    this._appId = creds.appId;
    this._authKey = creds.authKey ? creds.authKey : null;
    this._authSecret = creds.authSecret ? creds.authSecret : null;

    Object.assign(this, config);
    
    this._urls = {};
    Object.assign(this._urls, defaultUrls, opts.urls);

    this._endpoints = {};
    Object.assign(this._endpoints, defaultEndpoints, opts.endpoints);

    this.service = axios.create({
      baseURL: `https://${this._endpoints.api}/`,
    });
  }

  /**
   * Autorize client in Server API (without authorize in Chat or Calling).
   * There 3 parameters you could pass to auth method:
   *  - Nothing.
   * At this way you auth by application session with READ only rights;
   * 
   * - Quickblox Session token.
   * You pass token and SDK gives from Quickblox server all information
   * about session and user if this User session token. 
   * If is Application session token user will be null.
   * 
   *  - A login & a password or an email & the password.
   * At this way you auth as user with User session and CRUD rights;
   * 
   * @param {object} [creds] Data to authorize in Quickblox API Server
   * @param {string} [creds[].token] Quicblox Session Token (Application or User)
   * @param {string} [creds[].login] Login of existed user (uses ONLY with password property)
   * @param {string} [creds[].email] Email of existed user (uses ONLY with password property)
   * @param {string} [creds[].password] Password of existed user (uses with login or email property)
   * 
   * @example 
   * import Quickblox from 'quickblox-javascript-sdk';
   * 
   * const creds = {
   *   'appId': 5,
   *   'authKey': 'KnUm1',
   *   'authSecret': 'MKmn-asd1'
   * };
   * 
   * // or 
   * // const creds = {'token': 'JydmzsuUjhnzx8asj'};
   * 
   * // or 
   * // const userCreds = {
   * //   email: 'helloworld@net.com',
   * //   password: 'secretword'
   * // }
   * // const clientInstance = new QB(userCreds);
   * 
   * const clientInstance = new QB(creds);
   * 
   * clientInstance.auth().then( (token) => {
   *   console.log(`Auth successful with token ${token}`)
   * }).catch( (error) => {
   *   console.error(`Auth successful with token ${err.message}`);
   * });
   */
  auth(creds) {
    const self = this;

    return new Promise((resolve, reject) => {
      if(creds && creds.token) {
        this._syncSession(creds.token).then( (responce) => {
          let data = responce.data.session;

          self.session_token = data.token;
          self.user_id = data.user_id !== 0 ? data.user_id : null;

          // TODO: if user_id !== 0 -> init User info

          resolve(self.session_token);
        });
      } else if(!creds) {
        this._createApplicationSession().then((responce) => {
          let data = responce.data.session;
          
          self.session_token = data.token;
          self.user_id = data.user_id !== 0 ? data.user_id : null;

          resolve(self.session_token);
        }).catch(error => {
          reject(error);
        });
      }
    });
  }
  _createApplicationSession() {
    const self = this;

    return new Promise((resolve, reject) => {
      let authMessage = generateAuthMessage(this._appId, this._authKey, this._authSecret);

      this.service({
        method: 'POST',
        url: `${self._urls.session}.json`,
        data: authMessage
      }).then(function(data) {
        resolve(data);
      }).catch(function(error) {
        reject(error);
      });
    });
  }

  _syncSession(token) {
    const self = this;
    
    return new Promise((resolve, reject) => {

      this.service({
        method: 'GET',
        url: `${self._urls.session}.json`,
        headers: {'QB-Token': token}
      }).then(function(data) {
        resolve(data);
      }).catch(function(error) {
        reject(error);
      });
    });
  }
}

Object.assign(Client.prototype, eventEmitterMixin);

Client.ERRORS = ERRORS;

export default Client;
