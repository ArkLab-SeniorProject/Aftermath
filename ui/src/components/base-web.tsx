import { useStyletron } from 'baseui';
import { Block } from 'baseui/block';
import { Button as BaseButton, KIND, SHAPE, SIZE } from 'baseui/button';
import { Checkbox as BaseCheckbox } from 'baseui/checkbox';
import { Input as BaseInput } from 'baseui/input';
import { Modal } from 'baseui/modal';
import { Radio as BaseRadio, RadioGroup as BaseRadioGroup } from 'baseui/radio';
import { Spinner } from 'baseui/spinner';
import React from 'react';
import type { StyleObject } from 'styletron-standard';

type StyleMap = Record<string, unknown>;
type SxProp = StyleMap | ((theme: unknown) => StyleMap);

const colors: Record<string, string> = {
  'primary.main': '#1a1a1a',
  'primary.contrastText': '#ffffff',
  primary: '#1a1a1a',
  'secondary.main': '#6b6b6b',
  'secondary.contrastText': '#ffffff',
  secondary: '#6b6b6b',
  'background.default': '#f5f5f5',
  'background.paper': '#ffffff',
  'text.primary': '#1a1a1a',
  'text.secondary': '#6b6b6b',
  'text.disabled': '#9e9e9e',
  divider: '#e0e0e0',
  'error.main': '#b3261e',
  'error.contrastText': '#ffffff',
  error: '#b3261e',
  'grey.300': '#e0e0e0',
};

const spacingKeys: Record<string, string[]> = {
  p: ['paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft'],
  px: ['paddingLeft', 'paddingRight'],
  py: ['paddingTop', 'paddingBottom'],
  pt: ['paddingTop'],
  pb: ['paddingBottom'],
  pl: ['paddingLeft'],
  pr: ['paddingRight'],
  m: ['marginTop', 'marginRight', 'marginBottom', 'marginLeft'],
  mx: ['marginLeft', 'marginRight'],
  my: ['marginTop', 'marginBottom'],
  mt: ['marginTop'],
  mb: ['marginBottom'],
  ml: ['marginLeft'],
  mr: ['marginRight'],
};

function resolveColor(value: unknown): unknown {
  return typeof value === 'string' ? (colors[value] ?? value) : value;
}

function cssValue(property: string, value: unknown): StyleObject[string] {
  if (
    typeof value === 'number' &&
    [
      'padding',
      'paddingLeft',
      'paddingRight',
      'paddingTop',
      'paddingBottom',
      'margin',
      'marginLeft',
      'marginRight',
      'marginTop',
      'marginBottom',
      'gap',
      'rowGap',
      'columnGap',
    ].includes(property)
  ) {
    return `${value * 8}px`;
  }
  if (
    typeof value === 'number' &&
    ['width', 'minWidth', 'maxWidth', 'height', 'minHeight', 'maxHeight', 'borderRadius'].includes(
      property
    )
  ) {
    return `${value}px`;
  }
  if (typeof value === 'string') return resolveColor(value) as string;
  if (typeof value === 'boolean' || value === undefined || value === null) return undefined;
  return value as StyleObject[string];
}

function toStyle(sx?: SxProp, defaults: StyleMap = {}): StyleObject {
  const source = typeof sx === 'function' ? sx({}) : sx;
  const result: StyleObject = {};
  const values = { ...defaults, ...source };
  const breakpoints: Record<string, string> = {
    xs: '0px',
    sm: '600px',
    md: '900px',
    lg: '1200px',
    xl: '1536px',
  };

  for (const [rawKey, rawValue] of Object.entries(values)) {
    const keys = spacingKeys[rawKey] ?? [rawKey === 'bgcolor' ? 'backgroundColor' : rawKey];
    if (rawKey.startsWith('&') && typeof rawValue === 'object' && rawValue !== null) {
      result[rawKey] = toStyle(rawValue as StyleMap);
      continue;
    }
    if (rawKey === 'border' && (typeof rawValue === 'string' || typeof rawValue === 'number')) {
      if (rawValue === 0) {
        result.borderWidth = 0;
        result.borderStyle = 'none';
      } else {
        const parts = String(rawValue).split(' ');
        const width = parts.find((part) => /^\d/.test(part));
        const style = parts.find((part) =>
          [
            'dashed',
            'dotted',
            'double',
            'groove',
            'hidden',
            'inset',
            'none',
            'outset',
            'ridge',
            'solid',
          ].includes(part)
        );
        const color = parts.filter((part) => part !== width && part !== style).join(' ');
        result.borderWidth = width ?? '1px';
        result.borderStyle = style ?? 'solid';
        if (color) result.borderColor = color;
        else if (rawValue === 1) result.borderColor = '#e0e0e0';
      }
      continue;
    }
    if (typeof rawValue === 'object' && rawValue !== null && !Array.isArray(rawValue)) {
      for (const [breakpoint, breakpointValue] of Object.entries(rawValue)) {
        const minWidth = breakpoints[breakpoint];
        if (minWidth) {
          const query = breakpoint === 'xs' ? undefined : `@media (min-width: ${minWidth})`;
          const rules = query ? (result[query] as StyleObject | undefined) : result;
          const breakpointRules = {
            ...rules,
            ...Object.fromEntries(keys.map((key) => [key, cssValue(key, breakpointValue)])),
          };
          if (query) result[query] = breakpointRules;
          else Object.assign(result, breakpointRules);
        } else {
          result[breakpoint] = toStyle(breakpointValue as StyleMap);
        }
      }
      continue;
    }
    for (const key of keys) {
      result[key] = cssValue(key, rawValue);
    }
  }
  return result;
}

