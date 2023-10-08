import { useClusters } from "@/app/context";
import { Autocomplete, Card, CardContent, Grid, IconButton, InputAdornment, TextField, Typography } from "@mui/material";
import { useIntl } from "react-intl";
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import Spacer from "@/components/Spacer"
import { Box } from "@mui/system";

export type SearchBarProps = {
  search: string
  onSearchChange: (search: string) => void
  buttons?: React.ReactNode[]
}

export default function SearchBar({ search, onSearchChange, buttons }: SearchBarProps) {
  const { clusters, currentCluster, setCurrentClusterID } = useClusters()
  const intl = useIntl()

  return (
    <Card style={{ boxShadow: 'none' }}>
      <CardContent
        style={{
          background: '#fafafa',
          borderRadius: '12px',
          padding: '16px',
        }}
      >
        <Grid container spacing={1}>
          <Grid item xs={12}>
            <Grid
              container
              justifyContent="space-between"
              style={{
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <Autocomplete
                options={clusters}
                getOptionLabel={(option) => option.name}
                renderInput={(params) => (
                  <TextField
                    style={{
                      background: '#FFF',
                      color: '#646464',
                    }}
                    {...params}
                    label={
                      intl.formatMessage({
                        id: 'app.searchbar.cluster',
                      })
                    }
                    size="small"
                    variant="outlined"
                  />
                )}
                value={currentCluster}
                onChange={(_, value) => {
                  setCurrentClusterID(value.id)
                }}
                style={{ width: '300px' }}
                disableClearable
              />

              <Spacer size={16} />

              <TextField
                style={{
                  flex: 1,
                  height: '40px',
                  background: '#fff',
                  width: '100%',
                  maxWidth: '400px',
                  minWidth: '300px',
                }}
                variant="outlined"
                size="small"
                value={search}
                onChange={(event) => {
                  onSearchChange(event.target.value)
                }}
                label={intl.formatMessage({
                  id: 'app.searchbar.name',
                })}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon
                        onClick={(event) => {
                          event.preventDefault();
                        }}
                      />
                    </InputAdornment>
                  ),
                  endAdornment: search ? (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        edge="end"
                        onClick={() => { onSearchChange('') }}
                      >
                        <ClearIcon />
                      </IconButton>
                    </InputAdornment>
                  ) : null,
                }}
              />

              <Typography flexGrow={1} />

              {buttons && buttons.map((button, index) => {
                return <Box key={index}>
                  <Spacer size={16} />
                  {button}
                </Box>
              })}
            </Grid>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  )
}