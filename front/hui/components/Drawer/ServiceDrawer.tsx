import * as React from 'react';
import List from '@mui/material/List';
import { Divider, Drawer, Toolbar } from '@mui/material';
import ServiceDrawerItem from './ServiceDrawerItem';


type Props = {
    serviceNames: string[];
}


function ServiceDrawer(props: Props) {
    // Drawer
    const drawerWidth = 260;
    


    return (
        <Drawer
            className="fixed hidden lg:inline-table"
            sx={{
            zIndex: 0,
            width: drawerWidth,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
                width: drawerWidth,
                boxSizing: 'border-box',
            },
            }}
            variant="permanent"
            anchor="right"
        >
            <Toolbar />
            <Divider />
            <List>
                {props.serviceNames.map((text, index) => (
                    <ServiceDrawerItem key={text} serviceName={text}/> 
                ))}
            </List>
        </Drawer>
    )
}

export default ServiceDrawer
