import { useState, useRef, useCallback, useMemo } from 'react';
import classNames from 'classnames';
import dayjs from 'dayjs';
import useGante from './useGante';
import * as atoms from './atom';
import * as actions from './action';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import useInteractionEvent from './use-interaction-event';
import NodeControlPanel from './node-control-panel';
import NodeFormModal from './node-form-modal';
import { positionToDay } from './utils';
import DraggleBar from './draggle-bar';

function Node({ item, index }) {
  const {
    swapItem,
    updateItemConnect,
  } = useGante();
  const updateItemProperty = actions.useUpdateItemProperty();
  const SINK_HEIGHT = useRecoilValue(atoms.SINK_HEIGHT);
  const SPOT_WIDTH = useRecoilValue(atoms.SPOT_WIDTH);
  const startTime = useRecoilValue(atoms.startTime);
  const setCurrentId = useSetRecoilState(atoms.currentNodeId);
  const setCurrentFeatures = useSetRecoilState(atoms.currentFeatures);
  const [contextInfo, setContextInfo] = useState({
    show: false,
    point: null
  });

  const [hover, setHover] = useState(false);

  const width = useRecoilValue(atoms.thatNodeWidth(item.id));
  const left = useRecoilValue(atoms.thatNodeLeft(item.id));
  const days = useRecoilValue(atoms.thatNodeDays(item.id));

  const ref = useInteractionEvent(item.id, {
    onChange: (event, args) => {
      switch(event) {
        case 'hover':
          setHover(args);
          setCurrentFeatures({});
          if (args) {
            setCurrentId(item.id);
          } else {
            setContextInfo({
              show: false
            });
            setCurrentId(null);
          }
          break;

        case 'lock-item':
          {
            if (args.lock) {
              setCurrentId(item.id);
            } else {
              setCurrentId(null);
              setHover(args.hover);
            }
            break;
          }

        case 'connect':
          {
            updateItemConnect(item.id, args.targetNodeId);
            break;
          }
        case 'resize':
          {
            if (args.left) {
              const newBeginTime = positionToDay(
                SPOT_WIDTH,
                startTime,
                args.left,
                Math.floor
              ).valueOf();
              updateItemProperty(item.id, 'startTime', newBeginTime, 'endTime', item.endTime);
            }
            if (args.width) {
              const newEndTime = positionToDay(
                SPOT_WIDTH,
                startTime,
                (args.left || left) + args.width,
                Math.floor
              ).valueOf();
              updateItemProperty(item.id, 'startTime', item.startTime, 'endTime', newEndTime);
            }
          }
          break;

        case 'enter-move':
          setCurrentFeatures(v => ({
            ...v,
            movex: true
          }));
          break;
        case 'leave-move':
          setCurrentFeatures(v => ({
            ...v,
            movex: false
          }));
          break;

        case 'move':
          {
            const newBeginTime = positionToDay(SPOT_WIDTH, startTime, args.left);
            const newEndTime = newBeginTime.add(days - 1, 'day');
            setContextInfo({
              show: false
            });
            updateItemProperty(item.id, 'startTime', newBeginTime.valueOf(), 'endTime', newEndTime.valueOf());
          }
          break;

        case 'enter-sort':
          setCurrentFeatures(v => ({
            ...v,
            sort: true
          }));
          break;
        case 'leave-sort':
          setCurrentFeatures(v => ({
            ...v,
            sort: false
          }));
          break;
        case 'sort':
          {
            const { position } = args;
            const toIndex = Math.floor(args.position.y / SINK_HEIGHT) - 2;
            if (toIndex !== index && toIndex >= 0 && Number.isInteger(toIndex)) {
              swapItem(
                index,
                toIndex
              );
            }
            break;
          }

        case 'click':
          {
            if (args) {
              const { point } = args;
              setContextInfo({
                show: !contextInfo.show,
                point
              });
            }
          }
        default:
          break;
      }
    }
  }, {
    move: !item.lock
  });

  const top = index * SINK_HEIGHT + 7;

  return (
    <div ref={ref}
      className={classNames("absolute select-none text-left flex items-center box-border whitespace-nowrap transition-all duration-350 cursor-pointer", {
        'rounded': !item.lock,
        "z-10": hover,
        'ring-2 ring-sky-500 ring-offset-4 ring-offset-white outline-none': hover && !item.lock,
        'outline outline-white': !hover && !item.lock
      })}
      style={{
        left,
        top,
        height: SINK_HEIGHT- 15,
        width,
        color: item.fgcolor || '#000',
        background: item.color || '#eee'
      }}>
      <div className={classNames("flex-start h-full", {
        'opacity-0': !hover || item.lock
      })}
        data-role="left-dragger">
        <DraggleBar />
      </div>
      <span className="grow px-2">
        { item.title }
      </span>

      <div data-role="ignore-events">

        <NodeControlPanel node={item} contextInfo={contextInfo} left={left} hover={hover}/>

        <NodeFormModal node={item} contextInfo={contextInfo} top={top} left={left} hover={hover}/>

        <div className={classNames("absolute left-full w-7 flex top-0 items-center", {
          hidden: !hover && !(item.connectTo && item.connectTo.length !== 0)
        })} style={{ height: SINK_HEIGHT - 12 }}>
          <div data-role="anchor" className="absolute right-[3px] w-2 h-2 rounded-full bg-sky-500 ring ring-gray-100 ring-offset-gray-300" />
        </div>


      </div>
      <div className={classNames("ml-auto sticky right-2 text-xs mr-2", { hidden: !item.lock })}>
        锁定
      </div>

      <div className={classNames("flex-end h-full",{ 'opacity-0': !hover || item.lock })}
        data-role="right-dragger">
        <DraggleBar />
      </div>
    </div>
  );
}

export default function Nodes() {
  const list = useRecoilValue(atoms.list);
  const [showNodeContext, setShowNodeContext] = useState(null);

  return (
    <div>
      {
        list.map((item, index) => {
          return (
            <Node item={item} key={item.id} index={index} />
          );
        })
      }
    </div>
  );
}


export function getStaticProps() {
  return {
    props: {
      hello: "world"
    }
  };
}
