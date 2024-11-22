import * as React from 'react';
import List from '@mui/material/List';
import { Divider, Drawer, Toolbar } from '@mui/material';
import { DrawerServerItem, ServerWSResponse } from "@/types";
import SideDrawerItem from './SideDrawerItem';
import { ClickAwayListener } from '@mui/base';
import { fetchServer, fetchServers } from '@/utils/api/serverApi';

type Props = {
    status: ServerWSResponse,
    open: boolean,
    setOpen: (open: boolean) => void,
}


function SideDrawer(props: Props) {
    // Drawer
    const drawerWidth = 300;

    const [servers, setServers] = React.useState<DrawerServerItem[]>([]);
    
    React.useEffect(() => {
        fetchServers()
        .then(data => {
            setServers(data);
        })
    }, []); // Added empty dependency array to fetch servers only once

    // sync prefetched servers with status
    React.useEffect(() => {
        const statusServers = Object.keys(props.status);
        const currentServers = servers.map(server => server.id_server);
        
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
                setServers(prevServers => [...prevServers, ...validNewServers]);
            });
        }
    }, [props.status, servers]);


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
                    <Divider variant="middle" component="li" />
                    {Object.entries(props.status).map(serv => {
                        const server = servers.find(s => s.id_server === Number(serv[0]));
                        return server ? (
                            <SideDrawerItem key={serv[0]} status={serv[1]} server={server} />
                        ) : null;
                    })}
                </List>
            </Drawer>
        // </ClickAwayListener>
    )
}

export default SideDrawer
