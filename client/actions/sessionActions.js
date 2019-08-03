import axios from 'axios';
import * as types from './actionTypes';

export const getOrCreateSession = session => ({ type: types.GET_OR_CREATE_SESSION, session });

export const inputUsername = username => ({ type: types.INPUT_USERNAME, username });

export const inputPassword = password => ({ type: types.INPUT_PASSWORD, password });

export const loginSuccessful = user => ({ type: types.LOGIN_SUCCESSFUL, user });

export const loginFailed = () => ({ type: types.LOGIN_FAILED });

export const logout = () => ({ type: types.LOGOUT_USER });

export const setUser = user => ({ type: types.SET_USER, user });

export const activeSession = () => ({ type: types.ACTIVE_SESSION });

export const updateSession = session => ({ type: types.UPDATE_SESSION, session });

export const loginAttempt = history => async (dispatch, getState) => {
  const { authenticate } = getState();
  const { username, password, session } = authenticate;

  try {
    const user = await axios.post('/api/auth/login', {
      username,
      password,
    });
    dispatch(loginSuccessful(user.data));
    const sessionUser = await axios.put(`/api/auth/session/${user.data.id}`, {
      userId: user.data.id,
      sessionId: session.id,
    });
    dispatch(updateSession(sessionUser.data));
    console.log('updated session with user id', sessionUser.data);
    history.push('/');
  } catch (e) {
    console.error(e);
    dispatch(loginFailed());
    dispatch(inputUsername(''));
    dispatch(inputPassword(''));
  }
};

export const logoutUser = () => async (dispatch) => {
  try {
    await axios.post('/api/auth/logout');
    dispatch(logout());
  } catch (e) {
    console.error(e);
  }
};

export const sessionOnLoad = () => async (dispatch) => {
  try {
    const { data } = await axios.get('/api/auth/session');
    console.log('Session Data', data);
    dispatch(getOrCreateSession(data));
    console.log('data', data);
    if (data.userId !== null) {
      dispatch(activeSession());
      const user = await axios.get(`/api/auth/user/${data.userId}`);
      dispatch(setUser(user.data));
    }
  } catch (e) {
    console.error(e);
  }
};
