import QRCode from "react-qr-code";

const baseUrl = process.env.NEXT_PUBLIC_CLIENT_BASEURL; 

const Qr = ({ params }: { params: { sessionid: string } }) => {

  const playerJoinUrl = `${baseUrl}/${params.sessionid}`;

  return (
    <>
        <QRCode value={playerJoinUrl}/>
    </>      
  );
}

export default Qr;