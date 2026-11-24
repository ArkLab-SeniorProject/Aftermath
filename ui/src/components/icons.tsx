import React from 'react';

type IconName =
  | 'account'
  | 'arrowBack'
  | 'assignment'
  | 'book'
  | 'checkCircle'
  | 'close'
  | 'edit'
  | 'external'
  | 'healing'
  | 'home'
  | 'login'
  | 'logout'
  | 'menu'
  | 'play'
  | 'person'
  | 'quiz'
  | 'replay'
  | 'shield';

const paths: Record<IconName, React.ReactNode> = {
  account: (
    <>
      <circle cx='12' cy='8' r='4' />
      <path d='M4 21a8 8 0 0 1 16 0' />
    </>
  ),
  arrowBack: (
    <>
      <path d='M19 12H5' />
      <path d='m12 19-7-7 7-7' />
    </>
  ),
  assignment: (
    <>
      <path d='M9 5H5v16h14V5h-4' />
      <path d='M9 3h6v4H9z' />
      <path d='M8 12h8M8 16h8' />
    </>
  ),
  book: (
    <>
      <path d='M4 5.5A2.5 2.5 0 0 1 6.5 3H20v17H6.5A2.5 2.5 0 0 0 4 22z' />
      <path d='M4 5.5v14A2.5 2.5 0 0 1 6.5 17H20' />
    </>
  ),
  checkCircle: (
    <>
      <circle cx='12' cy='12' r='9' />
      <path d='m8 12 3 3 5-6' />
    </>
  ),
  close: (
    <>
      <path d='m18 6-12 12M6 6l12 12' />
    </>
  ),
  edit: (
    <>
      <path d='m14 5 5 5M4 20l4-.8L19 8a2.1 2.1 0 0 0-3-3L5 16z' />
    </>
  ),
  external: (
    <>
      <path d='M14 4h6v6M20 4l-9 9' />
      <path d='M18 13v6H5V6h6' />
    </>
  ),
  healing: (
    <>
      <path d='M20.8 8.6c0 5.4-8.8 11-8.8 11s-8.8-5.6-8.8-11A4.6 4.6 0 0 1 12 6a4.6 4.6 0 0 1 8.8 2.6Z' />
      <path d='M7 12h3l1-2 2 4 1-2h3' />
    </>
  ),
  home: (
    <>
      <path d='m3 10 9-7 9 7' />
      <path d='M5 9v12h14V9M9 21v-7h6v7' />
    </>
  ),
  login: (
    <>
      <path d='M10 17l5-5-5-5M15 12H3' />
      <path d='M12 3h7a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-7' />
    </>
  ),
  logout: (
    <>
      <path d='m14 7 5 5-5 5M19 12H9' />
      <path d='M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h7' />
    </>
  ),
  menu: (
    <>
      <path d='M4 6h16M4 12h16M4 18h16' />
    </>
  ),
  play: (
    <>
      <path d='m8 5 12 7-12 7z' />
    </>
  ),
  person: (
    <>
      <circle cx='12' cy='8' r='4' />
      <path d='M4 21a8 8 0 0 1 16 0' />
    </>
  ),
  quiz: (
    <>
      <circle cx='12' cy='12' r='9' />
      <path d='M9.5 9a2.5 2.5 0 1 1 4.3 1.7c-1 .9-1.8 1.3-1.8 2.8M12 17h.01' />
    </>
  ),
  replay: (
    <>
      <path d='M3 11a9 9 0 1 1 2 6' />
      <path d='M3 4v7h7' />
    </>
  ),
  shield: (
    <>
      <path d='M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z' />
      <path d='m9 12 2 2 4-4' />
    </>
  ),
};

type IconProps = {
  fontSize?: string;
  color?: string;
  sx?: { fontSize?: number | string };
};

function Icon({ name, fontSize = 'medium', color, sx }: IconProps & { name: IconName }) {
  const size = sx?.fontSize ?? (fontSize === 'small' ? 18 : fontSize === 'inherit' ? '1em' : 22);
  return (
    <svg
      aria-hidden='true'
      width={size}
      height={size}
      viewBox='0 0 24 24'
      fill='none'
      stroke={color === 'primary' ? '#1a1a1a' : color === 'disabled' ? '#9e9e9e' : 'currentColor'}
      strokeWidth='1.8'
      strokeLinecap='round'
      strokeLinejoin='round'
      style={{ flexShrink: 0 }}
    >
      {paths[name]}
    </svg>
  );
}

export const AccountCircle = (props: IconProps) => <Icon name='account' {...props} />;
export const ArrowBack = (props: IconProps) => <Icon name='arrowBack' {...props} />;
export const Assignment = (props: IconProps) => <Icon name='assignment' {...props} />;
export const AssignmentOutlined = Assignment;
export const CheckCircleOutline = (props: IconProps) => <Icon name='checkCircle' {...props} />;
export const Close = (props: IconProps) => <Icon name='close' {...props} />;
export const EditOutlined = (props: IconProps) => <Icon name='edit' {...props} />;
export const Healing = (props: IconProps) => <Icon name='healing' {...props} />;
export const Home = (props: IconProps) => <Icon name='home' {...props} />;
export const Login = (props: IconProps) => <Icon name='login' {...props} />;
export const Logout = (props: IconProps) => <Icon name='logout' {...props} />;
export const LogoutOutlined = Logout;
export const Menu = (props: IconProps) => <Icon name='menu' {...props} />;
export const MenuBook = (props: IconProps) => <Icon name='book' {...props} />;
export const OpenInNew = (props: IconProps) => <Icon name='external' {...props} />;
export const PersonOutline = (props: IconProps) => <Icon name='person' {...props} />;
export const PlayArrow = (props: IconProps) => <Icon name='play' {...props} />;
export const Quiz = (props: IconProps) => <Icon name='quiz' {...props} />;
export const Replay = (props: IconProps) => <Icon name='replay' {...props} />;
export const Shield = (props: IconProps) => <Icon name='shield' {...props} />;
