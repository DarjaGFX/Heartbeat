"use client";
import ServiceChart from "@/components/Chart/ServiceChart";
import SideDrawer from "@/components/Drawer/SideDrawer";
import AddJournalServiceDialog from "@/components/ServiceDialog/JournalServiceDialog";
import AddOnlineServiceDialog from "@/components/ServiceDialog/OnlineServiceDialog";
import AddServerDialog from "@/components/ServiceDialog/ServerDialog";
import AddSystemdServiceDialog from "@/components/ServiceDialog/SystemdServiceDialog";
import useServerWS from "@/hooks/useServerWS";
import useServiceWS from "@/hooks/useServiceWS";
import { DrawerServerItem } from "@/types";
import { fetchServers } from "@/utils/api/serverApi";
import MonitorHeartIcon from "@mui/icons-material/MonitorHeart";
import NewspaperIcon from "@mui/icons-material/Newspaper";
import PublicIcon from "@mui/icons-material/Public";
import SettingsSuggestIcon from "@mui/icons-material/SettingsSuggest";
import StorageIcon from '@mui/icons-material/Storage';
import MenuIcon from '@mui/icons-material/Menu';
import InputBase from '@mui/material/InputBase';
import {
    AppBar,
    Box,
    Button,
    IconButton,
    Tooltip as MuiTooltip,
    SpeedDial,
    SpeedDialAction,
    SpeedDialIcon,
    Toolbar,
    Typography,
    alpha,
    styled
} from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';
import { Theme, ThemeProvider, createTheme } from "@mui/material/styles";
import Switch from "@mui/material/Switch";
import { createContext, useMemo, useState, useEffect } from "react";
import { Toaster } from "react-hot-toast";
import ServerView from "@/components/MainView/ServerView";
import ServiceView from "@/components/MainView/ServiceView";

const Search = styled('div')(({ theme }) => ({
    position: 'relative',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: alpha(theme.palette.common.white, 0.15),
    '&:hover': {
      backgroundColor: alpha(theme.palette.common.white, 0.25),
    },
    marginLeft: 0,
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      marginLeft: theme.spacing(1),
      width: 'auto',
    },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
    padding: theme.spacing(0, 2),
    height: '100%',
    position: 'absolute',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
    color: 'inherit',
    width: '100%',
    '& .MuiInputBase-input': {
      padding: theme.spacing(1, 1, 1, 0),
      // vertical padding + font size from searchIcon
      paddingLeft: `calc(1em + ${theme.spacing(4)})`,
      transition: theme.transitions.create('width'),
      [theme.breakpoints.up('sm')]: {
        width: '12ch',
        '&:focus': {
          width: '20ch',
        },
      },
    },
}));

const ColorModeContext = createContext({ toggleColorMode: () => {} });

