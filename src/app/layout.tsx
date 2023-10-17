"use client"

import React from 'react'
import { ClusterType, parseEgctlConfig, EgctlConfig, defaultCluster, getCurrentClusterName, validateEgctlConfig } from '@/apis/cluster'
import { translations } from '@/locale'
import { ClusterContext } from './context'
import { useSnackbar } from 'notistack';
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
import DescriptionIcon from '@mui/icons-material/Description';
import { loadYaml } from '@/common/utils'

import { MaterialDesignContent } from 'notistack'

const StyledMaterialDesignContent = styled(MaterialDesignContent)(() => ({
  '&.notistack-MuiContent-error': {
    backgroundColor: "#fdeded",
    color: "#5f2120",
  },
}));

const defaultEgctlConfig = `kind: Config

# current used context.
current-context: context-default

# "contexts" section contains "user" and "cluster" information, which informs egctl about which "user" should be used to access a specific "cluster".
contexts:
  - context:
      cluster: cluster-default
      user: user-default
    name: context-default

# "clusters" section contains information about the "cluster".
# "server" specifies the host address that egctl should access.
# "certificate-authority-data" in base64 contain the root certificate authority that the client uses to verify server certificates.
clusters:
  - cluster:
      server: http://localhost:2381
      certificate-authority-data: ""
    name: cluster-default

# "users" section contains "user" information.
# "username" and "password" are used for basic authentication.
# the pair ("client-key-data", "client-certificate-data") in base64 contains the client certificate.
users:
  - name: user-default
    user:
      username: ""
      password: ""
      client-certificate-data: ""
      client-key-data: ""
`

export default function RootLayout({ children, }: { children: React.ReactNode }) {
  return (
    <html>
      <Header />
      <body>
        <IntlProvider
          key={'en-US'}
          locale={'en-US'}
          messages={translations['en-US']}
        >
          <Box sx={{
            display: 'flex',
          }}>
            <CssBaseline />
            <TopAppBar />
            <SideBar />
            <Box component="main" sx={{
              minHeight: "calc(100vh - 30px)",
              flexGrow: 1,
              p: 3,
              display: 'flex',
              flexDirection: 'column',
            }}>
              <Toolbar />
              <SnackbarProvider
                Components={{
                  error: StyledMaterialDesignContent,
                }}
                maxSnack={3}
                autoHideDuration={5000}
              >
                <ClusterContextProvider>
                  {children}
                </ClusterContextProvider>
              </SnackbarProvider>
            </Box>
          </Box>
          <Footer />
        </IntlProvider>
      </body>
    </html >
  )
}

function ClusterContextProvider({ children }: { children: React.ReactNode }) {
  const intl = useIntl()
  const { enqueueSnackbar } = useSnackbar()

  const defaultConfig = parseEgctlConfig(loadYaml(defaultEgctlConfig).result)

  const [clusters, setClusters] = React.useState<ClusterType[]>([defaultCluster])
  const [currentClusterName, setCurrentClusterName] = React.useState<string>(defaultCluster.name)
  const setConfig = (config: EgctlConfig) => {
    setClusters(config.clusters)
    setCurrentClusterName(getCurrentClusterName(config) || config.clusters[0].name)
  }

  React.useEffect(() => {
    let rcFile = localStorage.getItem('easegress-rc-file')
    if (rcFile === null || rcFile === "") {
      localStorage.setItem('easegress-rc-file', defaultEgctlConfig)
      setConfig(defaultConfig)
      return
    }

    let { result, err: yamlErr } = loadYaml(rcFile)
    if (yamlErr !== "") {
      enqueueSnackbar(intl.formatMessage({ id: 'app.general.invalidRCFile' }, { error: yamlErr }), { variant: 'error' })
      localStorage.setItem('easegress-rc-file', defaultEgctlConfig)
      setConfig(defaultConfig)
      return
    }

    const validateErr = validateEgctlConfig(result)
    if (validateErr !== "") {
      enqueueSnackbar(intl.formatMessage({ id: 'app.general.invalidRCFile' }, { error: yamlErr }), { variant: 'error' })
      localStorage.setItem('easegress-rc-file', defaultEgctlConfig)
      setConfig(defaultConfig)
      return
    }

    const egctlConfig = parseEgctlConfig(result)
    setConfig(egctlConfig)
  }, [])

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
    <ClusterContext.Provider value={clusterContext}>
      <Box marginTop={1} marginLeft={2} marginRight={2}>
        {children}
      </Box>
    </ClusterContext.Provider>
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
    { name: intl.formatMessage({ id: 'app.log' }), url: '/log', icon: <DescriptionIcon /> },
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

function Footer() {
  return (
    <Stack
      direction="row"
      justifyContent="center"
      alignItems="center"
      spacing={0}
      sx={{
        marginTop: 'auto',
      }}
    >
      <IconButton
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
      <Typography variant="body2" color="text.secondary" align="center">
        {`© ${new Date().getFullYear()} Megaease, Inc.`}
      </Typography>
    </Stack>
  )
}