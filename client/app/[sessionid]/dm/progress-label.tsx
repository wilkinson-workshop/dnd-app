import LinearProgress, { LinearProgressProps } from '@mui/material/LinearProgress';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

function LinearProgressWithLabel(props: LinearProgressProps & { value: number, text: number }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Box sx={{ width: '100%', mr: 1 }}>
        <LinearProgress variant="determinate" {...props} />
      </Box>
      <Box sx={{ minWidth: 35 }}>
        <Typography variant="body2" color="text.secondary">{
          props.text}</Typography>
      </Box>
    </Box>
  );
}

export default function LinearWithValueLabel(props: LinearProgressProps & { value: number, maxValue: number }) {
  const percent = props.value/props.maxValue * 100;
  
  return (
    <Box sx={{ width: '100%' }}>
      <LinearProgressWithLabel color={percent < 10 ? 'error': 'primary'} text={props.value} value={percent } />
    </Box>
  );
}