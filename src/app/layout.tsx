"use client"

import React from 'react'
import { ClusterType } from '@/apis/cluster'
import { translations } from '@/locale'
import { ClusterContext, defaultCluster } from './context'
import { IntlProvider, useIntl } from 'react-intl';
import { useRouter, usePathname } from 'next/navigation'
import { SnackbarProvider } from 'notistack'

import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import AppBar from '@mui/material/AppBar';
import CssBaseline from '@mui/material/CssBaseline';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { ButtonBase, Tab, Tabs } from '@mui/material'

import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import FormatLineSpacingIcon from '@mui/icons-material/FormatLineSpacing';
import BuildIcon from '@mui/icons-material/Build';

export default function RootLayout({ children, }: { children: React.ReactNode }) {
  const router = useRouter()

  // TODO: load clusters from file or local storage.
  const fakeCluster: ClusterType = {
    id: 1,
    name: "port 2381",
    apiAddresses: ["http://localhost:2381"],
  }

  const [clusters, setClusters] = React.useState<ClusterType[]>([defaultCluster, fakeCluster])
  const [currentClusterID, setCurrentClusterID] = React.useState<number>(defaultCluster.id)
  const clusterContext = {
    clusters,
    setClusters: (clusters: ClusterType[]) => {
      if (clusters.length === 0) {
        setClusters([defaultCluster])
        setCurrentClusterID(defaultCluster.id)
        return
      }
      setClusters(clusters)
      setCurrentClusterID(clusters[0].id)
    },
    currentClusterID,
    setCurrentClusterID,
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
                <SnackbarProvider maxSnack={3} autoHideDuration={5000}>
                  <Box marginTop={1} marginLeft={2} marginRight={2}>
                    {children}
                  </Box>
                </SnackbarProvider>
              </ClusterContext.Provider>
            </Box>
          </Box>
        </IntlProvider>
      </body>
    </html >
  )
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
  const router = useRouter()
  const pathname = usePathname()

  const items = [
    { name: intl.formatMessage({ id: 'app.cluster' }), url: '/cluster', icon: <FormatListBulletedIcon /> },
    { name: intl.formatMessage({ id: 'app.traffic' }), url: '/traffic', icon: <FilterAltIcon /> },
    { name: intl.formatMessage({ id: 'app.pipeline' }), url: '/pipeline', icon: <FormatLineSpacingIcon /> },
    { name: intl.formatMessage({ id: 'app.controller' }), url: '/controller', icon: <BuildIcon style={{ transform: 'scaleX(-1)' }} /> },
  ]

  const getCurrentTabValue = () => {
    const value = '/' + pathname.split('/')[1]
    const item = items.find((item) => item.url === value)
    return item ? item.url : false
  }

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
        <Tabs orientation='vertical' value={getCurrentTabValue()} >
          {items.map((item, index) => {
            return (
              <Tab
                key={index}
                label={item.name}
                value={item.url}
                onClick={() => { router.push(item.url) }}
                icon={item.icon}
                iconPosition='start'
                style={{
                  textTransform: 'none',
                  justifyContent: 'flex-start',
                  paddingLeft: '22px',
                }}
              />
            )
          })}
        </Tabs>
      </Box>
    </Drawer >
  )
}
