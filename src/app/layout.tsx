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
import { ButtonBase, IconButton, Stack, Tab, Tabs, Tooltip } from '@mui/material'

import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import FormatLineSpacingIcon from '@mui/icons-material/FormatLineSpacing';
import BuildIcon from '@mui/icons-material/Build';
import easegressSVG from '@/asserts/easegress.svg'
import megaeaseICO from '@/asserts/megaease.ico'
import GitHubIcon from '@mui/icons-material/GitHub';
import Image from 'next/image'
import { styled } from '@mui/material/styles';

import { MaterialDesignContent } from 'notistack'

const StyledMaterialDesignContent = styled(MaterialDesignContent)(() => ({
  '&.notistack-MuiContent-error': {
    backgroundColor: "#fdeded",
    color: "#5f2120",
  },
}));

export default function RootLayout({ children, }: { children: React.ReactNode }) {
  // TODO: load clusters from file or local storage.
  const fakeCluster: ClusterType = {
    name: "12381",
    cluster: {
      server: "http://localhost:12381",
    }
  }

  const [clusters, setClusters] = React.useState<ClusterType[]>([defaultCluster, fakeCluster])
  const [currentClusterName, setCurrentClusterName] = React.useState<string>(defaultCluster.name)
  const clusterContext = {
    clusters,
    setClusters: (clusters: ClusterType[]) => {
      if (clusters.length === 0) {
        setClusters([defaultCluster])
        setCurrentClusterName(defaultCluster.name)
        return
      }
      setClusters(clusters)
      setCurrentClusterName(clusters[0].name)
    },
    currentClusterName,
    setCurrentClusterName,
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
            <TopAppBar />
            <SideBar />
            <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
              <Toolbar />
              <ClusterContext.Provider value={clusterContext}>
                <SnackbarProvider Components={{
                  success: StyledMaterialDesignContent,
                  error: StyledMaterialDesignContent,
                }} maxSnack={3} autoHideDuration={5000}>
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

function TopAppBar() {
  const router = useRouter()
  const intl = useIntl()

  return (
    <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
      <Toolbar>
        <Stack spacing={1} direction={"row"}>
          <Image
            src={easegressSVG}
            alt={"easegress"}
          />
          <ButtonBase onClick={() => { router.push('/') }}>
            <Typography variant="h6" noWrap component="div" >
              Easegress
            </Typography>
          </ButtonBase>
        </Stack>
        <Typography flexGrow={1} />
        <Stack
          direction="row"
          justifyContent="center"
          alignItems="center"
          spacing={1}
        >
          <Tooltip title={intl.formatMessage({ id: "app.general.github" })}>
            <IconButton
              style={{ background: "white", borderRadius: "10px", }}
              size='small'
              onClick={() => { window.open("https://github.com/megaease/easegress", "_blank") }}
            >
              <GitHubIcon
                style={{
                  width: '24px',
                  height: '24px',
                }}
                color='primary'
              />
            </IconButton>
          </Tooltip>
          <Tooltip title={intl.formatMessage({ id: "app.general.megaease" })}>
            <IconButton
              style={{ background: "white", borderRadius: "10px", }}
              size="small"
              onClick={() => { window.open("https://megaease.com", "_blank") }}
            >
              <Image
                style={{
                  width: '24px',
                  height: '24px',
                }}
                src={megaeaseICO}
                alt="megaease" />
            </IconButton>
          </Tooltip>
        </Stack>
      </Toolbar>
    </AppBar>)
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
