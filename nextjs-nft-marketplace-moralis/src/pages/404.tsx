import NextLink from 'next/link';
import { Center, Button, VStack } from '@chakra-ui/react';
import PageNotFoundSVG from '../components/PageNotFoundSVG';

function PageNotFound() {
  return (
    <Center h="100vh">
      <VStack spacing={10}>
        <PageNotFoundSVG />
        <NextLink href='/' passHref>
          <Button colorScheme="blue" as="a">Go Back Home</Button>
        </NextLink>
      </VStack>
    </Center>
  );
}

export default PageNotFound;