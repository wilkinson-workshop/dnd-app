import { FC, useContext, useEffect, useState } from "react";
import { WebsocketContext } from "./websocket-context";
import { SessionContext } from "./session-context";
import { AppBar, Box, Toolbar, IconButton, Typography, Menu, Button, Tooltip, MenuItem, Divider, Container, Link } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircle from '@mui/icons-material/AccountCircle';
import { EventType } from "../_apis/eventType";
import { useRouter } from "next/navigation";
import { endSession, getSingleSession } from "../_apis/sessionApi";
import { getName } from "../_apis/sessionStorage";
import { Session } from "../_apis/session";


const baseUrl = process.env.NEXT_PUBLIC_CLIENT_BASEURL;
const showDeveloperUI = process.env.NEXT_PUBLIC_DEVELOPER_UI;
const APP_NAME = 'Combat Companion';

export interface TopNavProps {
	isDM: boolean
}

export const TopNav: FC<TopNavProps> = ({ isDM }) => {
	const [session, setSession] = useState<Session>();
	const [anchorElNav, setAnchorElNav] = useState<null | HTMLElement>(null);
	const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);

	const router = useRouter();
	let sessionId = useContext(SessionContext);

	const playerJoinUrl = `${baseUrl}/${sessionId}`;

	useEffect(() => {
		getCurrentSession();
	}, []);

	const navigateDashboard = () => {
		const dashboard = isDM ? 'dm' : 'player';
		router.push(`${playerJoinUrl}/${dashboard}`);
	}


	const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
		setAnchorElNav(event.currentTarget);
	};

	const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
		setAnchorElUser(event.currentTarget);
	};

	const handleCloseNavMenu = () => {
		setAnchorElNav(null);
	};

	const handleCloseUserMenu = () => {
		setAnchorElUser(null);
	};

	function handleEndSession() {
		endSession(sessionId)
			.then(_ => {
				router.push(baseUrl!);
			});
	}

	function getCurrentSession() {
		getSingleSession(sessionId)
			.then(sessions => {
				setSession(sessions[0]);
			});
	}

	return (<>
		<AppBar position="fixed">
			<Container maxWidth="xl">
				<Toolbar disableGutters>
					<Typography
						variant="h6"
						noWrap
						component="div"
						sx={{
							mr: 2,
							display: { xs: 'none', md: 'flex' },
							fontFamily: 'monospace',
							fontWeight: 700,
							letterSpacing: '.3rem',
							color: 'inherit',
							textDecoration: 'none',
						}}
					>
						{APP_NAME}
					</Typography>
					<Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
						<IconButton
							size="large"
							aria-label="account of current user"
							aria-controls="menu-appbar"
							aria-haspopup="true"
							onClick={handleOpenNavMenu}
							color="inherit"
						>
							<MenuIcon />
						</IconButton>
						<Menu
							id="menu-appbar"
							anchorEl={anchorElNav}
							anchorOrigin={{
								vertical: 'bottom',
								horizontal: 'left',
							}}
							keepMounted
							transformOrigin={{
								vertical: 'top',
								horizontal: 'left',
							}}
							open={Boolean(false)}
							onClose={handleCloseNavMenu}
							sx={{
								display: { xs: 'block', md: 'none' },
							}}
						>
							<MenuItem onClick={handleCloseNavMenu}>
								<Typography textAlign="center">Empty</Typography>
							</MenuItem>
						</Menu>
					</Box>
					<Typography
						variant="h5"
						noWrap
						component="a"
						href="#app-bar-with-responsive-menu"
						sx={{
							mr: 2,
							display: { xs: 'flex', md: 'none' },
							flexGrow: 1,
							fontFamily: 'monospace',
							fontWeight: 700,
							letterSpacing: '.3rem',
							color: 'inherit',
							textDecoration: 'none',
						}}
					>
						{/* Mobile Logo */}
					</Typography>
					<Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
						<Button
							onClick={handleCloseNavMenu}
							sx={{ my: 2, color: 'white', display: 'block' }}
						>
							{/*Nav Item */}
						</Button>
					</Box>
					<Box sx={{ flexGrow: 0 }}>
						<Typography sx={{ display: 'inline-block', fontWeight: 'bold', pr: 1, fontSize: '1em' }}>
							{getName()}
						</Typography>
						<Tooltip title="Open settings">
							<IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
								<AccountCircle />
							</IconButton>
						</Tooltip>
						<Menu
							sx={{ mt: '45px' }}
							id="menu-appbar"
							anchorEl={anchorElUser}
							anchorOrigin={{
								vertical: 'top',
								horizontal: 'right',
							}}
							keepMounted
							transformOrigin={{
								vertical: 'top',
								horizontal: 'right',
							}}
							open={Boolean(anchorElUser)}
							onClose={handleCloseUserMenu}
						>
							<MenuItem onClick={navigateDashboard}>
								<Typography textAlign="center">{session?.session_name}</Typography>
							</MenuItem>
							<Divider />
							{isDM ?
								(<MenuItem onClick={handleEndSession}>
									End Session
								</MenuItem>) : ''}
							{isDM ? (<MenuItem onClick={_ => router.push(`${playerJoinUrl}/settings`)}>
									Session Debug
							</MenuItem>) : ''}
							{isDM ? (<MenuItem>
								<Link textAlign="center" underline="none" href={`${playerJoinUrl}/qr`} target='_blank'>
									Show QR code
								</Link>
							</MenuItem>) : ''}
							{showDeveloperUI ?
								(<MenuItem>
									<Link textAlign="center" underline="none" href={playerJoinUrl} target='_blank'>
										Player Join
									</Link>
								</MenuItem>) : ''}
						</Menu>
					</Box>
				</Toolbar>
			</Container>
		</AppBar>
	</>);
}