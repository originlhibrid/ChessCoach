import { styled } from '@mui/material/styles';
import NextLink from 'next/link';
import { forwardRef } from 'react';

const StyledLink = styled(NextLink)(({ theme }) => ({
  color: 'inherit',
  textDecoration: 'none',
  '&:hover': {
    textDecoration: 'none',
  },
}));

const NavLink = forwardRef<HTMLAnchorElement, any>((props, ref) => {
  return <StyledLink ref={ref} {...props} />;
});

NavLink.displayName = 'NavLink';

export default NavLink;
