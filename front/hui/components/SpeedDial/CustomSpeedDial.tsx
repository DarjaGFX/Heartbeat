"useClient"
import react, {useState} from 'react';
import AddJournalServiceDialog from "@/components/ServiceDialog/JournalServiceDialog";
import AddOnlineServiceDialog from "@/components/ServiceDialog/OnlineServiceDialog";
import AddServerDialog from "@/components/ServiceDialog/ServerDialog";
import AddSystemdServiceDialog from "@/components/ServiceDialog/SystemdServiceDialog";
import NewspaperIcon from "@mui/icons-material/Newspaper";
import PublicIcon from "@mui/icons-material/Public";
import SettingsSuggestIcon from "@mui/icons-material/SettingsSuggest";
import StorageIcon from '@mui/icons-material/Storage';
import { SpeedDial, SpeedDialAction, SpeedDialIcon } from '@mui/material';
import Box from '@mui/material/Box';

function CustomSpeedDial() {
    const [systemdDialogOpen, setSystemdDialogOpen] = useState(false);
    const [serverDialogOpen, setServerDialogOpen] = useState(false);
    const [journalDialogOpen, setJournalDialogOpen] = useState(false);
    const [onlineDialogOpen, setOnlineDialogOpen] = useState(false);

    const handleSystemdClickOpen = () => {
        setSystemdDialogOpen(true);
    }
    const handleServerClickOpen = () => {
        setServerDialogOpen(true);
    }
    const handleJournalClickOpen = () => {
        setJournalDialogOpen(true);
    }
    const handleOnlineClickOpen = () => {
        setOnlineDialogOpen(true);
    }

    const actions = [
        { icon: <StorageIcon />, name: "New Server", onclick: handleServerClickOpen },
        { icon: <SettingsSuggestIcon />, name: "New Systemd Service", onclick: handleSystemdClickOpen },
        { icon: <NewspaperIcon />, name: "New Journalctl Service Report", onclick: handleJournalClickOpen },
        { icon: <PublicIcon />, name: "New Online Service", onclick: handleOnlineClickOpen },
    ];
    return (
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
    )
}

export default CustomSpeedDial
