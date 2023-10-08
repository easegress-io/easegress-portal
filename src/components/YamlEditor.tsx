import Editor from '@monaco-editor/react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton } from '@mui/material';
import { editor } from 'monaco-editor';
import CloseIcon from '@mui/icons-material/Close';


export type YamlEditorProps = {
	open: boolean
	onClose: () => void
	title: string
	yaml: string
	onYamlChange: (value: string | undefined, ev: editor.IModelContentChangedEvent) => void
	editorOptions?: editor.IStandaloneEditorConstructionOptions
	actions?: {
		label: string
		onClick: () => void
		style?: { [key: string]: any }
	}[]
}

export default function YamlEditor(props: YamlEditorProps) {
	const { open, onClose, title, yaml, onYamlChange, editorOptions, actions } = props
	const options = {
		scrollBeyondLastLine: false,
		...editorOptions
	}

	return (
		<Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
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

			<DialogContent>
				<Editor language="yaml" value={yaml} height={'80vh'} onChange={onYamlChange}
					options={options} />
			</DialogContent>
			{actions && actions.length > 0 &&
				<DialogActions style={{
					display: 'flex',
					justifyContent: 'center',
					alignItems: 'center',
				}} >
					{actions.map((action, index) => {
						return (
							<Button
								key={index}
								variant="contained"
								style={{
									textTransform: 'none',
									marginLeft: '8px',
									marginRight: '8px',
									minWidth: '150px',
									...action.style
								}}
								onClick={action.onClick}
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