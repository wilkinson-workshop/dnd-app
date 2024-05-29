'use client'

import { Box } from "@mui/material";
import { useSearchParams } from "next/navigation";
import QRCode from "react-qr-code";

const baseUrl = process.env.NEXT_PUBLIC_CLIENT_BASEURL; 

const Qr = () => {

	const searchParams = useSearchParams();
	const sessionId = searchParams.get('sessionId');

  const playerJoinUrl = `${baseUrl}/session?sessionId=${sessionId}`;

  return (
    <>
        <Box>
          {playerJoinUrl}
        </Box>
        <QRCode value={playerJoinUrl}/>
    </>      
  );
}

export default Qr;