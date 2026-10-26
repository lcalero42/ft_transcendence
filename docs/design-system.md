# Design System

UnderCover's visual identity is a dark violet night sky with purple accents
and colour-coded game states. Everything lives in the front, and paths below
are relative to `srcs/containers/front/front_data/src/`.

Design tokens are declared once in the Tailwind 4 `@theme` block of
`index.css`. Each `--color-x` token becomes the Tailwind classes `bg-x`,
`text-x`, `border-x`, `from-x`, and so on. **Use a token, never a raw hex
value.** To add a colour, add a token first.

## Colour palette

### Backgrounds and surfaces

| Token | Value | Example class | Used for |
|---|---|---|---|
| `bg-deep` → `bg-deep-end` | `#020221` → `#170e48` | `from-bg-deep to-bg-deep-end` | Page background gradient (`body`), drawers |
| `card` | `#17103c` | `bg-card` | Cards, badges, panels |
| `banner-bg` | `#141433` | `bg-banner-bg` | Lobby banner |
| `circle-bg` | `#45237f` | `bg-circle-bg` | Round badges (`circle-purple`) |
| `card-border` | `#26174e` | `border-card-border` | Card and badge borders |
| `card-border-2` | `#8d5adf4f` | `border-card-border-2` | Translucent separators |
| `card-accent-border` | `#8e5adf` | `border-card-accent-border` | Highlighted cards (room card, own avatar) |
| `grey-border` | `#3c3c52` | `border-grey-border` | Form inputs (`.input`) |
| `head-border` | `#928ea4` | `border-head-border` | Underline of the sticky bar on Profile and Admin |
| `start-gradient-start` → `-end` | `#fbeb54` → `#f5a623` | `from-start-gradient-start` | "Start the game" button |
| `meteor` | Tailwind `zinc-500` | `bg-meteor` | Shooting stars (`ui/meteors`) |

### Text

| Token | Value | Example class | Used for |
|---|---|---|---|
| (white) | `#ffffff` | `text-white` | Default text (`body`) |
| `gray-high` | `#e1d1fc` | `text-gray-high` | Labels, emphasised secondary text |
| `text-dim` | `#a1a1aa` | `text-text-dim` | Secondary text, timestamps |
| `gray-low` | `#695e83` | `text-gray-low` | Placeholders, disabled and inactive text |
| `stroke-accent` | `#a066f6` | `text-outline` | Outline stroke on accent titles |

### Accents

| Token | Value | Example class | Used for |
|---|---|---|---|
| `accent` | `#7860ff` | `bg-accent` | Primary actions |
| `accent-hover` | `#6c2bd9` | `hover:bg-accent-hover` | Hover state of primary actions |
| `accent-purple` | `#bc8df7` | `text-accent-purple` | Active tab, focus ring, highlights |
| `accent-orange` | `#f5a623` | `text-accent-orange` | Kick action, warning toasts |

### Game states

| Token | Value | Example class | Used for |
|---|---|---|---|
| `victory` | `#45e26d` | `text-victory` | Wins, online status, success toasts |
| `defeat` | `#f04c4c` | `text-defeat` | Losses, error toasts, destructive actions |
| `winrate` | `#fcc314` | `text-winrate` | Win rate stat, clue badges and log entries |
| `friends` | `#2ea0e1` | `bg-friends` | Friends stat, unread dot, info toasts |
| `games` | `#7e43f5` | `text-games` | Games-played stat |

### Game room

| Token | Value | Example class | Used for |
|---|---|---|---|
| `game-bg` | `#050721` | `bg-game-bg` | Game room backdrop (`GameView`) |
| `game-panel-border` | `#15113a` | `border-game-panel-border` | Chat and players panels, player circle rings |
| `game-circle-bg` | `#060c30` | `bg-game-circle-bg` | Inner disc of the player circle |
| `game-accent` | `#8b57fb` | `text-game-accent` | Centre arrow, aim and vote glow on avatars |
| `timer-bg` | `#0d0a2d` | `bg-timer-bg` | Timer card |
| `timer-border` | `#140f39` | `border-timer-border` | Timer card border |

### Roles

| Token | Value | Example class | Used for |
|---|---|---|---|
| `civilian` → `civilian-hover` | Tailwind `blue-400` → `blue-300` | `text-civilian` | Civilian words and wins (Admin) |
| `undercover` → `undercover-hover` | Tailwind `orange-400` → `orange-300` | `text-undercover` | Undercover words and wins (Admin) |

### shadcn/ui aliases

`ui/button` and `ui/toast` use shadcn's semantic names. Each one is an alias
of a project token, so change the token it points to, not the alias.

| Alias | Points to | Example class |
|---|---|---|
| `background` | `bg-deep` | `bg-background` |
| `foreground`, `primary-foreground`, `popover-foreground` | `white` | `text-foreground` |
| `primary` | `accent` | `bg-primary` |
| `secondary` | `card` | `bg-secondary` |
| `secondary-foreground` | `gray-high` | `text-secondary-foreground` |
| `muted` | `card-border` | `hover:bg-muted` |
| `muted-foreground` | `text-dim` | `text-muted-foreground` |
| `destructive` | `defeat` | `text-destructive` |
| `border` | `card-border-2` | `border-border` |
| `input` | `grey-border` | `border-input` |
| `ring` | `accent-purple` | `focus-visible:ring-ring/50` |

## Typography

| Role | Font | Where |
|---|---|---|
| Base | **Poppins** 300–700 (Google Fonts), token `font-poppins` | `body`, every page |
| Logo | **Jacquard 24** (`@fontsource/jacquard-24`), token `font-logo` | `Logo` only |

