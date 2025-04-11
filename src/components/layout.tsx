import MoreVertIcon from '@mui/icons-material/MoreVert';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { DefaultRoutes } from '../config/route';

const Layout = () => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const pathList = useMemo(() => {
    return DefaultRoutes[0].children.map(({ path, name }) => ({ path, name }));
  }, []);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <IconButton
        aria-label="more"
        id="long-button"
        aria-controls={open ? 'long-menu' : undefined}
        aria-expanded={open ? 'true' : undefined}
        aria-haspopup="true"
        onClick={handleClick}
        className="!bg-pink-500 size-full"
      >
        <MoreVertIcon />
      </IconButton>
      <Menu
        id="long-menu"
        MenuListProps={{
          'aria-labelledby': 'long-button'
        }}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        className="flex flex-col items-center"
        // PaperProps={{
        //   style: {
        //     maxHeight: 450,
        //     width: '20ch'
        //   }
        // }}
      >
        {pathList.map(({ path, name }) => (
          <Link key={path} to={path}>
            <MenuItem onClick={handleClose}>{name}</MenuItem>
          </Link>
        ))}
      </Menu>
    </>
  );
};

export default Layout;
