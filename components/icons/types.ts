/**
 * Shared Icon Types
 * Common types and interfaces for all icon components
 */

import { ComponentProps } from 'react';

export interface IconProps extends ComponentProps<'svg'> {
  size?: number | string;
}

