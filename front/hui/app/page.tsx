"use client"
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DashboardIcon from '@mui/icons-material/Dashboard';
import GitHubIcon from "@mui/icons-material/GitHub";
import SearchIcon from '@mui/icons-material/Search';
import StorageIcon from '@mui/icons-material/Storage';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { createTheme } from '@mui/material/styles';
import { AppProvider, type Navigation } from '@toolpad/core/AppProvider';
import {
    DashboardLayout,
    ThemeSwitcher,
    type SidebarFooterProps,
} from '@toolpad/core/DashboardLayout';
import { useDemoRouter } from '@toolpad/core/internal';
import { useEffect, useState } from 'react';
import useServerWS from "@/hooks/useServerWS";
import useServiceWS from "@/hooks/useServiceWS";
import { ServerWSResponse, ServiceWSResponse } from "@/types";
import { fetchServer } from "@/utils/api/serverApi";
import Overview from "@/components/Overview/Overview";
import ServerView from "@/components/MainView/ServerView";
import CustomSpeedDial from "@/components/SpeedDial/CustomSpeedDial";
import { Toaster } from "react-hot-toast";
import NavigationMenuItem from '@/components/Navigation/NavigationMenuItem';

const demoTheme = createTheme({
  cssVariables: {
    colorSchemeSelector: 'data-toolpad-color-scheme',
  },
  colorSchemes: { light: true, dark: true },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 600,
      lg: 1200,
      xl: 1536,
    },
  },
});

function PageContent({ pathname, serverws, servicews, theme}: { pathname: string, serverws: ServerWSResponse, servicews: any, theme: any}) {
  const [serverData, setServerData] = useState<ServerWSResponse>({});
  const [serviceData, setServiceData] = useState<ServiceWSResponse>({});
    
  useEffect(() => {
    if (serverws) {
      setServerData(serverws);
    }
  }, [serverws]);

  useEffect(() => {
    if (servicews) {
      setServiceData(servicews);
    }
  }, [servicews]);

  return (
    <Box
      sx={{
        py: 4,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
      }}
    >
        {Object.keys(serverData).includes(pathname.replace('/', '')) ? <ServerView theme={theme} serverBeats={serverData} serviceBeats={serviceData} server_id={Number(pathname.replace('/', ''))} /> : <Overview serverws={serverData} servicews={serviceData} /> }
    </Box>
  );
}

function ToolbarActionsSearch() {
  return (
    <Stack direction="row">
      {/* <Tooltip title="Search" enterDelay={1000}>
        <div>
          <IconButton
            type="button"
            aria-label="search"
            sx={{
              display: { xs: 'inline', md: 'none' },
            }}
          >
            <SearchIcon />
          </IconButton>
        </div>
      </Tooltip>
      <TextField
        label="Search"
        variant="outlined"
        size="small"
        slotProps={{
          input: {
            endAdornment: (
              <IconButton type="button" aria-label="search" size="small">
                <SearchIcon />
              </IconButton>
            ),
            sx: { pr: 0.5 },
          },
        }}
        sx={{ display: { xs: 'none', md: 'inline-block' }, mr: 1 }}
      /> */}
      <ThemeSwitcher />
    </Stack>
  );
}

function SidebarFooter({ mini }: SidebarFooterProps) {
  return (
    <Typography
      variant="caption"
      sx={{ m: 1, whiteSpace: 'nowrap', overflow: 'hidden' }}
    >
      {mini ? <a href='https://github.com/DarjaGFX/heartbeat'>
                                <GitHubIcon className='m-1 mb-2'/>
                    </a> : <a href='https://github.com/DarjaGFX/heartbeat'>
                                <GitHubIcon className='m-1 mb-2'/>
                                <span>Heartbeat</span>
                    </a>
        }
    </Typography>
  );
}

function CustomAppTitle() {
  return (
    <Stack direction="row" alignItems="center" spacing={2}>
      {/* <CloudCircleIcon fontSize="large" color="primary" /> */}
      <Typography variant="h6">HeartBeat</Typography>
      {/* <Chip size="small" label="BETA" color="info" /> */}
      {/* <Tooltip title="Connected to production">
        <CheckCircleIcon color="success" fontSize="small" />
      </Tooltip> */}
    </Stack>
  );
}


export default function DashboardLayoutSlots() {
  
    const [NAVIGATION, setNavigation] = useState<Navigation>();
    
    const [servers, setServers] = useState({});
    
    // Server List for Drawer
    const server_ws: ServerWSResponse = useServerWS();
    // Service Beats ws
    const service_ws = useServiceWS();
    
    useEffect(() => {
        var navs = [
            {
              kind: 'header',
              title: 'Servers',
            },
            {
              segment: 'overview',
              title: 'Overview',
              icon: <DashboardIcon />,
            }
        ];
        const newServers = {...servers};
        Object.entries(server_ws).forEach(([id, server]) => {
            if (!Object.keys(newServers).includes(id)){
                fetchServer(Number(id), "name")
                .then(data => {
                    newServers[id] = data.name;
                })
                .catch(error => {
                    console.error(`Error fetching server ${id}:`, error);
                    return null;
                })
            }
            navs.push({
                segment: id,
                title: (
                    <NavigationMenuItem
                      id={Number(id)}
                      name={servers[id]}
                      serverNames={servers}
                      setServerNames={setServers}
                    />
                ),
                icon: <StorageIcon style={{ color: server.active ? undefined : 'red' }} />,
            });
        });
        setNavigation(navs);
        setServers(newServers);
    }, [server_ws]);

    const router = useDemoRouter('/overview');
    return (
        <AppProvider
            navigation={NAVIGATION}
            router={router}
            theme={demoTheme}
        >
            <div id="toaster" className="bg-inherit"><Toaster /></div>
            <DashboardLayout
                slots={{
                    appTitle: CustomAppTitle,
                    toolbarActions: ToolbarActionsSearch,
                    sidebarFooter: SidebarFooter,
                }}
                sx={{
                    backgroundColor: (theme) => theme.palette.mode === 'dark' ? '#000' : '#fff',
                    color: (theme) => theme.palette.mode === 'dark' ? '#fff' : '#000',
                }}
            >
            <CustomSpeedDial/>
            <PageContent pathname={router.pathname} serverws={server_ws} servicews={service_ws} theme={demoTheme} />
            </DashboardLayout>
        </AppProvider>
    );
}