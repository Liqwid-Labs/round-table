import {
  CheckCircleIcon,
  XCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import type { FC } from "react";
import { ProgressBar } from "./status";
import { nanoid } from "nanoid";

type NotificationType = "success" | "error";
type Message = string | Error;
const getMessage = (msg: Message): string =>
  msg instanceof Error ? msg.message : String(msg);

type Notification = {
  id: string;
  type: NotificationType;
  message: string;
};

const NotificationContext = createContext<{
  notifications: Notification[];
  notify: (type: NotificationType, message: Message) => void;
  dismissHandle: (id: string) => void;
}>({
  notifications: [],
  notify: (_: NotificationType, __: Message) => {},
  dismissHandle: (_: string) => {},
});

const NotificationIcon: FC<{
  type: NotificationType;
}> = ({ type }) => {
  const className = "h-4 w-4";

  switch (type) {
    case "success":
      return <CheckCircleIcon className={className} />;
    case "error":
      return <XCircleIcon className={className} />;
  }
};

const getClassName = (type: NotificationType): string => {
  const base = "rounded shadow overflow-hidden relative";

  switch (type) {
    case "success":
      return `${base} bg-green-100 text-green-500`;
    case "error":
      return `${base} bg-red-100 text-red-500`;
  }
};

const getProgressBarClassName = (type: NotificationType): string => {
  const base = `h-1`;

  switch (type) {
    case "success":
      return `${base} bg-green-500 text-green-500`;
    case "error":
      return `${base} bg-red-500 text-red-500`;
  }
};

const Notification: FC<{
  notification: Notification;
  dismissHandle: (id: string) => any;
}> = ({ notification, dismissHandle }) => {
  const { id, type, message } = notification;
  const [progress, setProgress] = useState(100);
  const [timer, setTimer] = useState(true);
  const startTimer = useCallback(() => setTimer(true), []);
  const stopTimer = useCallback(() => setTimer(false), []);
  const intervalRef = useRef<NodeJS.Timer>();

  useEffect(() => {
    if (!timer) {
      clearInterval(intervalRef.current);
      return;
    }

    intervalRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev > 0) {
          return prev - 0.5;
        }
        return 0;
      });
    }, 20);

    return () => {
      clearInterval(intervalRef.current);
    };
  }, [timer]);

  useEffect(() => {
    if (progress <= 0) {
      stopTimer();
      dismissHandle(id);
    }
  }, [progress, dismissHandle, id, stopTimer]);

  return (
    <div
      className={getClassName(type)}
      onMouseEnter={stopTimer}
      onMouseLeave={startTimer}
    >
      <div className="p-2 flex items-start space-x-2">
        <div className="py-1">
          <NotificationIcon type={type} />
        </div>
        <div className="grow break-all">{message}</div>
        <button className="py-1" onClick={() => dismissHandle(id)}>
          <XMarkIcon className="h-4 w-4" />
        </button>
      </div>
      <div className="absolute bottom-0 left-0 right-0">
        <ProgressBar
          className={getProgressBarClassName(type)}
          value={progress}
          max={100}
        />
      </div>
    </div>
  );
};

const NotificationCenter: FC<{
  className: string;
}> = ({ className }) => {
  const { notifications, dismissHandle } = useContext(NotificationContext);

  return (
    <ul className={className}>
      {notifications.map((notification) => (
        <li key={notification.id}>
          <Notification
            notification={notification}
            dismissHandle={dismissHandle}
          />
        </li>
      ))}
    </ul>
  );
};

const useNotification = () => {
  const [notifications, setNotificaitons] = useState<Notification[]>([]);

  const notify = (type: NotificationType, message: Message) => {
    setNotificaitons(
      notifications.concat({
        id: nanoid(),
        type,
        message: getMessage(message),
      }),
    );
  };

  const dismissHandle = (id: string) => {
    setNotificaitons(
      notifications.filter((notification) => notification.id !== id),
    );
  };

  return { notifications, notify, dismissHandle };
};

export type { Notification, NotificationType };
export { NotificationCenter, NotificationContext, useNotification };
