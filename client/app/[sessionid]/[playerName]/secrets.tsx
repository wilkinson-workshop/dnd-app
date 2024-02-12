import { Box, Button, TextField, Link, Grid, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { FC, useEffect, useState } from "react";


export interface SecretsProps {
    secret: string,
    setIsShowSecret: (isShow: boolean) => void
}

export const Secrets: FC<SecretsProps> = ({secret, setIsShowSecret}) => {
    const [storedSecrets, setStoredSecrets] = useState<string[]>([]);

    return (
        <Box>
          {secret}                
          <IconButton aria-label="delete" onClick={() => setIsShowSecret(false)}>
              <CloseIcon />
          </IconButton>
        </Box>
      );
}