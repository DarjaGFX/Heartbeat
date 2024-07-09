"use client";
import { createContext, useEffect, useMemo, useState } from "react";
import ServiceChart from "@/components/Chart/ServiceChart";
import { ServiceDataSet } from "@/types";
import {
  AppBar,
  Box,
  Button,
  Container,
  Toolbar,
  Typography,
  IconButton,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
} from "@mui/material";
import SettingsSuggestIcon from "@mui/icons-material/SettingsSuggest";
import NewspaperIcon from "@mui/icons-material/Newspaper";
import PublicIcon from "@mui/icons-material/Public";
import GitHubIcon from "@mui/icons-material/GitHub";
import AddSystemdServiceDialog from "@/components/ServiceDialog/SystemdServiceDialog";
import AddJournalServiceDialog from "@/components/ServiceDialog/JournalServiceDialog";
import AddOnlineServiceDialog from "@/components/ServiceDialog/OnlineServiceDialog";
import MenuIcon from "@mui/icons-material/Menu";
import MonitorHeartIcon from "@mui/icons-material/MonitorHeart";
import Switch from "@mui/material/Switch";
import ServiceDrawer from "@/components/Drawer/ServiceDrawer";
import { ThemeProvider, createTheme, styled } from "@mui/material";
import { Toaster } from "react-hot-toast";
import MuiTooltip from '@mui/material/Tooltip';


const ColorModeContext = createContext({ toggleColorMode: () => {} });

