import NLink from 'next/link';
import { Link as CLink, LinkProps as CLinkProps } from '@chakra-ui/react';

interface LinkProps extends CLinkProps {
  label: string
}

function Link({ href, label }: LinkProps) {
  return (
    <NLink href={href} passHref>
      <CLink _hover={{ color: 'blue.500', textDecoration: 'underline' }}>{label}</CLink>
    </NLink>
  );
}

export default Link;