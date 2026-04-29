# Fonts Setup Guide

This project uses Google Fonts for optimal performance and Vietnamese language support.

## Fonts Used

### Be Vietnam Pro
- **Purpose**: Vietnamese text (default)
- **Source**: Google Fonts
- **Weights**: 100-900 (all weights available)
- **Subsets**: Latin, Vietnamese

### Inter
- **Purpose**: English text
- **Source**: Google Fonts
- **Weights**: 100-900 (all weights available)
- **Subsets**: Latin

## Usage

### Default (Vietnamese)
By default, all text uses **Be Vietnam Pro**:

```tsx
// Vietnamese text (default)
<p>Chơi cờ tướng online</p>
```

### English Text
Use the `font-english` class or `lang="en"` attribute:

```tsx
// Using Tailwind class
<p className="font-english">Play Chinese Chess</p>

// Using lang attribute
<p lang="en">Play Chinese Chess</p>

// Using utility component
import { ENText } from '@/components/ui/FontWrapper';

<ENText>Play Chinese Chess</ENText>
```

### Vietnamese Text (explicit)
Use the `font-vietnamese` class or `lang="vi"` attribute:

```tsx
// Using Tailwind class
<p className="font-vietnamese">Chơi cờ tướng</p>

// Using lang attribute
<p lang="vi">Chơi cờ tướng</p>

// Using utility component
import { VNText } from '@/components/ui/FontWrapper';

<VNText>Chơi cờ tướng</VNText>
```

## Tailwind Classes

- `font-vietnamese` - Be Vietnam Pro (default)
- `font-english` - Inter
- `font-sans` - Be Vietnam Pro (default sans-serif)

## CSS Variables

Fonts are available as CSS variables:

```css
--font-be-vietnam-pro: Be Vietnam Pro variable
--font-inter: Inter variable
```

## Performance

Fonts are loaded using Next.js font optimization:
- Automatic font subsetting
- Font display swap for better performance
- Self-hosted fonts (via Next.js)
- No layout shift

## Examples

### Mixed Language Content

```tsx
<div>
  <VNText>Chơi cờ tướng online</VNText>
  <ENText>Play Chinese Chess</ENText>
</div>
```

### Conditional Font

```tsx
const isEnglish = locale === 'en';

<p className={isEnglish ? 'font-english' : 'font-vietnamese'}>
  {isEnglish ? 'Play Chess' : 'Chơi Cờ'}
</p>
```

### With utility components

```tsx
import { VNText, ENText } from '@/components/ui/FontWrapper';

<VNText>Tiếng Việt</VNText>
<ENText>English</ENText>
```