type BoxProps = Omit<React.HTMLAttributes<HTMLElement>, 'onSubmit' | 'onClick'> & {
  children?: React.ReactNode;
  component?: keyof JSX.IntrinsicElements;
  sx?: SxProp;
  href?: string;
  target?: string;
  rel?: string;
  onClick?: React.MouseEventHandler<HTMLElement>;
  onSubmit?: React.FormEventHandler<HTMLFormElement>;
};

export function Box({ component = 'div', sx, children, ...props }: BoxProps) {
  const [css] = useStyletron();
  const { className, ...rest } = props;
  return React.createElement(
    component,
    { ...rest, className: [className, css(toStyle(sx))].filter(Boolean).join(' ') },
    children
  );
}

type TypographyProps = BoxProps & {
  variant?: string;
  color?: string;
  fontWeight?: number | string;
  align?: 'left' | 'center' | 'right' | 'justify';
  gutterBottom?: boolean;
};

const typographyVariants: Record<string, StyleMap> = {
  h1: { fontSize: '2.5rem', lineHeight: 1.2, fontWeight: 700 },
  h2: { fontSize: '2rem', lineHeight: 1.25, fontWeight: 700 },
  h3: { fontSize: '1.75rem', lineHeight: 1.3, fontWeight: 700 },
  h4: { fontSize: '1.5rem', lineHeight: 1.35, fontWeight: 600 },
  h5: { fontSize: '1.25rem', lineHeight: 1.4, fontWeight: 600 },
  h6: { fontSize: '1.125rem', lineHeight: 1.45, fontWeight: 600 },
  subtitle1: { fontSize: '1rem', lineHeight: 1.5, fontWeight: 500 },
  subtitle2: { fontSize: '0.875rem', lineHeight: 1.5, fontWeight: 500 },
  body1: { fontSize: '1rem', lineHeight: 1.7 },
  body2: { fontSize: '0.875rem', lineHeight: 1.6 },
  caption: { fontSize: '0.75rem', lineHeight: 1.4 },
  overline: { fontSize: '0.75rem', lineHeight: 1.5, textTransform: 'uppercase' },
};

const variantTags: Record<string, keyof JSX.IntrinsicElements> = {
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  h4: 'h4',
  h5: 'h5',
  h6: 'h6',
  body1: 'p',
  body2: 'p',
};

export function Typography({
  variant = 'body1',
  component,
  color,
  fontWeight,
  align,
  gutterBottom,
  sx,
  children,
  ...props
}: TypographyProps) {
  const baseStyle: StyleMap = {
    marginTop: 0,
    marginRight: 0,
    marginBottom: gutterBottom ? '0.35em' : 0,
    marginLeft: 0,
    fontFamily: 'inherit',
    textAlign: align,
    fontWeight,
    ...typographyVariants[variant],
  };
  if (color) baseStyle.color = colors[color] ?? color;
  return React.createElement(
    Box,
    {
      component: component ?? variantTags[variant] ?? 'span',
      sx: { ...baseStyle, ...sx },
      ...props,
    },
    children
  );
}

type BaseButtonProps = React.ComponentProps<typeof BaseButton>;
type ButtonProps = Omit<BaseButtonProps, 'kind' | 'size' | 'startEnhancer' | 'endEnhancer'> & {
  variant?: 'contained' | 'outlined' | 'text';
  size?: 'small' | 'medium' | 'large';
  color?: string;
  fullWidth?: boolean;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  sx?: SxProp;
};