export default function Home() {
  // WebSocket and chart data handling
  const [message, setMessage] = useState<ServiceDataSet>({});
  const [maxChartPoint, setMaxChartPoint] = useState(30);

  useEffect(() => {
    let ws_endpoint = process.env.NEXT_PUBLIC_WS ?? "ws://localhost:8000/ws";
    const socket = new WebSocket(ws_endpoint);
    socket.onmessage = (event) => {
      const newData: ServiceDataSet = JSON.parse(event.data);
      setMessage((prevMessage) => {
        const updatedMessage = { ...prevMessage };

        for (const k of Object.keys(newData)) {
          if (updatedMessage[k]) {
            updatedMessage[k] = [
              ...updatedMessage[k],
              ...newData[k].filter(
                (newItem) =>
                  !updatedMessage[k].some(
                    (existingItem) => existingItem.timestamp === newItem.timestamp
                  )
              ),
            ].slice(-1 * maxChartPoint);
          } else {
            updatedMessage[k] = newData[k];
          }
        }
        for (const k of Object.keys(updatedMessage)) {
          if (!Object.keys(newData).includes(k)) {
            delete updatedMessage[k];
          }
        }
        return updatedMessage;
      });
    };

    return () => {
      socket.close();
    };
  }, []);

  // Dialog Handling
  const [systemdDialogOpen, setSystemdDialogOpen] = useState(false);
  const [journalDialogOpen, setJournalDialogOpen] = useState(false);
  const [onlineDialogOpen, setOnlineDialogOpen] = useState(false);

  const handleSystemdClickOpen = () => {
    setSystemdDialogOpen(true);
  };

  const handleJournalClickOpen = () => {
    setJournalDialogOpen(true);
  };

  const handleOnlineClickOpen = () => {
    setOnlineDialogOpen(true);
  };

  const actions = [
    { icon: <SettingsSuggestIcon />, name: "Systemd Service", onclick: handleSystemdClickOpen },
    { icon: <NewspaperIcon />, name: "journalctl System Report", onclick: handleJournalClickOpen },
    { icon: <PublicIcon />, name: "Online Service", onclick: handleOnlineClickOpen },
  ];

  // switch THEME
  const [mode, setMode] = useState<"light" | "dark">("light");
  const theme = useMemo(
    () =>
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

  const MaterialUISwitch = styled(Switch)(({ theme }) => ({
    width: 62,
    height: 34,
    padding: 7,
    '& .MuiSwitch-switchBase': {
      margin: 1,
      padding: 0,
      transform: 'translateX(6px)',
      '&.Mui-checked': {
        color: '#fff',
        transform: 'translateX(22px)',
        '& .MuiSwitch-thumb:before': {
          backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 20 20"><path fill="${encodeURIComponent(
            '#fff',
          )}" d="M4.2 2.5l-.7 1.8-1.8.7 1.8.7.7 1.8.6-1.8L6.7 5l-1.9-.7-.6-1.8zm15 8.3a6.7 6.7 0 11-6.6-6.6 5.8 5.8 0 006.6 6.6z"/></svg>')`,
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
      '&::before': {
        content: "''",
        position: 'absolute',
        width: '100%',
        height: '100%',
        left: 0,
        top: 0,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 20 20"><path fill="${encodeURIComponent(
          '#fff',
        )}" d="M9.305 1.667V3.75h1.389V1.667h-1.39zm-4.707 1.95l-.982.982L5.09 6.072l.982-.982-1.473-1.473zm10.802 0L13.927 5.09l.982.982 1.473-1.473-.982-.982zM10 5.139a4.872 4.872 0 00-4.862 4.86A4.872 4.872 0 0010 14.862 4.872 4.872 0 0014.86 10 4.872 4.872 0 0010 5.139zm0 1.389A3.462 3.462 0 0113.471 10a3.462 3.462 0 01-3.473 3.472A3.462 3.462 0 016.527 10 3.462 3.462 0 0110 6.528zM1.665 9.305v1.39h2.083v-1.39H1.666zm14.583 0v1.39h2.084v-1.39h-2.084zM5.09 13.928L3.616 15.4l.982.982 1.473-1.473-.982-.982zm9.82 0l-.982.982 1.473 1.473.982-.982-1.473-1.473zM9.305 16.25v2.083h1.389V16.25h-1.39z"/></svg>')`,
      },
    },
    '& .MuiSwitch-track': {
      opacity: 1,
      backgroundColor: theme.palette.mode === 'dark' ? '#8796A5' : '#aab4be',
      borderRadius: 20 / 2,
    },
  }));

  const colorMode = useMemo(
    () => ({
      toggleColorMode: async () => {
        setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
      },
    }),
    [],
  );

  return (
    <div >
        <ThemeProvider theme={theme}>
            <main className={theme.palette.mode === 'dark' ? 'bg-gray-950 font-light grid grid-cols-9 h-screen w-screen' : 'bg-white grid grid-cols-9 h-screen  w-screen'}>
            <div id="toaster" className="bg-inherit"><Toaster/></div>
            <AppBar position="fixed">
                <Container maxWidth="xl">
                <Toolbar disableGutters className="flex justify-center md:justify-between">
                    <div className="flex">
                    <MonitorHeartIcon sx={{ display: {md: 'flex' }, mr: 1 , mt: 0.5}} />
                    <Typography
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
                        HeartBeat
                    </Typography>
                    </div>
                    <div className="flex justify-end">
                    <MuiTooltip title="change light/Dark mode">   
                      <MaterialUISwitch 
                        id="themeSwitch"
                        sx={{ m: 1 , mt:2.5 }}
                        checked={theme.palette.mode === 'dark'}
                        onChange={colorMode.toggleColorMode}
                      />
                    </MuiTooltip>
                    <a className="flex" href="https://github.com/DarjaGFX/Heartbeat">
                        <GitHubIcon sx={{ display: { xs: 'none', md: 'flex' }, mr: 1, mt: 3 }} />
                        <Box sx={{ flexGrow: 0, display: { xs: 'none', md: 'flex' } }}>
                        <Button
                            // onClick={handleCloseNavMenu}
                            sx={{ my: 2, color: 'white', display: 'block' }}
                        >
                            Darjagfx/Heartbeat
                        </Button>
                        </Box>
                    </a>
                    </div>
                </Toolbar>
                </Container>
            </AppBar>
            <ServiceDrawer serviceNames={Object.keys(message)} />
            <div id="speedDial" className="fixed right-6 bottom-6" >
                <Box sx={{ zIndex: 1, height: 320, transform: 'translateZ(0px)', flexGrow: 1 }}>
                <SpeedDial
                    ariaLabel="SpeedDial basic example"
                    sx={{ zIndex: 2, position: 'absolute', bottom: 16, right: 16 }}
                    icon={<SpeedDialIcon />}
                >
                    {actions.map((action) => (
                    <SpeedDialAction
                        key={action.name}
                        icon={action.icon}
                        tooltipTitle={action.name}
                        onClick={action.onclick}
                    />
                    ))}
                </SpeedDial>
                </Box>
                <AddSystemdServiceDialog  open={systemdDialogOpen} setOpen={setSystemdDialogOpen} />
                <AddJournalServiceDialog  open={journalDialogOpen} setOpen={setJournalDialogOpen} />
                <AddOnlineServiceDialog  open={onlineDialogOpen} setOpen={setOnlineDialogOpen} />
            </div>
            <div className="bg-inherit flex-wrap col-span-7 mt-28 w-auto h-auto">
                {Object.keys(message).map((serviceName) => (
                <ServiceChart key={serviceName} serviceName={serviceName} message={message[serviceName]} theme={theme} />
                ))}
            </div>
            </main>
        </ThemeProvider>
    </div>
  );
}
