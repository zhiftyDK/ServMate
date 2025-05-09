import * as React from 'react';
import { styled, useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import MuiDrawer from '@mui/material/Drawer';
import MuiAppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import CssBaseline from '@mui/material/CssBaseline';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AccountMenu from './AccountMenu';
import ServMateLogo from "/images/logo_nobackground.png"
import { Link, Outlet } from 'react-router-dom';

const drawerWidth = 240;
const appBarHeight = 70;

const openedMixin = (theme) => ({
    width: drawerWidth,
    transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
    }),
    overflowX: 'hidden',
});

const closedMixin = (theme) => ({
    transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    overflowX: 'hidden',
    width: `calc(${theme.spacing(7)} + 1px)`,
    [theme.breakpoints.up('sm')]: {
        width: `calc(${theme.spacing(8)} + 1px)`,
    },
});

const DrawerHeader = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: theme.spacing(0, 1),
    // necessary for content to be below app bar
    ...theme.mixins.toolbar,
}));

const AppBar = styled(MuiAppBar, {
    shouldForwardProp: (prop) => prop !== 'open',
})(({ theme }) => ({
    zIndex: theme.zIndex.drawer + 1,
}));

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
    ({ theme }) => ({
        width: drawerWidth,
        flexShrink: 0,
        whiteSpace: 'nowrap',
        boxSizing: 'border-box',
        variants: [
            {
                props: ({ open }) => open,
                style: {
                    ...openedMixin(theme),
                    '& .MuiDrawer-paper': openedMixin(theme),
                },
            },
            {
                props: ({ open }) => !open,
                style: {
                    ...closedMixin(theme),
                    '& .MuiDrawer-paper': closedMixin(theme),
                },
            },
        ],
    }),
);

function Nav() {
    const theme = useTheme();
    const [open, setOpen] = React.useState(true);

    const toggleDrawer = () => {
        setOpen(open ? false : true);
    };

    return (
        <Box sx={{ display: 'flex' }}>
            <CssBaseline />
            <AppBar position="fixed" open={open} sx={{ height: appBarHeight, justifyContent: "center" }}>
                <Toolbar>
                    <IconButton color="inherit" aria-label="open drawer" onClick={toggleDrawer} edge="start" sx={[{ marginRight: 3, }]}>
                        <MenuIcon />
                    </IconButton>
                    <img src={ServMateLogo} style={{ height: appBarHeight - 16 }} />
                    <Box sx={{ ml: 'auto' }}>
                        <AccountMenu />
                    </Box>
                </Toolbar>
            </AppBar>
            <Drawer variant="permanent" open={open}>
                <DrawerHeader sx={{ height: appBarHeight }} />
                <List>
                    <ListItem disablePadding sx={{ display: 'block' }}>
                        <ListItemButton component={Link} to="/overview" sx={[{ minHeight: 48, px: 2.5, }, open ? { justifyContent: 'initial', } : { justifyContent: 'center', },]}>
                            <ListItemIcon sx={[{ minWidth: 0, justifyContent: 'center', }, open ? { mr: 3, } : { mr: 'auto', },]}>
                                <DashboardIcon />
                            </ListItemIcon>
                            <ListItemText primary="Overview" sx={[open ? { opacity: 1, } : { opacity: 0, },]} />
                        </ListItemButton>
                    </ListItem>
                </List>
            </Drawer>
            <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
                <DrawerHeader />
                <Outlet />
            </Box>
        </Box>
    );
}

export default Nav