export function Button({
  variant = 'contained',
  size = 'medium',
  color,
  fullWidth,
  startIcon,
  endIcon,
  sx,
  children,
  ...props
}: ButtonProps) {
  const outlined = variant === 'outlined';
  const kind =
    color === 'error'
      ? variant === 'contained'
        ? KIND.dangerPrimary
        : variant === 'outlined'
          ? KIND.dangerSecondary
          : KIND.dangerTertiary
      : color === 'inherit'
        ? KIND.tertiary
        : variant === 'contained'
          ? KIND.primary
          : variant === 'outlined'
            ? KIND.secondary
            : KIND.tertiary;
  return (
    <BaseButton
      kind={kind}
      size={size === 'small' ? SIZE.compact : size === 'large' ? SIZE.large : SIZE.default}
      startEnhancer={startIcon}
      endEnhancer={endIcon}
      overrides={{
        BaseButton: {
          style: {
            width: fullWidth ? '100%' : undefined,
            fontWeight: 600,
            ...(outlined
              ? {
                  color:
                    color === 'inherit' ? 'inherit' : color === 'error' ? '#b3261e' : '#1a1a1a',
                  backgroundColor: 'transparent',
                  boxShadow: 'inset 0 0 0 1px currentColor',
                  ':hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' },
                }
              : color === 'inherit'
                ? { color: 'inherit', backgroundColor: 'transparent' }
                : {}),
            ':disabled': {
              color: '#5d5d5d',
              backgroundColor: '#e5e5e5',
              opacity: 1,
              cursor: 'not-allowed',
            },
            ...toStyle(sx),
          },
        },
      }}
      {...props}
    >
      {children}
    </BaseButton>
  );
}

type IconButtonProps = ButtonProps & { 'aria-label': string; edge?: string };

export function IconButton({ sx, children, ...props }: IconButtonProps) {
  return (
    <BaseButton
      kind={KIND.tertiary}
      shape={SHAPE.circle}
      size={SIZE.compact}
      overrides={{ BaseButton: { style: toStyle(sx) } }}
      {...props}
    >
      {children}
    </BaseButton>
  );
}

type TextFieldProps = Omit<React.ComponentProps<typeof BaseInput>, 'overrides'> & {
  label?: React.ReactNode;
  helperText?: React.ReactNode;
  fullWidth?: boolean;
  sx?: SxProp;
  inputProps?: Pick<
    React.InputHTMLAttributes<HTMLInputElement>,
    'inputMode' | 'maxLength' | 'autoComplete'
  >;
};

export function TextField({
  label,
  helperText,
  fullWidth,
  sx,
  inputProps,
  ...props
}: TextFieldProps) {
  return (
    <Box
      component={label ? 'label' : 'div'}
      sx={{
        display: 'block',
        width: fullWidth ? '100%' : undefined,
        maxWidth: '100%',
        ...sx,
      }}
    >
      {label && (
        <Box sx={{ display: 'block', mb: 0.5, fontSize: '0.875rem', fontWeight: 500 }}>{label}</Box>
      )}
      <BaseInput
        {...props}
        {...inputProps}
        overrides={{
          Root: { style: { width: '100%', paddingRight: 0, backgroundColor: '#ffffff' } },
          InputContainer: {
            style: {
              borderRadius: '10px',
              backgroundColor: '#ffffff',
              borderColor: '#8a8a8a',
              ':focus-within': { borderColor: '#1a1a1a', borderWidth: '2px' },
            },
          },
          Input: { style: { fontFamily: 'inherit', color: '#1a1a1a', backgroundColor: '#ffffff' } },
        }}
      />
      {helperText && (
        <Box sx={{ mt: 0.5, fontSize: '0.75rem', color: 'text.secondary' }}>{helperText}</Box>
      )}
    </Box>
  );
}

type SurfaceProps = BoxProps & { elevation?: number; variant?: string };

export function Paper({ sx, elevation: _elevation, variant: _variant, ...props }: SurfaceProps) {
  return (
    <Box
      sx={{
        backgroundColor: 'background.paper',
        border: '1px solid #e0e0e0',
        borderRadius: '16px',
        ...sx,
      }}
      {...props}
    />
  );
}

type LinkProps = Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'onSubmit'> & {
  component?: keyof JSX.IntrinsicElements;
  variant?: string;
  underline?: 'always' | 'hover' | 'none';
  color?: string;
  sx?: SxProp;
};