Fluid type scale (custom utilities in `index.css`, built on `clamp()` so text
follows the viewport between a minimum and a maximum):

| Utility | Size | Used for |
|---|---|---|
| `text-small` | `clamp(10px, 0.7vw, 17px)` | Captions, meta information |
| `text-body` | `clamp(12px, 0.85vw, 19px)` | Body text in cards |
| `text-title` | `clamp(16px, 1.3vw, 26px)` | Card and section titles |

Weights follow one convention: `font-medium` for subtle labels,
`font-semibold` for names and buttons, `font-bold` for titles and figures,
and `font-black` for game results.

## Icons

- **[lucide-react](https://lucide.dev/)** for every UI action (`LogOut`,
  `Copy`, `Ban`, `UserPlus`, `Users`, `Timer`, `MessageCircle`, `ShieldCheck`,
  `MoreVertical`…). They are SVG components that inherit `currentColor`, so
  a text token colours them.
- **Custom SVG icons** in `assets/icons/` for brand and game symbols:
  `google`, `discord`, `eye` / `eye-off`, `lock`, `user`, `check`, `pencil`,
  `gamepad`, `game`, `masks`, `victory`, `winrate`, `friend`,
  `calendar-time`, `users-group`, `brand-redhat`. They are rendered as CSS
  masks with the `mask-icon` utility, so a token colours them too:
  ```tsx
  <span
    className="mask-icon size-5 bg-accent-purple"
    style={{ maskImage: `url("${GoogleIcon}")`, WebkitMaskImage: `url("${GoogleIcon}")` }}
  />
  ```
  (pattern used in `SocialLogin`, `InputField`, `LinkProfile`).
- **Default avatar:** `assets/profile-photo/avatar-default.svg`, returned by
  `getAvatarUrl()` (`api/player.ts`) when a player has no avatar.

## Reusable components

Shared components live in `components/`. Page-specific ones stay in
`pages/<Page>/components/`.

| Component | Purpose | Main props |
|---|---|---|
| `AuthLayout` | Shell of the login, register and guest pages: heading, form, social login, footer | `heading`, `subtitle`, `icon`, `onSubmit`, `submitLabel`, `footer`, `showSocialLogin` |
| `FormField` | Labelled input with icon and error message | `id`, `label`, `iconSrc`, `type`, `value`, `onChange`, `error` |
| `InputField` | Input with leading icon and a show/hide toggle for passwords | `iconSrc`, `type`, `value`, `onChange` |
| `Divider` | Horizontal rule with a centred label ("or continue with") | `label` |
| `SocialLogin` | Google and Discord sign-in buttons | none |
| `Header` | Top bar: friends button, logo, language switcher, profile link | `compact`, `wide` |
| `Logo` | "UnderCover" logo linking home, in the logo font | `className` |
| `Title` | Large two-tone "UnderCover" title | none |
| `LanguageSwitcher` | Language picker with flags for en / fr / es | `className` |
| `LinkProfile` | Avatar and name linking to the profile | `name`, `avatarUrl` |
| `FriendsMenu` (+ `FriendListItem`, `RequestInput`, `RequestSection`…) | Friends side drawer: list, online status, requests | `FriendListItem`: `name`, `avatarUrl`, `isOnline`, `onRemove` |
| `Popup/Edit` | Animated modal with backdrop. Children receive a `handleClose` callback | `onClose`, `children(handleClose)` |
| `LoadPage` | Full-page loader with spinner and animated dots | `text` |
| `ErrorPage` | Full-page error message | `error` |
| `Layout` | App shell: shooting-star background and friends drawer | `children` |
| `Credit` | Footer credit line | none |
| `ShootingStars` | Animated background, hidden with `prefers-reduced-motion` | none |
| `ui/dashed-orbit` | Animated dashed orbit around the "create room" button | none |

These come from shadcn/ui, Base UI and Magic UI, restyled with the project
tokens:

| Component | Purpose |
|---|---|
| `ui/button` | Button with variants `default`, `outline`, `secondary`, `ghost`, `destructive`, `link` and sizes `xs`, `sm`, `default`, `lg`, `icon*` |
| `ui/toast` | Toast notifications (`toast.add({ type, title })`) |
| `ui/spinner` | Loading spinner |
| `ui/meteors` | Meteor animation used by `ShootingStars` |

### CSS components and utilities (`index.css`)

- **Layout:** `.page`, `.page-header`, `.page-main`
- **Surfaces:** `.card`, `.badge`, `.badge-action`
- **Forms:** `.input` (border `grey-border`, focus `accent-purple`)
- **Utilities:** `clean-link`, `clean-btn`, `hoverable` (colour
  transition), `circle-purple` (round badge), `text-outline`, `mask-icon`

Animations live in `styles/`: `glow`, `neon-orbit`, `dashed-orbit`,
`meteor`, `arrow-wobble`, `safe-reveal`.

## Rules

- Colours come from tokens. Add a token before using a new colour.
- For a translucent colour, add an opacity modifier to the token
  (`bg-victory/10`, `shadow-[0_0_18px_var(--color-victory)]/40`) instead of
  writing a hex with alpha.
- Text sizes use the fluid scale or Tailwind sizes, and weights follow the
  convention above.
- Icons are lucide-react, or an SVG in `assets/icons/` rendered with
  `mask-icon`.
- Reuse a shared component before writing a new one. Move a component to
  `components/` once a second page needs it.
- User-facing text goes through i18n (`t("...")`), in all three locales.