const MaterialUISwitch = styled(Switch)(({ theme }: { theme: Theme }) => ({
    width: 62,
    height: 34,
    padding: 7,
    '& .MuiSwitch-switchBase': {
        margin: 1,
        padding: 0,
        transform: 'translateX(6px)',
        transition: theme.transitions.create(['transform', 'color'], {
        duration: theme.transitions.duration.short,
        }),
        '&.Mui-checked': {
        color: '#fff',
        transform: 'translateX(22px)',
        '& .MuiSwitch-thumb:before': {
            backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 20 20"><path fill="${encodeURIComponent('#fff')}" d="M4.2 2.5l-.7 1.8-1.8.7 1.8.7.7 1.8.6-1.8L6.7 5l-1.9-.7-.6-1.8zm15 8.3a6.7 6.7 0 11-6.6-6.6 5.8 5.8 0 006.6 6.6z"/></svg>')`,
        },
        '& + .MuiSwitch-track': {
            opacity: 1,
            backgroundColor: theme.palette.mode === 'dark' ? '#8796A5' : '#aab4be',
        },
        },
    },
    '& .MuiSwitch-thumb': {
        backgroundColor: theme.palette.mode === 'dark' ? '#003892' : '#001e3c',
        width: 32,
        height: 32,
        transition: theme.transitions.create(['background-color'], {
        duration: theme.transitions.duration.short,
        }),
        '&::before': {
        content: "''",
        position: 'absolute',
        width: '100%',
        height: '100%',
        left: 0,
        top: 0,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 20 20"><path fill="${encodeURIComponent('#fff')}" d="M9.305 1.667V3.75h1.389V1.667h-1.39zm-4.707 1.95l-.982.982L5.09 6.072l.982-.982-1.473-1.473zm10.802 0L13.927 5.09l.982.982 1.473-1.473-.982-.982zM10 5.139a4.872 4.872 0 00-4.862 4.86A4.872 4.872 0 0010 14.862 4.872 4.872 0 0014.86 10 4.872 4.872 0 0010 5.139zm0 1.389A3.462 3.462 0 0113.471 10a3.462 3.462 0 01-3.473 3.472A3.462 3.462 0 016.527 10 3.462 3.462 0 0110 6.528zM1.665 9.305v1.39h2.083v-1.39H1.666zm14.583 0v1.39h2.084v-1.39h-2.084zM5.09 13.928L3.616 15.4l.982.982 1.473-1.473-.982-.982zm9.82 0l-.982.982 1.473 1.473.982-.982-1.473-1.473zM9.305 16.25v2.083h1.389V16.25h-1.39z"/></svg>')`,
        },
    },
    '& .MuiSwitch-track': {
        opacity: 1,
        backgroundColor: theme.palette.mode === 'dark' ? '#8796A5' : '#aab4be',
        borderRadius: 20 / 2,
        transition: theme.transitions.create(['background-color'], {
            duration: theme.transitions.duration.short,
        }),
    },
}));

