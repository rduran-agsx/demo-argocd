import React from 'react';
import { Button } from '@chakra-ui/react';

const SubmitButton = (props) => {

  return (
    <Button
      height="48px"
      fontSize="16px"
      px="24px"
      variant="solid"
      fontWeight={700}
      textTransform="uppercase"
      {...props}
    >
      SUBMIT
    </Button>
  );
};

export default SubmitButton;