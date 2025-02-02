// hooks/useWebSocket.ts
import { useEffect, useState } from "react";
import { ServerWSResponse } from "@/types";




const useWebSocket = () => {
  const [message, setMessage] = useState<ServerWSResponse>({});

  useEffect(() => {
    const wsEndpoint = process.env.NEXT_PUBLIC_SERVER_WS ?? "ws://localhost:8000/api/server/";
    const socket = new WebSocket(wsEndpoint);

    socket.onmessage = (event) => {
      const newData: ServerWSResponse = JSON.parse(event.data);
      // setMessage((prevMessage) => {
      //   const updatedMessage = { ...prevMessage };
      //   for (const k of Object.keys(newData)) {
      //     if (Array.isArray(newData[k])) { // Check if newData[k] is an array
      //       if (updatedMessage[k]) {
      //         // Ensure updatedMessage[k] is an array before spreading
      //         if (Array.isArray(updatedMessage[k])) {
      //           updatedMessage[k] = [
      //             ...updatedMessage[k],
      //             ...newData[k].filter(
      //               (newItem) =>
      //                 !updatedMessage[k].some(
      //                   (existingItem) => existingItem.timestamp === newItem.timestamp
      //                 )
      //             ),
      //           ];
      //         } else {
      //           // If it's not an array, initialize it as an array
      //           updatedMessage[k] = [...newData[k]];
      //         }
      //       } else {
      //         updatedMessage[k] = newData[k]; // Initialize with new data
      //       }
      //     } else {
      //       console.warn(`Expected an array for key ${k}, but got:`, newData[k]);
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