export default function Home() {

    // Drawer Handling
    const [drawerOpen, setDrawerOpen] = useState(false);

    const toggleDrawer = () => {
        setDrawerOpen(!drawerOpen); // Fixed drawer toggle logic
    }

    // WebSocket and chart data handling
    // const service_ws = useServiceWS();
    // Dialog Handling
    const [systemdDialogOpen, setSystemdDialogOpen] = useState(false);
    const [serverDialogOpen, setServerDialogOpen] = useState(false);
    const [journalDialogOpen, setJournalDialogOpen] = useState(false);
    const [onlineDialogOpen, setOnlineDialogOpen] = useState(false);

    const handleSystemdClickOpen = () => {
        setDrawerOpen(false);
        setSystemdDialogOpen(true);
    }
    const handleServerClickOpen = () => {
        // setDrawerOpen(false);
        setServerDialogOpen(true);
    }
    const handleJournalClickOpen = () => {
        // setDrawerOpen(false);
        setJournalDialogOpen(true);
    }
    const handleOnlineClickOpen = () => {
        // setDrawerOpen(false);
        setOnlineDialogOpen(true);
    }

    const actions = [
        { icon: <StorageIcon />, name: "New Server", onclick: handleServerClickOpen },
        { icon: <SettingsSuggestIcon />, name: "New Systemd Service", onclick: handleSystemdClickOpen },
        { icon: <NewspaperIcon />, name: "New Journalctl Service Report", onclick: handleJournalClickOpen },
        { icon: <PublicIcon />, name: "New Online Service", onclick: handleOnlineClickOpen },
    ];

    // Switch THEME
    const [mode, setMode] = useState<"light" | "dark">("light");

    useEffect(() => {
        const savedMode = localStorage.getItem('theme');
        if (savedMode) {
            setMode(savedMode as "light" | "dark");
        }
    }, []);

    const theme = useMemo(() =>
        createTheme({
            palette: {
                mode,
                primary: {
                    main: '#1976d2',
                },
            },
        }),
        [mode]
    );

    const toggleColorMode = () => {
        const newMode = mode === 'light' ? 'dark' : 'light';
        setMode(newMode);
        localStorage.setItem('theme', newMode); // Save new theme to localStorage
    };
    // server list
    const [servers, setServers] = useState<DrawerServerItem[]>([]);

    // Server List for Drawer
    const server_ws = useServerWS();

    // Service Beats ws
    const service_ws = useServiceWS();

    // Page Title
    const [pageTitle, setPageTitle] = useState("HeartBeat");

    // Page Content State
    const [pageContent, setPageContent] = useState<number>(0);


    return (
        <ThemeProvider theme={theme}>
            <main className={theme.palette.mode === 'dark' ? 'bg-gray-950 font-light grid grid-cols-9 h-screen w-screen' : 'bg-white grid grid-cols-9 h-screen w-screen'}>
                <div id="toaster" className="bg-inherit"><Toaster /></div>
                <AppBar position="fixed">
                    <Toolbar className="flex-row-reverse justify-between">
                        <div className="flex flex-row-reverse ">
                            <Typography
                                className="hidden md:inline-flex"
                                variant="h6"
                                noWrap
                                component="a"
                                href=""
                                sx={{
                                    mr: 2,
                                    display: { md: 'flex' },
                                    fontFamily: 'monospace',
                                    fontWeight: 700,
                                    letterSpacing: '.3rem',
                                    color: 'inherit',
                                    textDecoration: 'none',
                                }}
                            >
                                {pageTitle}
                            </Typography>

                            <Search
                                className="mr-5"
                            >
                                <SearchIconWrapper>
                                    <SearchIcon />
                                </SearchIconWrapper>
                                <StyledInputBase
                                    placeholder="Search…"
                                    inputProps={{ 
                                        'aria-label': 'search' 
                                    }}
                                />
                            </Search>

                        </div>
                        <div className="flex justify-between">
                            <IconButton
                                // className="pl-4"
                                size="large"
                                edge="start"
                                color="inherit"
                                aria-label="open drawer"
                                sx={{ mr: 2 }}
                                onClick={toggleDrawer}
                            >
                                <MenuIcon />
                            </IconButton>
                            <div className="hidden md:inline-flex ml-28">
                                <MuiTooltip
                                    title="Change light/dark mode">
                                    <MaterialUISwitch
                                        className="hidden md:inline-flex"
                                        id="themeSwitch"
                                        sx={{ m: 1, mt: 1 }}
                                        checked={theme.palette.mode === 'dark'}
                                        onChange={toggleColorMode}
                                    />
                                </MuiTooltip>
                            </div>
                        </div>
                        {/* </div> */}
                        <div id="speedDial" className="fixed right-6 bottom-6">
                            <Box sx={{ 
                                zIndex: 2000,
                                height: 320,
                                transform: 'translateZ(0px)',
                                flexGrow: 1 
                                }}>
                                <SpeedDial
                                    ariaLabel="SpeedDial basic example"
                                    sx={{ position: 'absolute', bottom: 16, right: 16, zIndex: 1300 }}
                                    icon={<SpeedDialIcon />}
                                >
                                    {actions.map((action) => (
                                        <SpeedDialAction
                                            sx={{
                                                zIndex: 2000,
                                                transform: 'translateZ(0px)',
                                            }}
                                            key={action.name}
                                            icon={action.icon}
                                            tooltipTitle={action.name}
                                            onClick={action.onclick}
                                        />
                                    ))}
                                </SpeedDial>
                            </Box>

                            <AddServerDialog open={serverDialogOpen} setOpen={setServerDialogOpen} />
                            <AddSystemdServiceDialog open={systemdDialogOpen} setOpen={setSystemdDialogOpen} />
                            <AddJournalServiceDialog open={journalDialogOpen} setOpen={setJournalDialogOpen} />
                            <AddOnlineServiceDialog open={onlineDialogOpen} setOpen={setOnlineDialogOpen} />
                        </div>
                    </Toolbar>
                </AppBar>


                <SideDrawer pageSetState={setPageContent} status={server_ws} open={drawerOpen} setOpen={setDrawerOpen} servers={servers} setServers={setServers} />
                
                <div className="bg-inherit flex-wrap col-span-7 mt-28 w-auto h-auto ">
                    {/* Uncomment below to render charts if needed */}
                    {/* {Object.keys(message).map((serviceName) => (
                        <ServiceChart key={serviceName} serviceName={serviceName} message={message[serviceName]} theme={theme} />
                    ))} */}
                    <ServerView 
                        theme={theme}
                        serverBeats={server_ws}
                        pageState={pageContent}
                        serverList={servers}
                        // serviceBeats={service_ws}
                    >
                    </ServerView>
                    <ServiceView 
                        theme={theme}
                        pageState={pageContent}
                        serviceBeats={service_ws}
                    >
                    </ServiceView>
                </div>
            </main>
        </ThemeProvider>
    );
}