import LinearProgress, { LinearProgressProps } from '@mui/material/LinearProgress';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { styled } from '@mui/material';

function LinearProgressWithLabel(props: LinearProgressProps & { value: number, text: string }) {
  const BorderLinearProgress = styled(LinearProgress)(({ theme }) => ({
    height: 20,
  }));

  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Box sx={{ width: '100%', mr: 1 }}>
        <BorderLinearProgress variant="determinate" {...props} />
        <Box sx={{position: 'relative', bottom: '20px', textAlign: 'center', color:'white'}}>
        <Typography variant="body2">{
            props.text}</Typography>
        </Box>
      </Box>

    </Box>
  );
}

export default function LinearWithValueLabel(props: LinearProgressProps & { value: number, maxValue: number }) {
  const percent = props.value/props.maxValue * 100;
  
  return (
    <Box sx={{ width: '100%' }}>
      <LinearProgressWithLabel color={percent < 10 ? 'error':  percent < 50 ? 'warning': 'primary'} text={`${props.value}/${props.maxValue}`} value={percent } />
    </Box>
  );
}