"use client"

import React from 'react'
import { ClusterType } from '@/common/cluster'
import { translations } from '@/locale'
import { ClusterContext } from './context'
import { IntlProvider, useIntl } from 'react-intl';

import { useRouter } from 'next/navigation'

import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import AppBar from '@mui/material/AppBar';
import CssBaseline from '@mui/material/CssBaseline';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon'
import { ButtonBase } from '@mui/material'

import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import FormatLineSpacingIcon from '@mui/icons-material/FormatLineSpacing';
import BuildIcon from '@mui/icons-material/Build';

const defaultCluster: ClusterType = {
  id: 0,
  name: "localhost",
  apiAddresses: ["http://localhost:2381"],
}

function Header() {
  return (
    <head>
      <title>Easegress Portal</title>
      <meta name="description" content="Easegress Portal" />
    </head>
  )
}

function SideBar() {
  const drawerWidth = 240
  const intl = useIntl()

  const items = [
    { name: intl.formatMessage({ id: 'app.cluster' }), url: '/cluster', icon: <FormatListBulletedIcon /> },
    { name: intl.formatMessage({ id: 'app.traffic' }), url: '/traffic', icon: <FilterAltIcon /> },
    { name: intl.formatMessage({ id: 'app.pipeline' }), url: '/pipeline', icon: <FormatLineSpacingIcon /> },
    { name: intl.formatMessage({ id: 'app.controller' }), url: '/controller', icon: <BuildIcon style={{ transform: 'scaleX(-1)' }} /> },
  ]
  const router = useRouter()

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
      }}
    >
      <Toolbar />
      <Box sx={{ overflow: 'auto' }}>
        <List>
          {items.map((item, index) => (
            <ListItem key={index} disablePadding>
              <ListItemButton onClick={() => { router.push(item.url) }}>
                <ListItemIcon style={{ minWidth: 40 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.name} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>
    </Drawer >
  )
}

export default function RootLayout({ children, }: { children: React.ReactNode }) {
  const router = useRouter()

  // TODO: load clusters from file or local storage.
  const [clusters, setClusters] = React.useState<ClusterType[]>([defaultCluster])
  const [currentCluster, setCurrentCluster] = React.useState<ClusterType>(defaultCluster)
  const clusterContext = {
    clusters,
    setClusters,
    currentCluster,
    setCurrentCluster,
  }

  return (
    <html>
      <Header />
      <body>
        <IntlProvider
          key={'en-US'}
          locale={'en-US'}
          messages={translations['en-US']}
        >
          <Box sx={{ display: 'flex' }}>
            <CssBaseline />
            <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
              <Toolbar>
                <ButtonBase onClick={() => { router.push('/') }}>
                  <Typography variant="h6" noWrap component="div" >
                    Easegress
                  </Typography>
                </ButtonBase>
              </Toolbar>
            </AppBar>
            <SideBar />
            <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
              <Toolbar />
              <ClusterContext.Provider value={clusterContext}>
                {children}
              </ClusterContext.Provider>
            </Box>
          </Box>
        </IntlProvider>
      </body>
    </html >
  )
}
