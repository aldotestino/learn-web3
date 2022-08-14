import NextLink from 'next/link';
import { Center, Button, VStack, Icon, Heading, Box } from '@chakra-ui/react';
import PageNotFoundSVG from '../components/PageNotFoundSVG';
import { ArrowLeftIcon } from '@heroicons/react/outline';

function PageNotFound() {
  return (
    <Center h="100vh">
      <VStack spacing={10}>
        <PageNotFoundSVG />
        <VStack>
          <Heading>Got lost?</Heading>
          <NextLink href='/' passHref>
            <Button leftIcon={<Icon as={ArrowLeftIcon} />} colorScheme="blue" as="a">Go Back Home</Button>
          </NextLink>
        </VStack>
      </VStack>
    </Center>
  );
}

export default PageNotFound;