export function Link({
  component = 'a',
  underline = 'hover',
  color,
  sx,
  children,
  ...props
}: LinkProps) {
  return (
    <Box
      component={component}
      sx={{
        color: colors[color ?? 'text.primary'] ?? color ?? '#1a1a1a',
        textDecoration:
          underline === 'none' ? 'none' : underline === 'always' ? 'underline' : 'none',
        cursor: 'pointer',
        ...(component === 'button'
          ? {
              padding: 0,
              border: 0,
              backgroundColor: 'transparent',
              fontFamily: 'inherit',
              fontSize: 'inherit',
              fontWeight: 'inherit',
              lineHeight: 'inherit',
            }
          : {}),
        ...(underline === 'hover' ? { '&:hover': { textDecoration: 'underline' } } : {}),
        ...sx,
      }}
      {...props}
    >
      {children}
    </Box>
  );
}

type AlertProps = BoxProps & {
  severity?: 'error' | 'success' | 'warning' | 'info';
  action?: React.ReactNode;
};

export function Alert({ severity = 'info', action, sx, children, ...props }: AlertProps) {
  const palette = {
    error: { color: '#8b1d16', backgroundColor: '#fce8e6' },
    success: { color: '#176b37', backgroundColor: '#e6f4ea' },
    warning: { color: '#7a4d00', backgroundColor: '#fff4d6' },
    info: { color: '#174ea6', backgroundColor: '#e8f0fe' },
  }[severity];
  return (
    <Box
      role='alert'
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 2,
        p: 2,
        borderRadius: '8px',
        ...palette,
        ...sx,
      }}
      {...props}
    >
      <span>{children}</span>
      {action}
    </Box>
  );
}

type ProgressProps = {
  value?: number;
  size?: number;
  variant?: string;
  color?: string;
  sx?: SxProp;
  'aria-label'?: string;
};

export function CircularProgress({ size = 40, sx, 'aria-label': ariaLabel }: ProgressProps) {
  return <Spinner aria-label={ariaLabel} $size={`${size}px`} $style={toStyle(sx)} />;
}

export function LinearProgress({ value = 0, sx }: ProgressProps) {
  return (
    <Box
      role='progressbar'
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={value}
      sx={{
        height: '6px',
        backgroundColor: '#e5e5e5',
        borderRadius: '999px',
        overflow: 'hidden',
        ...sx,
      }}
    >
      <Box
        sx={{
          height: '100%',
          width: `${Math.min(100, Math.max(0, value))}%`,
          backgroundColor: '#1a1a1a',
        }}
      />
    </Box>
  );
}

type CheckboxProps = React.ComponentProps<typeof BaseCheckbox>;

export function Checkbox(props: CheckboxProps) {
  return <BaseCheckbox {...props} />;
}

type RadioProps = React.ComponentProps<typeof BaseRadio>;

export function Radio(props: RadioProps) {
  return <BaseRadio {...props} />;
}

type RadioGroupProps = React.ComponentProps<typeof BaseRadioGroup>;

export function RadioGroup({ children, ...props }: RadioGroupProps) {
  const radioChildren = React.Children.map(children, (child) => {
    if (!React.isValidElement<FormControlLabelProps>(child) || child.type !== FormControlLabel) {
      return child;
    }

    const { control, label, value, sx } = child.props;
    if (!React.isValidElement<RadioProps>(control)) return child;

    const radioProps = control.props;
    return (
      <BaseRadio
        key={child.key ?? value ?? radioProps.value}
        {...radioProps}
        value={value ?? radioProps.value}
        overrides={{
          ...radioProps.overrides,
          Root: { style: toStyle(sx) },
        }}
      >
        {label}
      </BaseRadio>
    );
  });

  return <BaseRadioGroup {...props}>{radioChildren ?? []}</BaseRadioGroup>;
}

type FormControlLabelProps = {
  control: React.ReactNode;
  label: React.ReactNode;
  value?: string;
  sx?: SxProp;
};

type LabelControlProps = { children?: React.ReactNode; value?: string };

export function FormControlLabel({ control, label, value, sx }: FormControlLabelProps) {
  const labeledControl = React.isValidElement<LabelControlProps>(control)
    ? React.cloneElement(control, { children: label, ...(value === undefined ? {} : { value }) })
    : control;
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer', ...sx }}>
      {labeledControl}
    </Box>
  );
}

export function FormGroup({ children, sx }: BoxProps) {
  return <Box sx={{ display: 'flex', flexDirection: 'column', ...sx }}>{children}</Box>;
}

type ChipProps = {
  label: React.ReactNode;
  size?: 'small' | 'medium';
  color?: string;
  variant?: string;
};

