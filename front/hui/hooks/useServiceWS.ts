// hooks/useWebSocket.ts
import { useEffect, useState } from "react";

type Beat = {
    timestamp: number;
    Active: boolean;
    latency?: number | null; // Optional field
    service_status: boolean;
}

type ServiceData = {
    service_name: string;
    beats: Beat[]
}
  
type ServiceDataSet = {
    [id_server: number]: ServiceData[];
}


const useWebSocket = () => {
  const [message, setMessage] = useState<ServiceDataSet>({});

  useEffect(() => {
    const wsEndpoint = process.env.NEXT_PUBLIC_SERVICE_WS ?? "ws://localhost:8000/api/service/";
    const socket = new WebSocket(wsEndpoint);

    socket.onmessage = (event) => {
      const newData: ServiceDataSet = JSON.parse(event.data);
      // setMessage((prevMessage) => {
      //   const updatedMessage = { ...prevMessage };
      //   for (const k of Object.keys(newData)) {
      //     if (updatedMessage[k]) {
      //       updatedMessage[k] = [
      //         ...updatedMessage[k],
      //         ...newData[k].filter(
      //           (newItem) =>
      //             !updatedMessage[k].some(
      //               (existingItem) => existingItem.timestamp === newItem.timestamp
      //             )
      //         ),
      //       ];
      //     } else {
      //       updatedMessage[k] = newData[k];
      //     }
      //   }
      //   for (const k of Object.keys(updatedMessage)) {
      //     if (!Object.keys(newData).includes(k)) {
      //       delete updatedMessage[k];
      //     }
      //   }
      //   return updatedMessage;
      // });
      setMessage(newData);
    };

    return () => {
      socket.close();
    };
  }, []);
  return message;
};

export default useWebSocket;
