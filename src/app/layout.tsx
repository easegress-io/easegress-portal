"use client"

import React from 'react'
import { ClusterType, parseEgctlConfig, EgctlConfig, defaultCluster, getCurrentClusterName, validateEgctlConfig } from '@/apis/cluster'
import { translations } from '@/locale'
import { ClusterContext, defaultEgctlConfig } from './context'
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
import { primaryColor } from './style'
import TextTypo from '@/components/TextTypo'

const StyledMaterialDesignContent = styled(MaterialDesignContent)(() => ({
  '&.notistack-MuiContent-error': {
    backgroundColor: "#fdeded",
    color: "#5f2120",
  },
}));

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
              display: 'flex',
              paddingTop: "10px",
              paddingLeft: "6px",
              paddingRight: "6px",
              flexDirection: 'column',
              background: "var(--fill-2, #F7F8FA)",
            }}>
              <Toolbar />
              <SnackbarProvider
                Components={{
                  error: StyledMaterialDesignContent,
                }}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'center',
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    <AppBar position="fixed"
      elevation={0}
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        background: "#FFF",
        borderBottom: "1px solid #E5E6EB",
        height: "60px",
      }}
    >
      <Toolbar>
        <Stack
          direction="row"
          justifyContent="flex-start"
          alignItems="center"
          spacing={"12px"}
        >
          <Image
            style={{
              width: "32px",
              height: "32px",
              flexShrink: 0,
            }}
            src={easegressSVG}
            alt={"easegress"}
          />
          <ButtonBase onClick={() => { router.push('/') }}>
            <TextTypo text={"Easegress"}
              color='#000'
              fontFamily="Roboto"
              fontSize='20px'
              fontWeight='500'
              lineHeight='16px'
            />
          </ButtonBase>
        </Stack>
        <Typography flexGrow={1} />
        <Stack
          direction="row"
          justifyContent="center"
          alignItems="center"
          spacing={0}
        >
          <Tooltip title={intl.formatMessage({ id: "app.general.github" })}>
            <IconButton
              style={{ background: "transparent", borderRadius: "10px" }}
              size='small'
              onClick={() => { window.open("https://github.com/megaease/easegress-portal", "_blank") }}
            >
              <GitHubIcon
                style={{
                  width: '21px',
                  height: '21px',
                  color: "#2F54EB",
                }}
                color='primary'
              />
            </IconButton>
          </Tooltip>
          <Tooltip title={intl.formatMessage({ id: "app.general.megaease" })}>
            <IconButton
              style={{ background: "transparent", borderRadius: "10px" }}
              size="small"
              onClick={() => { window.open("https://megaease.com/docs/easegress/", "_blank") }}
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
    </AppBar >)
}

function SideBar() {
  const intl = useIntl()
  const router = useRouter()
  const pathname = usePathname()

  const iconStyle = {
    width: "20px",
    height: "20px",
  }
  const items = [
    { name: intl.formatMessage({ id: 'app.cluster' }), url: '/cluster', icon: <FormatListBulletedIcon style={iconStyle} /> },
    { name: intl.formatMessage({ id: 'app.traffic' }), url: '/traffic', icon: <FilterAltIcon style={iconStyle} /> },
    { name: intl.formatMessage({ id: 'app.pipeline' }), url: '/pipeline', icon: <FormatLineSpacingIcon style={iconStyle} /> },
    { name: intl.formatMessage({ id: 'app.controller' }), url: '/controller', icon: <BuildIcon style={{ transform: 'scaleX(-1)', ...iconStyle }} /> },
    { name: intl.formatMessage({ id: 'app.log' }), url: '/log', icon: <DescriptionIcon style={iconStyle} /> },
  ]

  const getCurrentTabValue = () => {
    const value = '/' + pathname.split('/')[1]
    const item = items.find((item) => item.url === value)
    return item ? item.url : ""
  }

  const drawerWidth = 220
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
      <Box>
        <Tabs orientation='vertical' value={false}
          sx={{
            marginRight: "8px",
            marginLeft: "8px"
          }}
        >
          {items.map((item, index) => {
            const selected = getCurrentTabValue() === item.url
            return (
              <Tab
                key={index}
                label={<TextTypo
                  text={item.name}
                  color={selected ? primaryColor : "var(--color-text-2, #4E5969)"}
                  fontFamily="Roboto"
                  fontSize='14px'
                  fontWeight='500'
                  lineHeight='20px'
                />}
                value={item.url}
                onClick={() => { router.push(item.url) }}
                icon={item.icon}
                iconPosition='start'
                style={{
                  textTransform: 'none',
                  justifyContent: 'flex-start',
                  color: selected ? primaryColor : undefined,
                  background: selected ? '#F2F3F5' : undefined,
                  height: "38px",
                  display: "flex",
                  marginBottom: "4px",
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
        background: "var(--fill-2, #F7F8FA)",
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