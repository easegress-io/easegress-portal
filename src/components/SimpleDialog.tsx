import { Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';


export type SimpleDialogProps = {
  open: boolean
  onClose: () => void
  title: string
  content?: React.ReactNode
  maxWidth?: string
  actions?: {
    label: string
    onClick: () => void
    style?: { [key: string]: any }
  }[]
}

export default function SimpleDialog(props: SimpleDialogProps) {
  const { open, onClose, title, content, actions, maxWidth } = props

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth={maxWidth as any || 'md'}>
      <DialogTitle sx={{ m: 0, p: 2 }}>
        {title}
      </DialogTitle>
      <IconButton
        aria-label="close"
        onClick={onClose}
        sx={{
          position: 'absolute',
          right: 8,
          top: 8,
          color: (theme) => theme.palette.grey[500],
        }}
      >
        <CloseIcon />
      </IconButton>

      {content &&
        <DialogContent>
          {content}
        </DialogContent>
      }
      {actions && actions.length > 0 &&
        <DialogActions >
          {actions.map((action, index) => {
            return (
              <Button
                key={index}
                variant="contained"
                onClick={action.onClick}
                {...action.style}
              >
                {action.label}
              </Button>
            )
          })}
        </DialogActions>
      }
    </Dialog>
  )
}