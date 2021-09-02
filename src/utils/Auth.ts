import { message } from 'antd';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

export const signIn = async () => {
  const auth = getAuth();
  const provider = new GoogleAuthProvider();
  try {
    await signInWithPopup(auth, provider);
  } catch (e) {
    console.log(e);
    message.error('로그인 실패');
    return;
  }
  message.success('로그인 성공');
};

export const signOut = async () => {
  const auth = getAuth();
  auth.signOut();
};
