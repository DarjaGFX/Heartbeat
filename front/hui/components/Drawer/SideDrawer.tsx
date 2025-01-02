import * as React from 'react';
import List from '@mui/material/List';
import { Divider, Drawer, Toolbar } from '@mui/material';
import { DrawerServerItem, ServerWSResponse } from "@/types";
import SideDrawerItem from './SideDrawerItem';
import { ClickAwayListener } from '@mui/base';
import { fetchServer, fetchServers } from '@/utils/api/serverApi';
import GitHubIcon from "@mui/icons-material/GitHub";

type Props = {
    status: ServerWSResponse,
    open: boolean,
    setOpen: (open: boolean) => void,
    servers: DrawerServerItem[],
    setServers: (servers: DrawerServerItem[]) => void,
    pageSetState: (content: number) => void,
}


function SideDrawer(props: Props) {
    // Drawer
    const drawerWidth = 300;

    
    
    const getServers = () => {
        fetchServers()
        .then(data => {
            props.setServers(data);
        })
    }

    // sync prefetched servers with status
    React.useEffect(() => {
        const statusServers = Object.keys(props.status);
        if ( statusServers.length != props.servers.length ) {
            getServers();
        }
        
        
        const currentServers = props.servers.map(server => server.id_server);
        
        
        const newServers = statusServers.filter(serverId => !currentServers.includes(Number(serverId)));
        
        if (newServers.length > 0) {
            Promise.all(newServers.map(serverId => 
                fetchServer(Number(serverId), "name")
                    .then(data => {return {id_server: serverId, name: data.name}})
                    .catch(error => {
                        console.error(`Error fetching server ${serverId}:`, error);
                        return null;
                    })
            )).then(newServerData => {
                const validNewServers = newServerData
                    .filter(server => server !== null)
                    .map(server => ({
                        id_server: Number(server.id_server), // Ensure id_server is a number
                        name: server.name
                    })) as DrawerServerItem[]; // Cast to DrawerServerItem[]
                    props.setServers(prevServers => [...prevServers, ...validNewServers]);
            });
        }
    }, [props.status, props.servers]);


    // React.useEffect(() => {

    // }, [props.open, props.setOpen])
    return (
        // <ClickAwayListener
        //     // onClickAway={() => {props.setOpen(false)}}
        //     onClickAway={() => {}}
        // >
            <Drawer 
                open={props.open}
                // className="fixed"
                sx={
                    {
                        zIndex: 0,
                        // transform: 'translateZ(0px)',
                        width: drawerWidth,
                        flexShrink: 0,
                        '& .MuiDrawer-paper': {
                            width: drawerWidth,
                            boxSizing: 'border-box',
                        },
                    }
                }
                // variant="permanent"
                anchor="left"
            >
                <Toolbar />
                <Divider />
                <List>
                    {/* <div className='flex align-middle content-center justify-center'>
                        <ListItemText primary="Servers"/>
                    </div> */}
                    {/* <Divider variant="middle" component="li" /> */}
                    {Object.entries(props.status).map(serv => {
                        const server = props.servers.find(s => s.id_server === Number(serv[0]));
                        return server ? (
                            <SideDrawerItem drawerSetOpen={props.setOpen} pageSetState={props.pageSetState} key={serv[0]} status={serv[1]} server={server} />
                        ) : null;
                    })}
                </List>
                <div className='flex h-full m-4'>
                    <div className='self-end  w-full'>
                        <Divider className='mb-3'/>
                        <div>
                            <a href='https://github.com/DarjaGFX/heartbeat'>
                                <GitHubIcon className='m-1 mb-2'/>
                                <span>Heartbeat</span>
                            </a>
                        </div>
                    </div>
                </div>
            </Drawer>
        // </ClickAwayListener>
    )
}

export default SideDrawer
