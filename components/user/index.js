import { useEffect, useState, useCallback } from 'react';
import classNames from 'classnames';
import Modal from 'components/modal';
import Script from 'next/script'


function User({ user }) {
  const [isLogin, setLogin] = useState(!!user);
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    window.onGoogleSignIn = function (googleUser) {
      var profile = googleUser.getBasicProfile();
      console.log('ID: ' + profile.getId()); // Do not send to your backend! Use an ID token instead.
      console.log('Name: ' + profile.getName());
      console.log('Image URL: ' + profile.getImageUrl());
      console.log('Email: ' + profile.getEmail()); // This is null if the 'email' scope is not present.
    }

    return () => {
      window.onGoogleSignIn = null;
    }
  }, []);

  const onClick = useCallback(() => {
    setShowLoginModal(true);
  }, []);

  const onModalClose = useCallback(() => {
    setShowLoginModal(false);
  }, []);

  return (
    <div>
      <div
        onClick={onClick}
        className={
        classNames("flex justify-center items-center text-xs select-none cursor-pointer hover:outline outline-gray-500/50 outline-1 outline-offset-2 w-[50px] h-[50px] rounded-full")
        }>
        {
          isLogin ? user.userName : '登录'
        }
      </div>
      <Modal show={showLoginModal} onClose={onModalClose} title="第三方登录授权">
        <div className="flex items-center justify-center flex-col mx-auto mt-[20px] w-[300px]">
          登录后即可创建专属甘特图空间
          <a className="github-login block border flex items-center justify-center hover:bg-gray-300 w-full mt-[20px] h-[60px]" noreferer="true" href={`https://github.com/login/oauth/authorize?login&client_id=${process.env.GANTE_GITHUB_CLIENT_ID}&scope=user`} >
            <i className="w-[36px] h-[36px] bg-[url(/github-mark.png)] bg-contain bg-no-repeat mr-[10px]"></i>
            Github
          </a>
        </div>
      </Modal>
    </div>
  );
}

export default User;
