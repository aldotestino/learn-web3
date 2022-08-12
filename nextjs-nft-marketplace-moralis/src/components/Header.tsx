import { Heading, HStack } from '@chakra-ui/react';
import { ConnectButton } from '@web3uikit/web3';
import Link from './Link';

function Header() {
  return (
    <HStack justify="space-between" py={10} px={[5, 10, 20]}>
      <Heading size="lg" color="blue.500">NFT Marktplace</Heading>
      
      <HStack spacing={5}>
        <Link href='/' label='Home' />
        <Link href='/sell-nft' label='Sell NFT' />
        <ConnectButton moralisAuth={false} />
      </HStack>
    </HStack>
  );
}

export default Header;