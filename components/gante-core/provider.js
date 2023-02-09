import React, {
  useReducer, useMemo, useState, useCallback, useRef, useEffect, useImperativeHandle,
  Suspense
} from 'react';
import Events from 'events';
import dynamic from 'next/dynamic';
import { RecoilRoot, useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { RecoilSyncShareDB } from 'recoil-sharedb';
import { ErrorBoundary } from 'react-error-boundary';
import Modal from '../../components/modal';
import * as atoms from './atom';
import dayjs from 'dayjs';
import * as json1 from 'ot-json1';
import { hasProp } from './utils';
import * as actions from './action';

const Context = React.createContext();

export {
  Context
};


const Provider = React.forwardRef(({ children }, forwardRef) => {
  const graphRef = useRef(null);
  const sinkRef = useRef(null);
  const portalRef = useRef(null);
  const list = useRecoilValue(atoms.list);
  const setSpotWidth = useSetRecoilState(atoms.SPOT_WIDTH);

  const impl = useRef({});

  const zoomOut = useCallback(() => {
    setSpotWidth(v => Math.max(v - 5, 25));
  }, []);

  const zoomIn = useCallback(() => {
    setSpotWidth(v => Math.min(v + 5, 50));
  }, []);

  const setGotoTodayImpl = useCallback((gotoImpl) => {
    impl.gotoTodayImpl = gotoImpl;
  }, []);

  const event = useMemo(() => {
    return new Events();
  }, []);

  useImperativeHandle(forwardRef, () => {
    return {
      event,
      zoomOut,
      zoomIn,
      gotoToday: () => {
        if (impl.gotoTodayImpl) {
          impl.gotoTodayImpl();
        }
      }
    };
  });

  const contextValue = useMemo(() => {
    return {
      graphRef,
      setGotoTodayImpl,
      sinkRef,
      zoomOut,
      zoomIn
    };
  }, []);

  return (
    <Context.Provider value={contextValue}>
      { children }
    </Context.Provider>
  );
});

function ErrorFallback({ error }) {
  console.log(error);
  return (
    <div>
      {
        JSON.stringify(error)
      }
    </div>
  );
}

export default React.forwardRef(function ProviderRef({docId, ...props}, ref) {
  const [error, setError] = useState(null);
  const [show, setShow] = useState(false);

  const onError = useCallback((err) => {
    setError(err);
    setShow(true);
  }, []);

  const onRefresh = useCallback(() => {
    window.location.reload();
  }, []);

  const protocol = useMemo(() => {
    if (window.location.protocol === 'https:') {
      return 'wss://';
    }
    return 'ws://';
  }, []);

  return (
    <RecoilRoot>
      <Suspense fallback={<div>global loading...</div>}>
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <RecoilSyncShareDB wsUrl={`${protocol}${window.location.host}/share`} onError={onError} docId={docId}>
            <Suspense fallback={<div>loading...</div>}>
              <Provider {...props} ref={ref} />
            </Suspense>
          </RecoilSyncShareDB>

          <Modal show={show} title="同步发生错误" onClose={onRefresh}>
            <h1>
              { error?.message }
            </h1>
            <div>请刷新</div>
          </Modal>
        </ErrorBoundary>
      </Suspense>
    </RecoilRoot>
  );
});