export function Chip({ label, color = 'primary' }: ChipProps) {
  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        px: 1.25,
        py: 0.25,
        borderRadius: '999px',
        border: '1px solid #d5d5d5',
        color:
          color === 'primary' ? 'text.primary' : color === 'success' ? '#176b37' : 'text.secondary',
        fontSize: '0.75rem',
      }}
    >
      {label}
    </Box>
  );
}

type AvatarProps = { children?: React.ReactNode; sx?: SxProp };

export function Avatar({ children, sx }: AvatarProps) {
  return (
    <Box
      sx={{
        width: 48,
        height: 48,
        borderRadius: '50%',
        backgroundColor: '#e8e8e8',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        ...sx,
      }}
    >
      {children}
    </Box>
  );
}

export function Divider({ sx }: { sx?: SxProp }) {
  return <Block as='hr' $style={{ border: 0, borderTop: '1px solid #e0e0e0', ...toStyle(sx) }} />;
}

export function List({ children, sx, disablePadding }: BoxProps & { disablePadding?: boolean }) {
  return (
    <Box component='ul' sx={{ listStyle: 'none', p: disablePadding ? 0 : 1, m: 0, ...sx }}>
      {children}
    </Box>
  );
}

type ListItemProps = BoxProps & {
  disablePadding?: boolean;
  divider?: boolean;
  secondaryAction?: React.ReactNode;
};

export function ListItem({
  children,
  disablePadding,
  divider,
  secondaryAction,
  sx,
  ...props
}: ListItemProps) {
  return (
    <Box
      component='li'
      sx={{
        display: 'flex',
        alignItems: 'center',
        p: disablePadding ? 0 : 1,
        borderBottom: divider ? '1px solid #e0e0e0' : undefined,
        ...sx,
      }}
      {...props}
    >
      <Box sx={{ flex: 1, minWidth: 0 }}>{children}</Box>
      {secondaryAction}
    </Box>
  );
}

export function ListItemButton({
  children,
  onClick,
  selected,
}: Omit<BoxProps, 'onClick'> & { onClick?: BaseButtonProps['onClick']; selected?: boolean }) {
  return (
    <Button
      variant='text'
      fullWidth
      onClick={onClick}
      sx={{
        display: 'flex',
        justifyContent: 'flex-start',
        textAlign: 'left',
        px: 2,
        py: 1.5,
        backgroundColor: selected ? '#f0f0f0' : 'transparent',
      }}
    >
      {children}
    </Button>
  );
}

export function ListItemIcon({ children }: { children?: React.ReactNode }) {
  return <Box sx={{ display: 'inline-flex', alignItems: 'center', mr: 2 }}>{children}</Box>;
}

export function ListItemText({
  primary,
  secondary,
}: { primary: React.ReactNode; secondary?: React.ReactNode }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
      <Box>{primary}</Box>
      {secondary && <Box sx={{ fontSize: '0.875rem', color: 'text.secondary' }}>{secondary}</Box>}
    </Box>
  );
}

type ModalDialogProps = {
  open?: boolean;
  children?: React.ReactNode;
  onClose?: React.ComponentProps<typeof Modal>['onClose'];
  disableEscapeKeyDown?: boolean;
};

export function Dialog({ open, children, onClose, disableEscapeKeyDown }: ModalDialogProps) {
  return (
    <Modal
      isOpen={Boolean(open)}
      closeable={!disableEscapeKeyDown}
      onClose={onClose}
      size='min(560px, calc(100vw - 48px))'
      overrides={{ Root: { style: { zIndex: 1300 } } }}
    >
      <Box
        sx={{
          width: '100%',
          boxSizing: 'border-box',
          p: 3,
          borderRadius: '16px',
          backgroundColor: '#fff',
          boxShadow: '0 12px 40px rgba(0,0,0,0.2)',
        }}
      >
        {children}
      </Box>
    </Modal>
  );
}

export function DialogTitle({ children }: { children?: React.ReactNode }) {
  return (
    <Typography variant='h5' component='h2' sx={{ mb: 2 }}>
      {children}
    </Typography>
  );
}

export function DialogContent({ children }: { children?: React.ReactNode }) {
  return <Box sx={{ mb: 2 }}>{children}</Box>;
}

export function DialogContentText({ children, sx }: BoxProps) {
  return (
    <Typography variant='body2' sx={{ color: 'text.secondary', ...sx }}>
      {children}
    </Typography>
  );
}

export function DialogActions({ children }: { children?: React.ReactNode }) {
  return <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>{children}</Box>;
}
